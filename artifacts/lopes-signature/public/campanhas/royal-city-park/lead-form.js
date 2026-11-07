import { submitCampaignLead } from '../lead-submit.mjs';
const countryEndpoint = '/api/visitor-country';
const attributionFields = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_id',
  'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid',
];

// Validated payload for the existing Signature lead backend.
export function buildLeadPayload(form, telephone) {
  if (!form.reportValidity()) return null;
  const number = telephone.getNumber('E164');
  if (!telephone.isValidNumberPrecise() || telephone.getExtension() || !/^\+[1-9]\d{6,14}$/.test(number)) {
    const phone = form.querySelector('#phone');
    phone.setCustomValidity('Confira o país e informe um telefone válido com código de área.');
    phone.setAttribute('aria-invalid', 'true');
    phone.reportValidity();
    return null;
  }

  const country = telephone.getSelectedCountry().iso2.toUpperCase();
  form.querySelector('input[name="phone"]').value = number;
  form.elements.country.value = country;
  const values = new FormData(form);
  const query = new URLSearchParams(location.search);
  const attribution = Object.fromEntries(attributionFields
    .filter(field => query.get(field))
    .map(field => [field, query.get(field).slice(0, 512)]));

  return {
    name: values.get('name').trim(),
    email: values.get('email').trim(),
    phone: number,
    country,
    consent: values.get('consent') === 'on',
    product: 'royal-city-park',
    landing_path: location.pathname,
    attribution,
  };
}

export function initialiseLeadForm() {
  const form = document.getElementById('lead-form');
  const phone = document.getElementById('phone');
  const status = document.getElementById('form-status');
  const submit = form.querySelector('button[type=submit]');
  let telephone;

  // Always prevent native submission, including dependency failures.
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!telephone) return;
    const payload = buildLeadPayload(form, telephone);
    if (!payload) return;
    await submitCampaignLead(form, payload, 'royal-city-park');
  });
  form.addEventListener('input', () => {
    phone.setCustomValidity('');
    phone.removeAttribute('aria-invalid');
    form.querySelector('input[name="phone"]').value = '';
    form.elements.country.value = '';
    status.textContent = '';
  });

  if (!window.intlTelInput?.utils) {
    status.textContent = 'O campo de telefone não carregou. Atualize a página para tentar novamente.';
    return;
  }

  telephone = window.intlTelInput(phone, {
    initialCountry: 'br',
    countrySelectorMode: window.matchMedia('(max-width: 680px)').matches ? 'FULLSCREEN' : 'DROPDOWN',
    countryNameLocale: 'pt-BR',
    countryOrder: ['br', 'pt', 'us', 'gb'],
    countrySearch: true,
    showFlags: true,
    separateDialCode: true,
    numberDisplayFormat: 'NATIONAL',
    formatAsYouType: true,
    strictMode: true,
    strictRejectAnimation: false,
    allowedNumberTypes: null,
    allowNumberExtensions: false,
    placeholderNumberPolicy: 'AGGRESSIVE',
    uiTranslations: {
      selectedCountryAriaLabel: 'Alterar país do telefone. País atual ${countryName} (${dialCode})',
      searchPlaceholder: 'Buscar país ou DDI',
      clearSearchAriaLabel: 'Limpar busca',
      closeCountrySelectorAriaLabel: 'Fechar lista de países',
      countryListAriaLabel: 'Países e códigos internacionais',
      noCountrySelected: 'Selecione um país',
      searchEmptyState: 'Nenhum país encontrado',
      searchSummaryAria: count => count + ' países encontrados',
    },
  });
  submit.disabled = false;

  const controller = new AbortController();
  let visitorHasInteracted = Boolean(phone.value);
  phone.addEventListener('input', () => {
    visitorHasInteracted = true;
  });
  phone.addEventListener('countrychange', () => {
    visitorHasInteracted = true;
    phone.setCustomValidity('');
    phone.removeAttribute('aria-invalid');
    form.querySelector('input[name="phone"]').value = '';
    form.elements.country.value = '';
    status.textContent = '';
  });

  // Same-origin country lookup, without contact fields or browser geolocation.
  const timeout = setTimeout(() => controller.abort(), 3500);
  fetch(countryEndpoint, {
    signal: controller.signal,
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    cache: 'no-store',
  })
    .then(response => {
      if (!response.ok) throw new Error('Country lookup failed');
      return response.json();
    })
    .then(data => {
      const country = typeof data.country === 'string' ? data.country.toLowerCase() : '';
      const supported = window.intlTelInput.getAllCountries().some(item => item.iso2 === country);
      if (!visitorHasInteracted && !phone.value && supported) {
        telephone.setSelectedCountry(country);
      }
    })
    .catch(() => {
      // Brazil is selected synchronously and remains available on every failure.
    })
    .finally(() => clearTimeout(timeout));
}
