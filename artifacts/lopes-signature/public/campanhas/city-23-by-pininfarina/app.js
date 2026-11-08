import { bindCampaignForm } from '../lead-submit.mjs';
import intlTelInput from './vendor/intl-tel-input/js/intlTelInputWithUtils.mjs';
import pt from './vendor/intl-tel-input/js/locale/pt.js';
'use strict';
const residences={308:{title:'308 m² · 4 suítes',image:'308',price:'R$ 6.001.881',unit:'308 m² privativos · unidade 2700',description:'Quatro suítes, piscina privativa e dois elevadores privativos. Um andar inteiro para organizar a vida no seu ritmo.',note:'Piscina privativa e a privacidade de uma residência por andar. Consulte a configuração disponível para esta unidade.'},547:{title:'547 m² · 4 suítes',image:'543',price:'R$ 12.047.785',unit:'547 m² privativos · unidade 500',description:'Quatro suítes, varanda gourmet e piscina privativa. Ambientes amplos para receber e compartilhar os momentos em família.',note:'Consulte as condições da unidade 500, a configuração atual e os itens incluídos na aquisição.'}};
const tabs=[...document.querySelectorAll('[role=tab]')];
function choose(size){const data=residences[size];tabs.forEach(t=>{const active=t.dataset.size===String(size);t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1});const image=document.getElementById('plan-image');image.src=`assets/planta-${data.image}.webp`;image.alt=`Planta oficial: ${data.title}. Configuração ilustrativa a confirmar para a unidade.`;const link=document.getElementById('plan-open');link.href=image.src;link.setAttribute('aria-label',`Abrir planta ${data.title} em tamanho maior`);document.querySelector('#plan-panel h3').textContent=data.title;document.getElementById('price').textContent=data.price;document.getElementById('unit-label').textContent=data.unit;document.getElementById('plan-description').textContent=data.description;document.getElementById('plan-note').textContent=data.note;document.getElementById('interest').value=size;document.getElementById('plan-panel').setAttribute('aria-labelledby',`tab${size}`)}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>choose(tab.dataset.size));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();choose(tabs[next].dataset.size);tabs[next].focus()}})});
const form=document.getElementById('lead-form');
const phone=document.getElementById('phone');
const phoneError=document.getElementById('phone-error');
const e164=document.getElementById('phone-e164');
const countryField=document.getElementById('phone-country');
const telephone=intlTelInput(phone,{
  initialCountry:'br',countryOrder:['br','pt','us'],countryNameLocale:'pt',uiTranslations:pt,
  separateDialCode:true,formatAsYouType:true,strictMode:true,strictRejectAnimation:false,
  allowedNumberTypes:null,showFlags:true,countrySearch:true,countrySelectorMode:'DROPDOWN'
});
let visitorInteracted=false;
phone.addEventListener('input',()=>{visitorInteracted=true;clearPhoneError();syncPhone()});
phone.closest('.iti').addEventListener('pointerdown',()=>{visitorInteracted=true});
phone.closest('.iti').addEventListener('keydown',()=>{visitorInteracted=true});
phone.addEventListener('countrychange',()=>{clearPhoneError();syncPhone()});
function clearPhoneError(){phone.setCustomValidity('');phone.removeAttribute('aria-invalid');phoneError.textContent='';e164.value=''}
function syncPhone(){
  countryField.value=telephone.getSelectedCountry()?.iso2||'br';
  e164.value=telephone.isValidNumberPrecise()?telephone.getNumber('E164'):'';
}
// Country only: no browser geolocation, credentials, lead data or IP persistence.
async function suggestCountry(){
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),3500);
  try{
    const response=await fetch('/api/visitor-country',{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});
    if(!response.ok)throw new Error('Country lookup failed');
    const data=await response.json();const code=String(data.country||'').toLowerCase();
    if(!/^[a-z]{2}$/.test(code)||!intlTelInput.getAllCountries().some(country=>country.iso2===code))throw new Error('Unknown country');
    if(!visitorInteracted&&!phone.value.trim()){telephone.setSelectedCountry(code);syncPhone()}
  }catch{/* Brazil remains selected, and manual selection always works. */}
  finally{clearTimeout(timeout)}
}
syncPhone();suggestCountry();form.querySelector('button[type=submit]').disabled=false;
// Backend handoff: canonical E.164 number, never a locally formatted string.
export function getLeadPayload(){
  syncPhone();
  if(!telephone.isValidNumberPrecise()||!/^\+[1-9]\d{1,14}$/.test(e164.value)){
    const message='Confira o número e o código de área para o país selecionado.';
    phone.setCustomValidity(message);phone.setAttribute('aria-invalid','true');phoneError.textContent=message;phone.reportValidity();throw new Error('INVALID_PHONE');
  }
  if(!form.reportValidity())throw new Error('INVALID_FORM');
  return {name:form.elements.name.value.trim(),email:form.elements.email.value.trim(),phone:e164.value,phone_country:countryField.value,interest:form.elements.interest.value,consent:form.elements.consent.checked,product:'CITY 23 BY PININFARINA'};
}
bindCampaignForm(form, 'city-23-by-pininfarina', () => getLeadPayload());
const sticky=document.querySelector('.mobile-contact');if('IntersectionObserver' in window)new IntersectionObserver(entries=>{sticky.hidden=entries[0].isIntersecting},{threshold:.1}).observe(document.getElementById('contato'));
