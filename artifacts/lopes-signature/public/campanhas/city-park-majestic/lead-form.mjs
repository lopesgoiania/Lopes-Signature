import { submitCampaignLead } from '../lead-submit.mjs';
import { createPhoneField } from './phone-field.mjs';

const form = document.querySelector('#lead-form');
const status = document.querySelector('#form-status');
const submit = form.querySelector('button[type="submit"]');
const name = form.elements.name;
let phoneField;
let ready = false;

// Cancel the native GET even if the telephone library fails to initialise.
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!ready || submit.disabled) return;
  submit.disabled = true;
  submit.setAttribute('aria-busy', 'true');
  status.textContent = '';
  try {
    const payload = await getLeadPayload();
    if (payload) {
      await submitCampaignLead(form, payload, 'city-park-majestic');
    }
  } catch {
    status.textContent = 'Não foi possível conferir o telefone. Recarregue a página e tente novamente.';
  } finally {
    submit.disabled = !ready;
    submit.removeAttribute('aria-busy');
  }
});

name.addEventListener('input', () => name.setCustomValidity(''));
form.addEventListener('input', () => { status.textContent = ''; });
form.addEventListener('change', () => { status.textContent = ''; });
form.addEventListener('reset', () => {
  status.textContent = '';
  name.setCustomValidity('');
});

/**
 * Backend integration entry point. Returns null when a field is invalid.
 * phone is a validated E.164 string, e.g. +5562991234567.
 * Submission uses the shared Signature adapter after validation.
 */
export async function getLeadPayload() {
  if (!phoneField) throw new Error('Telephone field unavailable');
  await phoneField.ready;
  name.setCustomValidity(name.value.trim() ? '' : 'Informe seu nome para continuar.');
  const phoneValid = phoneField.validate();
  if (!form.reportValidity() || !phoneValid) return null;
  return {
    product: 'City Park Majestic',
    name: name.value.trim(),
    email: form.elements.email.value.trim(),
    ...phoneField.getPayload(),
  };
}

try {
  phoneField = createPhoneField(form);
  await phoneField.ready;
  ready = true;
  submit.disabled = false;
} catch {
  status.textContent = 'Não foi possível carregar a validação do telefone. Recarregue a página e tente novamente.';
}

window.MajesticLeadForm = Object.freeze({ getPayload: getLeadPayload });
