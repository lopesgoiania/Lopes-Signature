// Property IDs are scoped to the existing Signature catalog, never to another CRM.
const properties = Object.freeze({
  'city-park-majestic': 'city-park-majestic',
  'royal-city-park': 'city-park-royal',
  'city-park-palace': 'city-park-palace',
  'citage-sante-comercial': 'citage-sante',
  'citage-sante-residencial': 'citage-sante',
  'legacy-city-home': 'legacy-city-home',
  'city-way': 'city-way',
  'city-23-by-pininfarina': 'city-23',
});
const campaignFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid'];
const pending = new WeakSet();
const attempts = new WeakMap();

export function campaignLead(payload, slug, search = globalThis.location?.search || '') {
  if (!Object.hasOwn(properties, slug)) throw new Error('Empreendimento inválido.');
  const query = new URLSearchParams(search);
  const attribution = campaignFields.filter(key => query.get(key)).map(key => `${key}: ${query.get(key).slice(0, 512)}`);
  return {
    name: payload.name, email: payload.email, phone: payload.phone || payload.phone_e164,
    propertyId: properties[slug],
    note: [
      `Landing page: /${slug}`,
      `País do telefone: ${payload.country || payload.phone_country || ''}`,
      payload.plan ? `Planta: ${payload.plan}` : '',
      payload.interest ? `Interesse: ${payload.interest}` : '',
      payload.consent === true ? 'Solicitou e autorizou contato sobre o empreendimento.' : '',
      ...attribution,
    ].filter(Boolean).join('\n'),
  };
}

export async function submitCampaignLead(form, payload, slug, request = fetch) {
  if (pending.has(form)) return;
  pending.add(form);
  const button = form.querySelector('button[type=submit]');
  const status = form.querySelector('#form-status');
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  status.textContent = 'Enviando sua solicitação…';
  try {
    const data = {
      ...campaignLead(payload, slug),
      ...globalThis.SignatureTracking?.pageContext(),
      '100bug_id_lanc': form.elements?.namedItem('100bug_id_lanc')?.value || '',
    };
    const key = JSON.stringify(data);
    if (attempts.get(form)?.key !== key) attempts.set(form, {key, id: crypto.randomUUID()});
    const response = await request('/api/leads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({...data, event_id: attempts.get(form).id}), signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok || !result.id) throw new Error('Não foi possível enviar agora. Tente novamente em instantes.');
    attempts.delete(form);
    form.reset();
    if (result.event_id) globalThis.SignatureTracking?.lead(result.event_id);
    status.textContent = 'Solicitação recebida. Nossa equipe entrará em contato para apresentar plantas e condições.';
    form.dispatchEvent(new CustomEvent('signature:lead-saved', { detail: { id: result.id, product: slug } }));
  } catch {
    status.textContent = 'Não foi possível confirmar o envio. Seus dados continuam no formulário; tente novamente em instantes.';
  } finally {
    pending.delete(form);
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }
}

export function bindCampaignForm(form, slug, validate) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    try {
      const payload = await validate();
      if (payload) await submitCampaignLead(form, payload, slug);
    } catch {
      const status = form.querySelector('#form-status');
      if (status) status.textContent = 'Confira os campos do formulário antes de enviar. Se a validação não carregar, atualize a página.';
    }
  });
}
