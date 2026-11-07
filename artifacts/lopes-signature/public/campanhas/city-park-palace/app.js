import { submitCampaignLead } from '../lead-submit.mjs';
import { site } from './site-config.js';
import intlTelInput from './assets/phone/intlTelInput.mjs';
import portuguese from './assets/phone/pt.js';

const plans = {
  tipo: ['Planta tipo', '339,55 m²', '4 suítes · Hall privativo com dois elevadores', 11],
  opcao: ['Planta opção', '339,55 m²', '3 suítes · Uma alternativa de distribuição dos ambientes', 10],
  decorado: ['Decorado', '346,77 m²', '3 suítes · Sugestão de ambientação do decorado', 13],
  inferior: ['Duplex inferior', '340,06 m²', '52º pavimento', 14],
  superior: ['Duplex superior', '329,19 m²', '53º pavimento', 15],
};

const byId = (id) => document.getElementById(id);
const planSelect = byId('plan-select');
const planImage = byId('plan-image');
const planZoom = byId('plan-zoom');
const dialog = byId('plan-dialog');
const zoomImage = byId('zoom-image');

function updatePlan() {
  const [title, area, description, page] = plans[planSelect.value];
  byId('plan-title').textContent = title;
  byId('plan-area').textContent = area;
  byId('plan-description').textContent = description;
  planImage.src = `assets/planta-${page}.webp`;
  planImage.alt = `${title} do Palace, ${area}, ${description}`;
  planZoom.href = planImage.src;
}

planSelect.addEventListener('change', updatePlan);
updatePlan();

planZoom.addEventListener('click', (event) => {
  if (!dialog.showModal || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  zoomImage.src = planImage.src;
  zoomImage.alt = planImage.alt;
  byId('zoom-title').textContent = byId('plan-title').textContent;
  dialog.showModal();
  dialog.querySelector('.zoom-scroll').scrollTo(0, 0);
});
byId('zoom-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => planZoom.focus());

const form = byId('lead-form');
const phone = byId('phone');
const status = byId('form-status');
const phoneError = byId('phone-error');
const submit = form.querySelector('button[type="submit"]');
const campaign = new URLSearchParams(location.search);

const telephone = intlTelInput(phone, {
  initialCountry: 'br',
  countryNameLocale: 'pt',
  uiTranslations: portuguese,
  separateDialCode: true,
  showFlags: true,
  countrySearch: true,
  formatAsYouType: true,
  strictMode: true,
  allowedNumberTypes: null,
  allowNumberExtensions: false,
  countrySelectorMode: 'DROPDOWN',
  matchDropdownWidth: true,
});
let visitorInteracted = false;

function syncPhone() {
  const valid = telephone.isValidNumberPrecise() === true;
  byId('phone-e164').value = valid ? telephone.getNumber('E164') : '';
  byId('phone-country').value = telephone.getSelectedCountry()?.iso2.toUpperCase() || '';
}

function clearPhoneError() {
  phone.setCustomValidity('');
  phone.removeAttribute('aria-invalid');
  phoneError.textContent = '';
  status.textContent = '';
  syncPhone();
}

phone.addEventListener('input', () => {
  visitorInteracted = true;
  clearPhoneError();
});
phone.addEventListener('countrychange', clearPhoneError);
phone.closest('.iti').addEventListener('pointerdown', () => { visitorInteracted = true; });
phone.closest('.iti').addEventListener('keydown', () => { visitorInteracted = true; });

async function detectCountry() {
  try {
    const response = await fetch('/api/visitor-country', {
      signal: AbortSignal.timeout(3500),
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
    });
    if (!response.ok) return;
    const code = String((await response.json()).country || '').toLowerCase();
    const supported = intlTelInput.getAllCountries().some(country => country.iso2 === code);
    if (supported && !visitorInteracted && !phone.value) {
      telephone.setSelectedCountry(code);
      syncPhone();
    }
  } catch {
    // Brazil is selected before lookup. Network failures preserve that default.
  }
}
syncPhone();
detectCountry();

// The backend adapter can import this function. It returns validated E.164 data.
// The shared Signature adapter sends this payload only after validation.
export function prepareInquiry() {
  syncPhone();
  if (!form.reportValidity()) return null;
  if (!byId('phone-e164').value || telephone.getExtension()) {
    const message = 'Confira o país e informe um telefone completo, com código de área.';
    phone.setCustomValidity(message);
    phone.setAttribute('aria-invalid', 'true');
    phoneError.textContent = message;
    phone.reportValidity();
    return null;
  }
  const data = new FormData(form);
  const source = Object.fromEntries(site.campaignFields
    .filter(key => campaign.get(key))
    .map(key => [key, campaign.get(key).slice(0, 256)]));
  return {
    property: site.property,
    name: data.get('name').trim(),
    email: data.get('email').trim(),
    phone: byId('phone-e164').value,
    country: byId('phone-country').value,
    consent: data.get('consent') === 'on',
    source,
    plan: planSelect.value,
  };
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const inquiry = prepareInquiry();
  if (!inquiry) return;
  await submitCampaignLead(form, inquiry, 'city-park-palace');
});
form.addEventListener('input', () => { status.textContent = ''; });
submit.disabled = false;
