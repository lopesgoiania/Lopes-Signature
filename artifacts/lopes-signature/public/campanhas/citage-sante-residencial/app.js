import { bindCampaignForm } from '../lead-submit.mjs';
import intlTelInput from './vendor/intl-tel-input/js/intlTelInputWithUtils.mjs';
import pt from './vendor/intl-tel-input/js/locale/pt.js';
const plans=[{file:'implantacao',title:'Seu projeto começa no terreno.',description:'São 268 lotes residenciais no projeto, com metragens a partir de 500 m². Escolha com a Lopes a posição e a área que fazem sentido para a casa que você deseja construir.',note:'A metragem é do terreno, não de uma casa construída. A compra está sujeita às regras construtivas e à documentação do empreendimento.',alt:'Implantação geral do Citàge Santé com lotes e áreas comuns'},{file:'clube-terreo',title:'Bem-estar perto de casa.',description:'Conheça a distribuição do térreo do Clube Santé: piscina com raia de 25 m, academia, pilates, saunas e espaços de cuidado.',note:'Planta oficial ilustrativa das áreas comuns. Consulte os itens de entrega no memorial descritivo.',alt:'Planta do térreo do Clube Santé com piscina e ambientes de bem-estar'},{file:'clube-superior',title:'Mais espaço para estar junto.',description:'O primeiro pavimento reúne salão de festas, sala de jogos, espaço kids e ambientes de convivência.',note:'Planta oficial ilustrativa das áreas comuns. Consulte os itens de entrega no memorial descritivo.',alt:'Planta do primeiro pavimento do Clube Santé com salão de festas e convivência'}];
const tabs=[...document.querySelectorAll('[role=tab]')];function choose(i,focus=false){const p=plans[i];tabs.forEach((t,n)=>{t.setAttribute('aria-selected',n===i);t.tabIndex=n===i?0:-1});document.querySelector('#plan-panel').setAttribute('aria-labelledby',tabs[i].id);const img=document.querySelector('#plan-image');img.src='assets/'+p.file+'.webp';img.alt=p.alt;document.querySelector('#plan-full').href=img.src;document.querySelector('#plan-title').textContent=p.title;document.querySelector('#plan-description').textContent=p.description;document.querySelector('#plan-note').textContent=p.note;if(focus)tabs[i].focus()};tabs.forEach((t,i)=>{t.addEventListener('click',()=>choose(i));t.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();choose(n,true)})});
const form=document.querySelector('#lead-form');
const phoneInput=document.querySelector('#phone');
const fullPhone=document.querySelector('#phone-full');
const countryInput=document.querySelector('#phone-country');
const phoneError=document.querySelector('#phone-error');
const status=document.querySelector('#form-status');
const submit=form.querySelector('[type=submit]');
const iti=intlTelInput(phoneInput,{
  initialCountry:'br',countryNameLocale:'pt-BR',uiTranslations:pt,
  countryOrder:['br','pt','us'],separateDialCode:true,
  numberDisplayFormat:'NATIONAL',formatAsYouType:true,strictMode:true,
  allowedNumberTypes:null,allowNumberExtensions:false,
});
let userInteracted=false;
phoneInput.addEventListener('input',()=>{userInteracted=true;clearPhoneError();syncPhone()});
phoneInput.addEventListener('pointerdown',()=>{userInteracted=true});
// A delayed IP response must never replace a visitor's manual selection.
phoneInput.closest('.iti').addEventListener('pointerdown',()=>{userInteracted=true});
phoneInput.closest('.iti').addEventListener('keydown',()=>{userInteracted=true});
phoneInput.addEventListener('countrychange',()=>{clearPhoneError();syncPhone()});
function clearPhoneError(){phoneInput.setCustomValidity('');phoneInput.removeAttribute('aria-invalid');phoneError.textContent='';fullPhone.value='';status.textContent=''}
function syncPhone(){const valid=iti.isValidNumberPrecise()===true;fullPhone.value=valid?iti.getNumber():'';countryInput.value=iti.getSelectedCountry()?.iso2||'br';return valid}
function validatePhone(){if(syncPhone())return true;const message='Confira o telefone e o código de área para o país selecionado.';phoneError.textContent=message;phoneInput.setCustomValidity(message);phoneInput.setAttribute('aria-invalid','true');return false}
phoneInput.addEventListener('blur',()=>{if(phoneInput.value.trim())validatePhone()});
// This lookup sends no form values, uses no browser geolocation and has a bounded timeout.
async function detectCountry(){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),3500);try{const response=await fetch('/api/visitor-country',{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw new Error('lookup');const result=await response.json();const country=String(result.country||'').toLowerCase();if(!intlTelInput.getAllCountries().some(item=>item.iso2===country))throw new Error('country');if(!userInteracted&&!phoneInput.value)iti.setSelectedCountry(country)}catch{/* Brasil remains selected when the lookup is unavailable. */}finally{clearTimeout(timer)}}
void detectCountry();
// The backend adapter will receive only validated E.164 in `phone`.
export function buildLeadPayload(){if(!validatePhone()||!form.reportValidity())return null;return {name:form.elements.namedItem('name').value.trim(),email:form.elements.namedItem('email').value.trim(),phone:fullPhone.value,country:countryInput.value,interest:form.elements.namedItem('interest').value,consent:form.elements.namedItem('consent').checked,product:'citage-sante-residencial'};}
bindCampaignForm(form, 'citage-sante-residencial', () => iti.promise.then(() => buildLeadPayload()));
const sticky=document.querySelector('.mobile-contact');if('IntersectionObserver'in window)new IntersectionObserver(entries=>{sticky.hidden=entries[0].isIntersecting},{threshold:.12}).observe(document.querySelector('#contato'));
