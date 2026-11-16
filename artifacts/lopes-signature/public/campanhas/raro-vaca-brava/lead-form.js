import { bindCampaignForm } from '../lead-submit.mjs';
import { lookupVisitorCountry } from '../visitor-country.mjs';
import intlTelInput from './vendor/intl-tel-input/intlTelInput.mjs';
import uiTranslations from './vendor/intl-tel-input/pt.mjs';
const form = document.getElementById('lead-form');
const phone = document.getElementById('phone');
const error = document.getElementById('phone-error');
const normalized = document.getElementById('phone-e164');
const countryField = document.getElementById('phone-country');
const status = document.getElementById('form-status');
let touched = false;
export const telephone = intlTelInput(phone, {
  initialCountry: 'br', countryNameLocale: 'pt', uiTranslations,
  countryOrder: ['br','pt','us'], separateDialCode: true,
  formatAsYouType: true, strictMode: true, allowedNumberTypes: null,
  numberDisplayFormat: 'NATIONAL', countrySelectorMode: 'DROPDOWN',
});
const ready = telephone.promise;
function clearValidation(){ normalized.value=''; countryField.value=''; phone.setCustomValidity('');phone.removeAttribute('aria-invalid'); error.textContent=''; }
phone.addEventListener('input',()=>{touched=true;clearValidation()});
phone.addEventListener('countrychange',clearValidation);
// A late IP response must never overwrite a visitor's own country or typed number.
phone.parentElement.addEventListener('pointerdown',()=>{touched=true});
phone.parentElement.addEventListener('keydown',()=>{touched=true});
async function suggestCountry(){
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),3000);
  try {
    const country=(await lookupVisitorCountry({signal:controller.signal})).toLowerCase();
    const supported=intlTelInput.getAllCountries().some(c=>c.iso2===country);
    if(!touched&&!phone.value) telephone.setSelectedCountry(supported?country:'br');
  } catch { if(!touched&&!phone.value) telephone.setSelectedCountry('br'); }
  finally { clearTimeout(timeout); }
}
suggestCountry();
export async function getLeadPayload(){
  await ready;
  clearValidation();
  if(!telephone.isValidNumberPrecise()){
    const message='Confira o país, o código de área e o número de telefone.';
    phone.setCustomValidity(message);phone.setAttribute('aria-invalid','true');error.textContent=message;
    phone.reportValidity();return null;
  }
  if(!form.reportValidity()) return null;
  const e164=telephone.getNumber('E164');
  if(!/^\+[1-9]\d{6,14}$/.test(e164)) return null;
  normalized.value=e164;countryField.value=telephone.getSelectedCountry().iso2.toUpperCase();
  return { name:form.elements.name.value.trim(),email:form.elements.email.value.trim(),phone:e164,phone_country:countryField.value,interest:form.elements.interest.value,consent:form.elements.consent.checked,development:'RARO VACA BRAVA',source:'landing-page-raro-vaca-brava' };
}
bindCampaignForm(form, 'raro-vaca-brava', getLeadPayload);
form.addEventListener('reset',()=>{touched=false;clearValidation();telephone.setSelectedCountry('br')});
