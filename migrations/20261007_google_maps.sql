-- Browser key only. No server credential is exposed by this table.
create table if not exists public.signature_settings (
  id text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.signature_settings enable row level security;
revoke all on public.signature_settings from anon, authenticated;
grant all on public.signature_settings to service_role;
insert into public.signature_settings(id,value) values('google_maps','{"enabled":false,"apiKey":"","mapId":""}') on conflict(id) do nothing;

create or replace function public.signature_location_slug(value text) returns text
language sql immutable set search_path = public as $$
  select trim(both '-' from regexp_replace(lower(translate(value,'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ','aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC')),'[^a-z0-9]+','-','g'));
$$;

-- Save property and resolve/create its location terms in the same transaction.
create or replace function public.signature_save_located_property(property_row jsonb)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  r public.properties%rowtype;
  c public.signature_taxonomies%rowtype;
  n public.signature_taxonomies%rowtype;
  m jsonb := property_row->'signature_meta';
  state_code text := m->>'stateCode';
  city_slug text := public.signature_location_slug(m->>'city');
  neighborhood_slug text := public.signature_location_slug(m->>'neighborhood');
  normalized_neighborhood text;
begin
  perform pg_advisory_xact_lock(74261007);
  if coalesce(m->>'addressSource','') <> 'google' or coalesce(m->>'postalCode','') !~ '^\d{8}$'
     or state_code !~ '^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$'
     or city_slug = '' or neighborhood_slug = ''
     or m->>'latitude' is null or m->>'longitude' is null
     or (m->>'latitude')::numeric not between -90 and 90
     or (m->>'longitude')::numeric not between -180 and 180 then
    raise exception 'Endereço geocodificado inválido';
  end if;
  select * into c from public.signature_taxonomies
    where kind = 'city' and public.signature_location_slug(label) = city_slug
      and coalesce(meta->>'stateCode', case when city_slug = 'goiania' then 'GO' end, state_code) = state_code
    order by sort_order, id limit 1;
  if c.id is null then
    insert into public.signature_taxonomies(id,kind,label,slug,active,show_home,sort_order,meta)
      values('city-'||lower(state_code)||'-'||city_slug,'city',m->>'city',city_slug||'-'||lower(state_code),true,false,0,jsonb_build_object('stateCode',state_code,'origin','google','indexable',false)) returning * into c;
  else
    if not c.active then raise exception 'A cidade está inativa nas taxonomias'; end if;
    update public.signature_taxonomies set meta = meta || jsonb_build_object('stateCode',state_code) where id = c.id;
  end if;
  normalized_neighborhood := regexp_replace(neighborhood_slug,'^(setor|bairro)-','');
  select * into n from public.signature_taxonomies
    where kind = 'neighborhood' and parent_id = c.id
      and regexp_replace(public.signature_location_slug(label),'^(setor|bairro)-','') = normalized_neighborhood
    order by sort_order, id limit 1;
  if n.id is null then
    insert into public.signature_taxonomies(id,kind,label,slug,parent_id,active,show_home,sort_order,meta)
      values('neighborhood-'||lower(state_code)||'-'||city_slug||'-'||normalized_neighborhood,'neighborhood',m->>'neighborhood',city_slug||'-'||lower(state_code)||'-'||neighborhood_slug,c.id,true,false,0,jsonb_build_object('stateCode',state_code,'origin','google','indexable',false)) returning * into n;
  else
    if not n.active then raise exception 'O bairro está inativo nas taxonomias'; end if;
  end if;
  m := m || jsonb_build_object('city',c.label,'neighborhood',n.label,'cityTermId',c.id,'neighborhoodTermId',n.id);
  r := jsonb_populate_record(null::public.properties,property_row || jsonb_build_object('signature_meta',m,'location',c.label));
  insert into public.properties(id,title,builder,location,address,price,area,bedrooms,suites,bathrooms,parking,description,images,gallery,floorplans,signature_meta)
    values(r.id,r.title,r.builder,r.location,r.address,r.price,r.area,r.bedrooms,r.suites,r.bathrooms,r.parking,r.description,r.images,r.gallery,r.floorplans,r.signature_meta)
    on conflict(id) do update set title=excluded.title,builder=excluded.builder,location=excluded.location,address=excluded.address,price=excluded.price,area=excluded.area,bedrooms=excluded.bedrooms,suites=excluded.suites,bathrooms=excluded.bathrooms,parking=excluded.parking,description=excluded.description,images=excluded.images,gallery=excluded.gallery,floorplans=excluded.floorplans,signature_meta=excluded.signature_meta
    returning * into r;
  return to_jsonb(r);
end;
$$;
revoke all on function public.signature_location_slug(text) from public,anon,authenticated;
revoke all on function public.signature_save_located_property(jsonb) from public,anon,authenticated;
grant execute on function public.signature_location_slug(text) to service_role;
grant execute on function public.signature_save_located_property(jsonb) to service_role;
