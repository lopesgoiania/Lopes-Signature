import { bindCampaignForm } from '../lead-submit.mjs';
'use strict';
// Project configurations, not a promise of executed layout or availability.
const plans={
 house3:{image:'plan-270-3.webp',title:'Legacy House',area:'270 m² nominais · 3 suítes',description:'Área social ampla, cozinha e um setor íntimo com três suítes. Uma configuração para acomodar convivência e privacidade.',features:['Living com espaço para estar e jantar','Suíte master com closet','Cozinha e área de serviço']},
 house4:{image:'plan-270-4.webp',title:'Legacy House',area:'270 m² nominais · 4 suítes',description:'Uma suíte a mais para acomodar diferentes momentos da família. Compare a distribuição dos ambientes com a versão de três suítes.',features:['Quatro suítes no projeto','Living com estar e jantar','Cozinha e área de serviço']},
 pool3:{image:'plan-300-3.webp',title:'Side Pool House',area:'300 m² nominais · 3 suítes',description:'Terraço e piscina privativa nesta configuração do projeto. Uma forma de trazer o lazer para dentro de casa, com três suítes no setor íntimo.',features:['Terraço com piscina privativa nesta planta','Suíte master com closet','Living e espaço de jantar']}
};
const tabs=[...document.querySelectorAll('[role=tab]')];
function choose(key){
 const plan=plans[key];if(!plan)return;
 tabs.forEach(tab=>{const active=tab.dataset.plan===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1});
 const image=document.getElementById('plan-image');image.src=`assets/${plan.image}`;image.alt=`Planta humanizada do projeto ${plan.title}, ${plan.area}`;
 document.getElementById('plan-enlarge').href=image.src;
 document.getElementById('plan-title').textContent=plan.title;
 document.getElementById('plan-area').textContent=plan.area;
 document.getElementById('plan-description').textContent=plan.description;
 document.getElementById('plan-features').replaceChildren(...plan.features.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));
 document.getElementById('plan-panel').setAttribute('aria-labelledby',`tab-${key}`);
 document.getElementById('plan-cta').dataset.plan=key;
}
tabs.forEach((tab,i)=>{
 tab.addEventListener('click',()=>choose(tab.dataset.plan));
 tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(i+1)%tabs.length;if(event.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();choose(tabs[next].dataset.plan);tabs[next].focus()}});
});
document.getElementById('plan-cta').addEventListener('click',event=>{document.getElementById('interest').value=event.currentTarget.dataset.plan||'house3'});
const form=document.getElementById('lead-form');
const phone=document.getElementById('phone');
const email=document.getElementById('email');
const phoneE164=document.getElementById('phone-e164');
const phoneCountry=document.getElementById('phone-country');
const phoneError=document.getElementById('phone-error');
let telephone=null;
let countryTouched=false;
let applyingDetectedCountry=false;
let phoneReady=false;

function invalidatePhone(){
 phone.setCustomValidity('');phone.removeAttribute('aria-invalid');
 phoneError.textContent='';phoneE164.value='';phoneCountry.value='';
 document.getElementById('form-status').textContent='';
}

async function detectCountry(){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),2500);
 try{
  const response=await fetch('/api/visitor-country',{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
  if(!response.ok)throw new Error('Country lookup unavailable');
  const country=String((await response.json()).country || '').toLowerCase();
  if(!window.intlTelInput.getAllCountries().some(item=>item.iso2===country))throw new Error('Unsupported country');
  return country;
 }catch{return 'br'}finally{clearTimeout(timeout)}
}

if(window.intlTelInput){
 telephone=window.intlTelInput(phone,{
  initialCountry:'br',countryOrder:['br','pt','us','ar','gb'],
  separateDialCode:true,showFlags:true,countrySearch:true,
  countrySelectorMode:'DROPDOWN',countryNameLocale:'pt',
  numberDisplayFormat:'NATIONAL',formatAsYouType:true,strictMode:true,
  allowedNumberTypes:['MOBILE','FIXED_LINE','FIXED_LINE_OR_MOBILE'],
  allowNumberExtensions:false,
  uiTranslations:{
   selectedCountryAriaLabel:'Alterar país. Selecionado: ${countryName} (${dialCode})',
   noCountrySelected:'Selecionar país',countryListAriaLabel:'Lista de países',
   searchPlaceholder:'Buscar país ou código',clearSearchAriaLabel:'Limpar busca',
   closeCountrySelectorAriaLabel:'Fechar',searchEmptyState:'Nenhum país encontrado',
   searchSummaryAria:count=>`${count} países encontrados`
  }
 });
 telephone.promise.then(()=>{phoneReady=true}).catch(()=>{
  phoneError.textContent='Não foi possível carregar a validação. Atualize a página para tentar novamente.';
 });
 phone.addEventListener('countrychange',()=>{if(!applyingDetectedCountry)countryTouched=true;invalidatePhone()});
 // A manual choice or entered number always wins over a late IP response.
 detectCountry().then(country=>{
  if(countryTouched||phone.value.trim())return;
  applyingDetectedCountry=true;telephone.setSelectedCountry(country);applyingDetectedCountry=false;
 });
}else{
 phoneError.textContent='Não foi possível carregar o telefone. Atualize a página para tentar novamente.';
}
phone.addEventListener('input',()=>{countryTouched=true;invalidatePhone()});

function getLeadPayload(){
 invalidatePhone();
 const name=document.getElementById('name');
 name.value=name.value.trim();email.value=email.value.trim();
 name.setCustomValidity(name.value?'':'Informe seu nome.');
 if(!phoneReady||!telephone){phone.setCustomValidity('A validação do telefone ainda não está pronta. Aguarde ou atualize a página.');}
 else if(!telephone.isValidNumberPrecise()){
  phone.setCustomValidity('Confira o país e informe um telefone válido com código de área.');
 }
 if(phone.validationMessage){
  phoneError.textContent=phone.validationMessage;phone.setAttribute('aria-invalid','true');
 }
 if(!form.reportValidity())return null;
 const normalized=telephone.getNumber('E164');
 if(!/^\+[1-9]\d{1,14}$/.test(normalized))return null;
 const country=telephone.getSelectedCountry();
 phoneE164.value=normalized;phoneCountry.value=country.iso2.toUpperCase();
 return {name:name.value,email:email.value,phone:normalized,phone_country:phoneCountry.value,
  phone_dial_code:`+${country.dialCode}`,interest:document.getElementById('interest').value,
  consent:form.elements.consent.checked,product:'LEGACY CITY HOME'};
}
// Integration boundary: validated data only; this preview does not transmit it.
window.LegacyLead=Object.freeze({getPayload:getLeadPayload});
bindCampaignForm(form, 'legacy-city-home', () => getLeadPayload());
document.getElementById('name').addEventListener('input',event=>event.target.setCustomValidity(''));
email.addEventListener('input',()=>{document.getElementById('form-status').textContent=''});
const sticky=document.querySelector('.mobile-contact');
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{sticky.hidden=entries[0].isIntersecting},{threshold:0}).observe(document.getElementById('contato'));
