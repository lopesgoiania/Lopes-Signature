import './lead-form.js';
import {commercial,getStartingPrice,availableUnits,formatPrice} from './commercial.js';
const startingPrice=getStartingPrice(commercial);
if(startingPrice){document.querySelector('.starting-price').hidden=false;document.getElementById('starting-price').textContent=startingPrice;document.getElementById('starting-price-note').textContent=`Unidade ${commercial.referenceUnit} · ${availableUnits[0].area} m². Valores sujeitos a alteração e disponibilidade.`;}
const selector=document.getElementById('plan-select'),interest=document.getElementById('interest');
availableUnits.forEach((p,i)=>{
 selector.add(new Option(`Unidade ${p.unit} · ${p.area} m² · ${p.suites} suítes`,String(i)));
 interest.add(new Option(`Unidade ${p.unit} · ${p.area} m²`,p.unit));
 const row=document.createElement('tr');
 for(const value of [p.unit,`${p.area} m²`,formatPrice(p.price)]){const cell=document.createElement('td');cell.textContent=value;row.append(cell)}
 document.getElementById('unit-prices').append(row);
});
function render(){
 const p=availableUnits[Number(selector.value)];
 const image=document.getElementById('plan-image');image.src=`assets/${p.image}`;image.alt=`Planta da unidade ${p.unit}, ${p.area} m², ${p.suites} suítes`;
 const link=document.getElementById('plan-full');link.href=image.src;link.setAttribute('aria-label',`Ampliar planta da unidade ${p.unit}`);
 document.getElementById('size').textContent=p.area;
 document.getElementById('plan-spec').textContent=`Unidade ${p.unit} · ${p.suites} suítes · ${p.vagas} vagas`;
 document.getElementById('plan-description').textContent=p.description;
 document.getElementById('plan-price').textContent=formatPrice(p.price);
 interest.value=p.unit;
}
selector.addEventListener('change',render);render();
const sticky=document.querySelector('.mobile-contact');if('IntersectionObserver'in window)new IntersectionObserver(entries=>{sticky.hidden=entries[0].isIntersecting},{threshold:.1}).observe(document.getElementById('contato'));
