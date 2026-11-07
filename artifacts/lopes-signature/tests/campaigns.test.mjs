import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { campaignLead, submitCampaignLead } from '../public/campanhas/lead-submit.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, 'campaigns/manifest.json'), 'utf8'));

for (const {slug, propertyId} of manifest) {
  test(`${slug}: exported page is indexable, self-contained and scoped to its product`, async () => {
    const html = await readFile(path.join(root, 'dist', `${slug}.html`), 'utf8');
    assert.ok(html.includes(`<base href="/campanhas/${slug}/">`));
    assert.ok(html.includes(`rel="canonical" href="https://www.lopessignature.com.br/${slug}"`));
    assert.match(html, /name="robots" content="index,follow/);
    assert.doesNotMatch(html, /noindex|Prévia|prévia|captação inativa|href="#/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    const sitemap = await readFile(path.join(root, 'dist/sitemap.xml'), 'utf8');
    assert.ok(sitemap.includes(`https://www.lopessignature.com.br/${slug}</loc>`));
    for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
      const value = match[1];
      if (/^(?:https?:|\/|data:|mailto:|tel:)/.test(value)) continue;
      await access(path.resolve(root, 'public/campanhas', slug, value));
    }
    const payload = campaignLead({name:'Teste',email:'teste@example.com',phone:'+5562999999999'}, slug, '?utm_campaign=city&gclid=click&secret=discard');
    assert.equal(payload.propertyId, propertyId);
    assert.equal(payload.phone, '+5562999999999');
    assert.match(payload.note, /utm_campaign: city/);
    assert.match(payload.note, /gclid: click/);
    assert.doesNotMatch(payload.note, /secret|discard/);
  });
}
function fixture() {
  const button = {disabled:false, setAttribute(){}, removeAttribute(){}};
  const status = {textContent:''};
  const form = {resets:0, events:[], querySelector: selector => selector === '#form-status' ? status : button,
    reset(){this.resets++;}, dispatchEvent(event){this.events.push(event);}};
  return {form,button,status};
}
const contact = {name:'Teste',email:'teste@example.com',phone:'+5562999999999'};
test('confirmed persistence alone resets the form and emits the saved event', async () => {
  const {form,status,button} = fixture();
  let sent;
  await submitCampaignLead(form,contact,'city-park-majestic',async (url, options) => {
    assert.equal(url,'/api/leads'); sent=JSON.parse(options.body);
    return Response.json({id:'test-lead'},{status:201});
  });
  assert.equal(sent.propertyId,'city-park-majestic');
  assert.equal(form.resets,1);
  assert.equal(form.events[0].type,'signature:lead-saved');
  assert.match(status.textContent,/Solicitação recebida/);
  assert.equal(button.disabled,false);
});
test('a failed or malformed response keeps the form and never claims success',async () => {
  for (const response of [Response.json({message:'offline'},{status:503}),Response.json({})]) {
    const {form,status,button}=fixture();
    await submitCampaignLead(form,contact,'royal-city-park',async()=>response);
    assert.equal(form.resets,0); assert.equal(form.events.length,0);
    assert.match(status.textContent,/Não foi possível confirmar/); assert.equal(button.disabled,false);
  }
});
test('duplicate submits while a request is pending create only one request',async()=>{
  const {form}=fixture(); let calls=0; let release;
  const request=()=>{calls++; return new Promise(resolve=>{release=()=>resolve(Response.json({id:'test'}));});};
  const first=submitCampaignLead(form,contact,'city-park-palace',request);
  await submitCampaignLead(form,contact,'city-park-palace',request);
  assert.equal(calls,1); release(); await first;
});
