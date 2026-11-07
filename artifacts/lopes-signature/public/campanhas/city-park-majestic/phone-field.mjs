import {lookupCountry} from './country-lookup.mjs';
import pt from './vendor/intl-tel-input/js/pt.js';

export function formatBrazilian(value) {
  if(value.trim().startsWith('+'))return value;
  const digits=value.replace(/\D/g,'');
  if(digits.length>11)return value;
  if(!digits)return '';
  if(digits.length<=2)return '('+digits;
  const local=digits.slice(2),split=local.length>8?5:4;
  return '('+digits.slice(0,2)+') '+(local.length>split?local.slice(0,split)+'-'+local.slice(split):local);
}

export function createPhoneField(form=document.getElementById('form'), dropdownParent=form.closest('dialog') || form) {
  const phone=form.elements.phone_national;
  const error=form.querySelector('.field-error');
  const normalized=form.querySelector('[name="phone"]');
  const country=form.elements.phone_country;
  const dial=form.elements.phone_dial_code;
  const factory=window.intlTelInput;
  if(typeof factory!=='function')throw new Error('A biblioteca de telefone não carregou.');
  const iti=factory(phone,{
    initialCountry:'br',countryOrder:['br','us','gb','pt','fr','es'],
    countryNameLocale:'pt-BR',countrySelectorMode:'DROPDOWN',dropdownParent,matchDropdownWidth:true,
    separateDialCode:true,numberDisplayFormat:'NATIONAL',
    placeholderNumberPolicy:'AGGRESSIVE',placeholderNumberType:'MOBILE',
    customPlaceholder:(example,data)=>data?.iso2==='br'?'(11) 96123-4567':example,
    strictMode:true,strictRejectAnimation:false,formatAsYouType:true,
    allowedNumberTypes:null,allowNumberExtensions:false,
    uiTranslations:{...pt,searchPlaceholder:'Pesquisar país ou DDI',noCountrySelected:'Selecionar país',countryListAriaLabel:'Países',selectedCountryAriaLabel:'Alterar país do telefone: ${countryName} (${dialCode})',clearSearchAriaLabel:'Limpar pesquisa',closeCountrySelectorAriaLabel:'Fechar',searchEmptyState:'Nenhum país encontrado'}
  });
  let interacted=false;
  let applyingCountry=false;
  const ready=Promise.resolve(iti.promise);
  function clear() {
    phone.setCustomValidity('');phone.removeAttribute('aria-invalid');error.textContent='';
    normalized.value='';country.value='';if(dial)dial.value='';
  }
  function valid() {return iti.isValidNumberPrecise()&&!iti.getExtension()&&/^\+[1-9]\d{6,14}$/.test(iti.getNumber());}
  function sync() {
    if(valid()) {
      normalized.value=iti.getNumber();country.value=iti.getSelectedCountry().iso2.toUpperCase();
      if(dial)dial.value='+'+iti.getSelectedCountry().dialCode;
    }
  }
  function validate() {
    clear();
    if(!valid()) {
      const message='Confira o telefone e o país selecionado. Inclua o DDD ou código de área.';
      phone.setCustomValidity(message);phone.setAttribute('aria-invalid','true');error.textContent=message;return false;
    }
    sync();return true;
  }
  for(const event of ['pointerdown','keydown','focusin'])phone.closest('.iti').addEventListener(event,()=>{interacted=true;});
  phone.addEventListener('input',()=>{
    interacted=true;
    if(iti.getSelectedCountry().iso2==='br') {
      const old=phone.value,position=phone.selectionStart??old.length;
      const digitsBefore=old.slice(0,position).replace(/\D/g,'').length;
      const formatted=formatBrazilian(old);
      if(old!==formatted) {
        phone.value=formatted;
        let cursor=0,count=0;
        while(cursor<formatted.length&&count<digitsBefore){if(/\d/.test(formatted[cursor]))count++;cursor++;}
        if(position===old.length)cursor=formatted.length;
        phone.setSelectionRange(cursor,cursor);
      }
    }
    clear();sync();
  });
  phone.addEventListener('countrychange',()=>{if(!applyingCountry)interacted=true;clear();sync();});
  form.addEventListener('reset', () => {
    interacted = true;
    clear();
    setTimeout(() => {
      applyingCountry = true;
      try { iti.setSelectedCountry('br'); } finally { applyingCountry = false; }
      clear();
    }, 0);
  });
  const countryReady=lookupCountry({supported:factory.getAllCountries().map(c=>c.iso2)}).then(async iso=>{
    await ready;
    // Respostas tardias nunca substituem a escolha manual ou um número preenchido.
    if(!interacted&&!phone.value.trim()) {
      applyingCountry=true;
      try {iti.setSelectedCountry(iso);} finally {applyingCountry=false;}
    }
  });
  countryReady.catch(()=>{});
  return {ready,countryReady,validate,clear,getPayload:()=>({phone:normalized.value,phone_country:country.value,phone_dial_code:dial?.value||'+'+iti.getSelectedCountry().dialCode})};
}
