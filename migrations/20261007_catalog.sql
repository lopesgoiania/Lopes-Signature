alter table public.properties add column if not exists signature_meta jsonb not null default '{}'::jsonb;
create table if not exists public.signature_taxonomies (
  id text primary key,
  kind text not null check (kind in ('type','status','city','neighborhood','feature')),
  label text not null,
  slug text not null,
  parent_id text,
  show_home boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  unique(kind,slug)
);
alter table public.signature_taxonomies enable row level security;
insert into public.signature_taxonomies(id,kind,label,slug,show_home,sort_order) values
 ('type-apartamentos','type','Apartamentos','apartamentos',true,0),
 ('status-pronto','status','Pronto','pronto',false,0),
 ('status-na-planta','status','Na planta','na-planta',false,1),
 ('status-lancamento','status','Lançamento','lancamento',false,2),
 ('city-goiania','city','Goiânia','goiania',false,0),
 ('neighborhood-bueno','neighborhood','Setor Bueno','setor-bueno',false,0)
on conflict do nothing;
update public.signature_taxonomies set parent_id='city-goiania' where id='neighborhood-bueno' and parent_id is null;
notify pgrst, 'reload schema';
