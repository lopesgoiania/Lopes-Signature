// Property IDs are scoped to the existing Signature catalog, never to another CRM.
const properties = Object.freeze({
  'city-park-majestic': 'city-park-majestic',
  'royal-city-park': 'city-park-royal',
  'city-park-palace': 'city-park-palace',
});
const campaignFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'];
const pending = new WeakSet();

export function campaignLead(payload, slug, search = globalThis.location?.search || '') {
  if (!Object.hasOwn(properties, slug)) throw new Error('Empreendimento inválido.');
  const query = new URLSearchParams(search);
  const attribution = campaignFields.filter(key => query.get(key)).map(key => `${key}: ${query.get(key).slice(0, 512)}`);
  return {
    name: payload.name, email: payload.email, phone: payload.phone,
    propertyId: properties[slug],
    note: [
      `Landing page: /${slug}`,
      `País do telefone: ${payload.country || payload.phone_country || ''}`,
      payload.plan ? `Planta: ${payload.plan}` : '',
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
    const response = await request('/api/leads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignLead(payload, slug)), signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok || !result.id) throw new Error('Não foi possível enviar agora. Tente novamente em instantes.');
    form.reset();
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
