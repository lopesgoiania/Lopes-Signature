import { bindCampaignForm } from '../lead-submit.mjs';
'use strict';
const plans={studio:{title:'Studio · 49,88 m²',description:'Ambientes integrados, ventilação natural no banho e infraestrutura de ar-condicionado. Final 03.'},'two-bed':{title:'2 quartos · 71,69 m²',description:'Dois quartos, sendo uma suíte. Persianas integradas nos dormitórios e infraestrutura de ar-condicionado no living e quartos. Final 07.'},suites:{title:'2 suítes · 77,79 m²',description:'Duas suítes e ventilação natural nos banhos. Infraestrutura de ar-condicionado no living e nas suítes. Final 02.'},'pool-suite':{title:'2 suítes · 97,26 m²',description:'Varanda com piscina e pé-direito duplo em parte do espaço. Configuração do final 05 em pavimentos específicos. Consulte disponibilidade.'}};
const tabs=[...document.querySelectorAll('[role=tab]')];
function choose(key){const plan=plans[key];tabs.forEach(t=>{const active=t.dataset.plan===key;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1});const img=document.getElementById('plan-image');img.src=`assets/plan-${key}.webp`;img.alt=`Planta: ${plan.title}`;document.getElementById('plan-full').href=img.src;document.getElementById('plan-title').textContent=plan.title;document.getElementById('plan-description').textContent=plan.description;document.getElementById('plan-panel').setAttribute('aria-labelledby',`tab-${key}`);document.getElementById('interest').value=key==='studio'?'Studio':key==='two-bed'?'2 quartos':key==='suites'?'2 suítes':'2 suítes com piscina'}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>choose(tab.dataset.plan));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i-1+tabs.length)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();choose(tabs[n].dataset.plan);tabs[n].focus()}})});
// International phone input is vendored locally: intl-tel-input 29.5.11 + libphonenumber.
const form = document.getElementById('lead-form');
const phone = document.getElementById('phone');
const internationalPhone = document.getElementById('phone-e164');
const countryField = document.getElementById('phone-country');
const phoneError = document.getElementById('phone-error');
const formStatus = document.getElementById('form-status');
const submitButton = form.querySelector('[type="submit"]');
let phoneInput;
let countryTouched = false;
let phoneTouched = false;

// Never persist personal information. Derived fields are cleared on every edit.
function clearPhoneValidation() {
  internationalPhone.value = '';
  countryField.value = '';
  phone.setCustomValidity('');
  phone.removeAttribute('aria-invalid');
  phoneError.textContent = '';
  formStatus.textContent = '';
}
function validatePhone() {
  clearPhoneValidation();
  if (!phoneInput || !phoneInput.isValidNumberPrecise()) {
    const message = phone.value.trim()
      ? 'Confira o número e o código de área para o país selecionado.'
      : 'Informe seu telefone com o código de área.';
    phone.setCustomValidity(message);
    phone.setAttribute('aria-invalid', 'true');
    phoneError.textContent = message;
    return false;
  }
  const number = phoneInput.getNumber(); // E.164, e.g. +5562999990000.
  if (!/^\+[1-9]\d{6,14}$/.test(number)) return false;
  internationalPhone.value = number;
  countryField.value = phoneInput.getSelectedCountry().iso2.toUpperCase();
  return true;
}

// Integration boundary: returns only validated data. No request is sent here.
function getValidatedPayload() {
  const phoneValid = validatePhone();
  if (!form.checkValidity() || !phoneValid) {
    form.reportValidity();
    return null;
  }
  return {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: internationalPhone.value,
    phone_country: countryField.value,
    interest: document.getElementById('interest').value,
    consent: form.elements.consent.checked,
    product: 'CITY WAY'
  };
}
window.cityWayLead = Object.freeze({ getValidatedPayload });
bindCampaignForm(form, 'city-way', () => phoneInput.promise.then(() => getValidatedPayload()));

if (typeof window.intlTelInput === 'function') {
  phoneInput = window.intlTelInput(phone, {
    initialCountry: 'br',
    countryNameLocale: 'pt-BR',
    countrySelectorMode: 'DROPDOWN',
    separateDialCode: true,
    formatAsYouType: true,
    strictMode: true,
    allowedNumberTypes: ['MOBILE', 'FIXED_LINE'],
    uiTranslations: {
      selectedCountryAriaLabel: 'Alterar país do telefone. Selecionado: ${countryName} (${dialCode})',
      noCountrySelected: 'Selecionar país do telefone',
      countryListAriaLabel: 'Países e códigos internacionais',
      searchPlaceholder: 'Buscar país ou DDI',
      clearSearchAriaLabel: 'Limpar busca',
      closeCountrySelectorAriaLabel: 'Fechar lista de países',
      searchEmptyState: 'Nenhum país encontrado',
      searchSummaryAria: count => `${count} países encontrados`
    }
  });
  submitButton.disabled = false;
  const wrapper = phone.closest('.iti');
  wrapper.addEventListener('pointerdown', () => { countryTouched = true; }, { once: true });
  wrapper.addEventListener('keydown', () => { countryTouched = true; }, { once: true });
  phone.addEventListener('input', () => { phoneTouched = true; clearPhoneValidation(); });
  phone.addEventListener('countrychange', clearPhoneValidation);
  phone.addEventListener('blur', () => { if (phone.value.trim()) validatePhone(); });

  // Country by IP only: no navigator.geolocation, cookies, or submitted form data.
  // Start with BR immediately. A late response never overwrites user interaction.
  async function detectCountry() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    try {
      const response = await fetch('/api/visitor-country', {
        signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store'
      });
      if (!response.ok) return;
      const country = String((await response.json()).country || '').toLowerCase();
      const supported = window.intlTelInput.getAllCountries().some(item => item.iso2 === country);
      if (supported && !countryTouched && !phoneTouched && !phone.value.trim()) {
        phoneInput.setSelectedCountry(country);
      }
    } catch (_) {
      // Brazil is already selected. Offline, timeout, blocked service and invalid codes are non-blocking.
    } finally { clearTimeout(timeout); }
  }
  detectCountry();
} else {
  formStatus.textContent = 'Não foi possível carregar o campo de telefone. Atualize a página para tentar novamente.';
}
const sticky=document.querySelector('.mobile-contact');if('IntersectionObserver' in window)new IntersectionObserver(entries=>{sticky.hidden=entries[0].isIntersecting},{threshold:.1}).observe(document.getElementById('contato'));
