
const plans = {
  tipo: ['Planta tipo de 4 suítes', '274,00 m²', 'Quatro suítes, hall privativo e varanda gourmet com churrasqueira a carvão.', 11],
  opcao: ['Opção de 3 suítes', '274,00 m²', 'Três suítes e uma nova distribuição dos ambientes nos mesmos 274 m².', 10],
  decorado: ['Decorado de 3 suítes', '274,00 m²', 'Distribuição usada no decorado. Personalização sujeita à viabilidade, custos e cronograma.', 13],
  inferior: ['Duplex · pavimento inferior', '272,19 m² neste pavimento', 'Suítes no 52º pavimento, com hall privativo e suíte master com banheira.', 14],
  superior: ['Duplex · pavimento superior', '265,88 m² neste pavimento', 'Living e gourmet no 53º pavimento, com piscina privativa e deck molhado.', 15],
};

const tabs = [...document.querySelectorAll('[role="tab"]')];
const panel = document.querySelector('#plan-panel');
const planImage = document.querySelector('#plan-image');
const floor = document.querySelector('#floor');
const dialog = document.querySelector('#plan-dialog');

function selectPlan(tab) {
  const duplex = tab.dataset.plan === 'duplex';
  const [title, area, description, page] = plans[duplex ? floor.value : tab.dataset.plan];
  for (const option of tabs) {
    option.setAttribute('aria-selected', String(option === tab));
    option.tabIndex = option === tab ? 0 : -1;
  }
  panel.setAttribute('aria-labelledby', tab.id);
  document.querySelector('#duplex-controls').hidden = !duplex;
  document.querySelector('#plan-title').textContent = title;
  document.querySelector('#plan-area').textContent = area;
  document.querySelector('#plan-description').textContent = description;
  document.querySelector('#plan-source').textContent = 'Planta ilustrativa.';
  planImage.src = `./assets/planta-${page}.webp`;
  planImage.alt = title + ' do City Park Majestic';
}

for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => selectPlan(tab));
  tab.addEventListener('keydown', (event) => {
    const next = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectPlan(tabs[next]);
    tabs[next].focus();
  });
}

floor.addEventListener('change', () => selectPlan(tabs[3]));
document.querySelector('#enlarge').addEventListener('click', () => {
  const image = document.querySelector('#dialog-image');
  image.src = planImage.src;
  image.alt = planImage.alt;
  document.querySelector('#dialog-title').textContent = document.querySelector('#plan-title').textContent;
  dialog.showModal();
  document.querySelector('.dialog-view').scrollTo(0, 0);
});


import './lead-form.mjs';
