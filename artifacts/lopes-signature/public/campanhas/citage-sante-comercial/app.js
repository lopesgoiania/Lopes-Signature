import { bindCampaignForm } from '../lead-submit.mjs';
import pt from '/campanhas/citage-sante-residencial/vendor/intl-tel-input/js/locale/pt.js';
'use strict';
const plans = {
  '762': {price:'R$ 3.091.343', description:'Opções na quadra 24: lotes 4, 5, 7 e 8. Na quadra 25: lotes 3, 4 e 8.'},
  '768': {price:'R$ 3.506.985', description:'Quadra 25: lotes 20, 21 e 22 a partir de R$ 3.506.985. Lote 15: R$ 3.701.818.'}
};
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectPlan(tab, focus = false) {
  const size = tab.dataset.size, plan = plans[size];
  tabs.forEach(t => {t.setAttribute('aria-selected',String(t === tab)); t.tabIndex = t === tab ? 0 : -1;});
  document.getElementById('size').textContent = size;
  document.getElementById('price').textContent = plan.price;
  document.getElementById('plan-description').textContent = plan.description;
  document.getElementById('plan-panel').setAttribute('aria-labelledby',tab.id);
  document.getElementById('plan-cta').innerHTML = `Consultar os lotes de ${size} m² <span aria-hidden="true">↗</span>`;
  if(focus) tab.focus();
}
tabs.forEach((tab,index) => {
  tab.addEventListener('click',()=>selectPlan(tab));
  tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight') next=(index+1)%tabs.length;
    if(event.key==='ArrowLeft') next=(index-1+tabs.length)%tabs.length;
    if(event.key==='Home') next=0;
    if(event.key==='End') next=tabs.length-1;
    if(next!==undefined){event.preventDefault();selectPlan(tabs[next],true);}
  });
});
const contact=document.getElementById('contato'), mobileCTA=document.querySelector('.mobile-contact');
if('IntersectionObserver' in window) new IntersectionObserver(entries=>{mobileCTA.hidden=entries[0].isIntersecting;},{threshold:0.08}).observe(contact);

// Phone metadata and flag sprites are served locally (intl-tel-input 29.5.11).
// Only the IP country lookup leaves this origin; it receives no form values.
const form = document.getElementById('lead-form');
const phone = document.getElementById('phone');
const phoneError = document.getElementById('phone-error');
const phoneE164 = document.getElementById('phone-e164');
const phoneCountry = document.getElementById('phone-country');
const status = document.getElementById('form-status');
let phoneControl = null;
let phoneTouched = false;
let countryChosen = false;
let settingDetectedCountry = false;
let validationReady = false;

function clearPhoneResult() {
  phoneE164.value = '';
  phoneCountry.value = '';
  phone.setCustomValidity('');
  phone.removeAttribute('aria-invalid');
  phoneError.textContent = '';
  status.textContent = '';
}
function validatePhone(showError = false) {
  clearPhoneResult();
  const valid = validationReady && phoneControl?.isValidNumberPrecise() === true;
  if (valid) {
    const number = phoneControl.getNumber('E164');
    if (/^\+[1-9]\d{1,14}$/.test(number)) {
      phoneE164.value = number;
      phoneCountry.value = phoneControl.getSelectedCountry()?.iso2?.toUpperCase() || '';
      return true;
    }
  }
  if (showError) {
    const message = !validationReady
      ? 'Não foi possível carregar a validação do telefone. Recarregue a página para tentar novamente.'
      : 'Confira o país e digite um telefone válido com código de área.';
    phoneError.textContent = message;
    phone.setCustomValidity(message);
    phone.setAttribute('aria-invalid', 'true');
  }
  return false;
}

if (typeof window.intlTelInput === 'function') {
  phoneControl = window.intlTelInput(phone, {
    initialCountry: 'br',
    countryOrder: ['br','pt','us'],
    countryNameLocale: 'pt-BR',
    uiTranslations: pt,
    countrySelectorMode: 'AUTO',
    countrySearch: true,
    separateDialCode: true,
    showFlags: true,
    numberDisplayFormat: 'NATIONAL',
    formatAsYouType: true,
    strictMode: true,
    strictRejectAnimation: false,
    allowedNumberTypes: ['MOBILE','FIXED_LINE'],
    placeholderNumberType: 'MOBILE',
    allowNumberExtensions: false
  });
}
phone.addEventListener('input', () => { phoneTouched = true; clearPhoneResult(); validatePhone(); });
phone.addEventListener('blur', () => { if (phone.value.trim()) validatePhone(true); });
phone.addEventListener('countrychange', () => {
  if (!settingDetectedCountry) countryChosen = true;
  clearPhoneResult();
  if (phone.value.trim()) validatePhone();
});
// Also respect a manual choice of the already-selected country while lookup is pending.
form.addEventListener('pointerdown', event => {
  if (event.target.closest('.iti__country, .iti__selected-country')) countryChosen = true;
});
form.addEventListener('keydown', event => {
  if (event.target.closest('.iti__selected-country, .iti__country-list')) countryChosen = true;
});

const phoneReady = phoneControl ? phoneControl.promise.then(() => {
  validationReady = true;
  if (phone.value.trim()) validatePhone();
  return true;
}).catch(() => false) : Promise.resolve(false);

async function detectCountry() {
  if (!phoneControl) return;
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 3500);
  try {
    const response = await fetch('/api/visitor-country', {
      signal: abort.signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store'
    });
    if (!response.ok) throw new Error('Country lookup unavailable');
    const data = await response.json();
    const iso2 = typeof data.country === 'string' ? data.country.trim().toLowerCase() : ''; 
    const supported = window.intlTelInput.getAllCountries().some(country => country.iso2 === iso2);
    if (supported && !phoneTouched && !countryChosen && !phone.value.trim()) {
      settingDetectedCountry = true;
      phoneControl.setSelectedCountry(iso2);
      settingDetectedCountry = false;
    }
  } catch {
    // Brasil is already selected. Never overwrite a manual selection or typed number.
  } finally {
    clearTimeout(timer);
  }
}
void detectCountry();

// Integration contract: only returns validated, normalized contact values.
// A future backend adapter should call this method and revalidate server-side.
async function getValidatedPayload() {
  await phoneReady;
  if (!validatePhone(true)) {
    phone.reportValidity();
    phone.focus();
    return null;
  }
  if (!form.reportValidity()) return null;
  return {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    phone_e164: phoneE164.value,
    phone_country: phoneCountry.value,
    interest: form.elements.interest.value,
    consent: form.elements.consent.checked,
    product: 'CITÀGE SANTÉ COMERCIAL'
  };
}
window.LopesLeadForm = Object.freeze({getValidatedPayload});
bindCampaignForm(form, 'citage-sante-comercial', () => getValidatedPayload());
