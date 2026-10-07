begin;
alter table public.signature_taxonomies add column if not exists meta jsonb not null default '{}'::jsonb;
-- Rename terms and their property references in one transaction. Only the authenticated server calls this function.
create or replace function public.signature_save_taxonomy(term jsonb) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare old_term public.signature_taxonomies; saved public.signature_taxonomies; field_name text; parent_label text;
begin
  perform pg_advisory_xact_lock(74261007);
  select * into old_term from signature_taxonomies where id = term->>'id' for update;
  if old_term.id is not null and (old_term.label <> term->>'label' or old_term.parent_id is distinct from nullif(term->>'parent_id','')) then
    field_name := case old_term.kind when 'type' then 'category' when 'status' then 'condition' when 'city' then 'city' when 'neighborhood' then 'neighborhood' else null end;
    select label into parent_label from signature_taxonomies where id = old_term.parent_id;
    if old_term.kind = 'feature' then
      update properties p set signature_meta = jsonb_set(coalesce(p.signature_meta,'{}'), '{features}',
        (select jsonb_agg(case when v = to_jsonb(old_term.label) then to_jsonb(term->>'label') else v end) from jsonb_array_elements(p.signature_meta->'features') v))
        where coalesce(p.signature_meta->'features','[]') @> jsonb_build_array(old_term.label);
      update properties p set floorplans =
        (select jsonb_agg(case when plan ? 'features' then jsonb_set(plan,'{features}',
          coalesce((select jsonb_agg(case when f=to_jsonb(old_term.label) then to_jsonb(term->>'label') else f end) from jsonb_array_elements(plan->'features') f),'[]')) else plan end)
          from jsonb_array_elements(p.floorplans) plan)
        where p.floorplans is not null and p.floorplans @> jsonb_build_array(jsonb_build_object('features',jsonb_build_array(old_term.label)));
    else
      update properties p set signature_meta = jsonb_set(coalesce(p.signature_meta,'{}'), array[field_name], to_jsonb(term->>'label')),
        location = case when old_term.kind = 'city' then term->>'label' else p.location end
        where (case when old_term.kind = 'type' then coalesce(p.signature_meta->>'category','Apartamentos')
                    when old_term.kind = 'city' then coalesce(p.signature_meta->>'city',p.location)
                    when old_term.kind = 'neighborhood' then coalesce(p.signature_meta->>'neighborhood',trim(substring(p.address from '(Setor [^,]+|Jardim [^,]+|Marista|Bueno)')))
                    else p.signature_meta->>field_name end) = old_term.label
          and (old_term.kind <> 'neighborhood' or coalesce(p.signature_meta->>'city',p.location) = parent_label);
    end if;
  end if;
  insert into signature_taxonomies(id,kind,label,slug,parent_id,show_home,active,sort_order,meta)
  values(term->>'id',term->>'kind',term->>'label',term->>'slug',nullif(term->>'parent_id',''),(term->>'show_home')::boolean,(term->>'active')::boolean,(term->>'sort_order')::integer,term->'meta')
  on conflict(id) do update set label=excluded.label, slug=excluded.slug,parent_id=excluded.parent_id,show_home=excluded.show_home,active=excluded.active,sort_order=excluded.sort_order,meta=excluded.meta
  returning * into saved;
  return to_jsonb(saved);
end $$;
revoke all on function public.signature_save_taxonomy(jsonb) from public, anon, authenticated;
grant execute on function public.signature_save_taxonomy(jsonb) to service_role;
commit;
