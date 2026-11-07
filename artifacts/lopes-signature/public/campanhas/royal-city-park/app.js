import { initialiseLeadForm } from './lead-form.js';

const plans = {
  10: ['Unidade 300 · Varanda descoberta', 'A varanda descoberta se estende ao lado do living. O deck da piscina fica junto ao gourmet.', '495,33 m²'],
  11: ['Pavimento par', 'Do 4º ao 50º andar, nos pavimentos pares. Living, jantar e gourmet integrados ao deck com piscina. Quatro suítes reservam o espaço da família.'],
  12: ['Pavimento ímpar', 'Do 5º ao 51º andar, nos pavimentos ímpares. Uma segunda disposição para a mesma experiência de morar, com quatro suítes e piscina junto ao gourmet.'],
  13: ['Decorado', 'Explore uma proposta de interiores para os ambientes de estar, jantar e as quatro suítes. Mobiliário e decoração ilustrativos.'],
};
const tabs = [...document.querySelectorAll('[role=tab]')];
const panel = document.getElementById('plan-panel');
const image = document.getElementById('plan-image');
const zoom = document.getElementById('plan-zoom');
const dialog = document.getElementById('plan-dialog');
const zoomImage = document.getElementById('zoom-image');

function choose(tab) {
  const page = tab.dataset.page;
  const [title, description, area = '428,08 m²'] = plans[page];
  tabs.forEach(candidate => {
    const active = candidate === tab;
    candidate.setAttribute('aria-selected', String(active));
    candidate.tabIndex = active ? 0 : -1;
  });
  image.src = './assets/planta-' + page + '.webp';
  image.alt = 'Prancha oficial · ' + title;
  zoom.href = './assets/planta-' + page + '-ampliada.webp';
  document.getElementById('plan-area').textContent = area;
  document.getElementById('plan-title').textContent = title;
  document.getElementById('plan-description').textContent = description;
  panel.setAttribute('aria-labelledby', tab.id);
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => choose(tab));
  tab.addEventListener('keydown', event => {
    const target = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    choose(tabs[target]);
    tabs[target].focus();
  });
});

zoom.addEventListener('click', event => {
  if (!dialog.showModal) return;
  event.preventDefault();
  zoomImage.src = zoom.href;
  zoomImage.alt = image.alt;
  document.getElementById('zoom-original').href = zoom.href;
  dialog.showModal();
  dialog.querySelector('.dialog-image').scrollTo(0, 0);
});
dialog.addEventListener('close', () => zoom.focus());

initialiseLeadForm();
