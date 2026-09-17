import { useState, useEffect, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Activity, BarChart3, Bell, Bot, Building2, Check, ChevronDown, CircleDollarSign, Code2, ExternalLink, Eye, FileText, Globe2, LayoutDashboard, LogOut, Menu, MoreHorizontal, Pencil, Plus, RefreshCw, Save, Sparkles, Trash2, Users, X } from 'lucide-react';
import { Link } from 'wouter';
import { getGetAnalyticsSummaryQueryKey, getGetAnalyticsTimeseriesQueryKey, getGetTrackingSettingsQueryKey, getListLeadsQueryKey, getListPropertiesQueryKey, useCreateProperty, useDeleteProperty, useGetAnalyticsSummary, useGetAnalyticsTimeseries, useGetTrackingSettings, useListLeads, useListProperties, useUpdateLead, useUpdateProperty, useUpdateTrackingSettings, type Lead, type LeadInput, type Property, type PropertyInput, type TrackingSettings } from '@workspace/api-client-react';
import { EmptyState, ErrorState, PageLogo, money } from '@/components/signature-ui';
import { RaioXModal } from '@/components/raio-x-modal';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

type Tab = 'overview' | 'catalog' | 'blog' | 'leads' | 'tracking';

const leadColumns: { key: Lead['status']; label: string; color: string }[] = [
  { key: 'new', label: 'Novos', color: '#d4af37' },
  { key: 'contacted', label: 'Em contato', color: '#5b9bd5' },
  { key: 'scheduled', label: 'Visita agendada', color: '#e0a93a' },
  { key: 'negotiation', label: 'Negociação', color: '#b99be8' },
  { key: 'closed', label: 'Fechados', color: '#4caf6d' },
];

function AdminSidebar({ tab, setTab, mobileOpen, setMobileOpen }: { tab: Tab; setTab: (tab: Tab) => void; mobileOpen: boolean; setMobileOpen: (value: boolean) => void }) {
  const items: [Tab, string, typeof LayoutDashboard][] = [
    ['overview', 'Visão Geral & Métricas', LayoutDashboard],
    ['catalog', 'Produtos & Empreendimentos', Building2],
    ['blog', 'Blog & Agente de IA', Bot],
    ['leads', 'Pipeline de Leads', Users],
    ['tracking', 'Tracking & Pixels', Code2],
  ];

  return (
    <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-[270px] border-r border-white/10 bg-[#0e0e0e] p-6 transition-transform lg:translate-x-0`}>
      <div className="flex items-center justify-between">
        <PageLogo />
        <button className="text-[#9a9a9a] lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
          <X size={20} />
        </button>
      </div>

      <div className="mt-12">
        <p className="mono-label mb-4 text-[#5c5c5c]">Painel de Controle</p>
        {items.map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setMobileOpen(false); }}
            className={`relative mb-1 flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm ${
              tab === key
                ? 'bg-[#d4af37]/10 text-[#e8c766] before:absolute before:-left-6 before:h-7 before:w-[3px] before:bg-[#d4af37]'
                : 'text-[#9a9a9a] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={17} strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      <div className="absolute bottom-6 left-6 right-6 border-t border-white/10 pt-5">
        <Link href="/" className="mb-4 flex items-center gap-3 text-xs text-[#9a9a9a] hover:text-[#e8c766]">
          <Globe2 size={16} /> Ver Portal Público
        </Link>
        <button onClick={() => { if (supabase) supabase.auth.signOut(); else window.location.href = '/'; }} className="flex items-center gap-3 text-xs text-[#7a7a7a] hover:text-white">
          <LogOut size={16} /> Sair do Painel
        </button>
      </div>
    </aside>
  );
}

function MetricCard({ label, value, subtext, change, icon: Icon, tone = '#d4af37' }: { label: string; value: string; subtext?: string; change?: number; icon: typeof Eye; tone?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#7a7a7a]">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          {subtext && <p className="mt-1 text-[11px] text-[#7a7a7a]">{subtext}</p>}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ color: tone, backgroundColor: `${tone}18` }}>
          <Icon size={19} />
        </span>
      </div>
      {change !== undefined && (
        <p className={`mt-3 text-[11px] ${change >= 0 ? 'text-[#7acb8e]' : 'text-[#e0554a]'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% <span className="text-[#5c5c5c]">vs. período anterior</span>
        </p>
      )}
    </div>
  );
}

// Aba Visão Geral / Metrics & Analytics
function Overview() {
  const summaryQuery = useGetAnalyticsSummary();
  const seriesQuery = useGetAnalyticsTimeseries();
  const leadsQuery = useListLeads();

  const summary = summaryQuery.data;
  const points = Array.isArray(seriesQuery.data) ? seriesQuery.data : [];
  const leads = Array.isArray(leadsQuery.data) ? leadsQuery.data : [];

  const values = points;
  const max = Math.max(...values.map((point) => point.visits), 1);

  const totalLeads = leads.length;
  const formLeads = leads.filter((l) => l.source?.toLowerCase().includes('form') || l.source?.toLowerCase().includes('website') || l.source?.toLowerCase().includes('newsletter')).length;
  const whatsappLeads = leads.filter((l) => l.source?.toLowerCase().includes('whatsapp')).length;
  const lpLeads = leads.filter((l) => l.source?.toLowerCase().includes('lp')).length;

  const formPct = totalLeads > 0 ? Math.round((formLeads / totalLeads) * 100) : 0;
  const whatsappPct = totalLeads > 0 ? Math.round((whatsappLeads / totalLeads) * 100) : 0;
  const lpPct = totalLeads > 0 ? Math.round((lpLeads / totalLeads) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="mono-label text-[#d4af37]">Painel de Performance & Métricas</p>
        <h1 className="serif mt-2 text-4xl text-white md:text-5xl">Métricas da Plataforma</h1>
        <p className="mt-2 text-sm text-[#7a7a7a]">Acompanhamento de visitas, conversões e acessos a Landing Pages em tempo real no Supabase.</p>
      </div>

      {/* Cards de Métricas Principais (Mês, Semana, Dia, Conversão) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total de Visitas" value={(summary?.totalVisits || 0).toLocaleString('pt-BR')} subtext="Acessos registrados" icon={Eye} />
        <MetricCard label="Acessos a LPs" value={(summary?.lpViews || 0).toLocaleString('pt-BR')} subtext="Visualizações de produtos" icon={BarChart3} tone="#5b9bd5" />
        <MetricCard label="Cliques WhatsApp" value={(summary?.whatsappClicks || 0).toLocaleString('pt-BR')} subtext="Contatos diretos iniciados" icon={Activity} tone="#4caf6d" />
        <MetricCard label="Taxa de Conversão" value={`${summary?.conversionRate ?? 0}%`} subtext="Leads / Visitantes" icon={CircleDollarSign} tone="#e0a93a" />
      </div>

      {/* Gráfico de Tráfego e Distribuição */}
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 md:p-7">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Evolução do Tráfego Diário</p>
              <p className="mt-1 text-xs text-[#7a7a7a]">Visitas e geração de Leads nos últimos dias</p>
            </div>
            <div className="flex gap-4 text-[10px] text-[#9a9a9a]">
              <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#d4af37]" />Visitas</span>
              <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#4caf6d]" />Leads</span>
            </div>
          </div>
          {values.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-center text-[#7a7a7a]">
              <Activity size={24} className="mb-2 text-[#d4af37]" />
              <p className="text-xs">Aguardando novos acessos registrados no Supabase...</p>
            </div>
          ) : (
            <div className="flex h-56 items-end gap-2 md:gap-5">
              {values.map((point) => (
                <div key={point.label} className="flex h-full flex-1 flex-col justify-end gap-2">
                  <div className="relative flex flex-1 items-end justify-center">
                    <div
                      className="w-full max-w-10 rounded-t-md bg-[#d4af37]/70"
                      style={{ height: `${point.visits > 0 ? Math.max(15, (point.visits / max) * 100) : 4}%` }}
                      title={`${point.visits} visitas`}
                    />
                    <div
                      className="absolute bottom-0 w-2 rounded-full bg-[#4caf6d]"
                      style={{ height: `${point.leads > 0 ? Math.max(8, (point.leads / max) * 100 * 4) : 0}%` }}
                    />
                  </div>
                  <span className="text-center text-[10px] text-[#7a7a7a]">{point.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 md:p-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Origem dos Contatos</p>
              <p className="mt-1 text-xs text-[#7a7a7a]">Distribuição por canal de captação</p>
            </div>
            <MoreHorizontal size={17} className="text-[#7a7a7a]" />
          </div>
          <div className="mx-auto my-8 flex h-36 w-36 items-center justify-center rounded-full border-[18px] border-[#d4af37] border-r-[#5b9bd5] border-b-[#4caf6d]">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{totalLeads}</p>
              <p className="text-[10px] text-[#7a7a7a]">leads no total</p>
            </div>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[#c9c9c9]">
              <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#d4af37]" />Formulário do Portal</span>
              <b>{formPct}%</b>
            </div>
            <div className="flex justify-between text-[#c9c9c9]">
              <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#5b9bd5]" />WhatsApp Direct</span>
              <b>{whatsappPct}%</b>
            </div>
            <div className="flex justify-between text-[#c9c9c9]">
              <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#4caf6d]" />Landing Pages de Produtos</span>
              <b>{lpPct}%</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal de Criação / Edição de Produto Completo
function PropertyModal({ property, onClose }: { property?: Property; onClose: () => void }) {
  const queryClient = useQueryClient();
  const create = useCreateProperty();
  const update = useUpdateProperty();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const title = String(form.get('title') || '');
    const builder = String(form.get('builder') || 'Lopes Signature');
    const location = String(form.get('location') || '');
    const neighborhood = String(form.get('neighborhood') || '');
    const address = String(form.get('address') || '');
    const category = String(form.get('category') || 'Apartamentos');
    const price = Number(form.get('price') || 0);
    const area = Number(form.get('area') || 0);
    const bedrooms = Number(form.get('bedrooms') || 0);
    const suites = Number(form.get('suites') || 0);
    const bathrooms = Number(form.get('bathrooms') || 0);
    const parking = Number(form.get('parking') || 0);
    const description = String(form.get('description') || '');
    const images = String(form.get('images') || '').split('\n').map((i) => i.trim()).filter(Boolean);
    const gallery = String(form.get('gallery') || '').split('\n').map((i) => i.trim()).filter(Boolean);
    const badges = String(form.get('badges') || '').split(',').map((i) => i.trim()).filter(Boolean);
    const lpUrl = String(form.get('lpUrl') || '');
    const pdfUrl = String(form.get('pdfUrl') || '');
    const featured = form.get('featured') === 'on';

    // Planta 1 simples
    const fp1Title = String(form.get('fp1Title') || '');
    const fp1Price = Number(form.get('fp1Price') || 0);
    const fp1Area = String(form.get('fp1Area') || '');
    const fp1Image = String(form.get('fp1Image') || '');

    const floorplans = fp1Title
      ? [
          {
            id: 'fp-1',
            title: fp1Title,
            area: fp1Area || `${area}m²`,
            price: fp1Price || price,
            bedrooms,
            suites,
            bathrooms,
            parking,
            image: fp1Image || images[0] || '',
          },
        ]
      : (property as any)?.floorplans || [];

    const data: any = {
      title,
      builder,
      location,
      neighborhood,
      address,
      category,
      price,
      area,
      bedrooms,
      suites,
      bathrooms,
      parking,
      description,
      images,
      gallery: gallery.length > 0 ? gallery : images,
      floorplans,
      badges,
      featured,
      lpUrl: lpUrl || `/lp/${property?.id || Date.now()}`,
      pdfUrl,
      status: 'Disponível',
    };

    const options = {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
        onClose();
      },
    };

    if (property) {
      update.mutate({ propertyId: property.id, data }, options);
    } else {
      create.mutate({ data }, options);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 overflow-y-auto">
      <div className="my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#d4af37]/30 bg-[#161618] p-6 md:p-8 text-[#f5f2e9]">
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="mono-label text-[#d4af37]">Cadastro de Empreendimento</p>
            <h2 className="serif text-3xl text-white">{property ? 'Editar Produto' : 'Novo Produto'}</h2>
          </div>
          <button onClick={onClose} className="text-[#9a9a9a] hover:text-white" aria-label="Fechar">
            <X />
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" data-testid="form-admin-property">
          <label>
            <span className="admin-label">Nome do Produto *</span>
            <input name="title" defaultValue={property?.title} required placeholder="Ex: Bauhaus" className="admin-input" />
          </label>
          <label>
            <span className="admin-label">Construtora / Incorporadora</span>
            <input name="builder" defaultValue={(property as any)?.builder || 'Sousa Andrade'} placeholder="Ex: Sousa Andrade / Opus" className="admin-input" />
          </label>
          <label>
            <span className="admin-label">Cidade / Região *</span>
            <input name="location" defaultValue={property?.location} required placeholder="Ex: Goiânia, GO" className="admin-input" />
          </label>
          <label>
            <span className="admin-label">Bairro / Setor *</span>
            <input name="neighborhood" defaultValue={property?.neighborhood} required placeholder="Ex: Setor Bueno" className="admin-input" />
          </label>
          <label className="sm:col-span-2">
            <span className="admin-label">Endereço Completo</span>
            <input name="address" defaultValue={(property as any)?.address} placeholder="Ex: Avenida T-3, Setor Bueno, em frente ao Parque Vaca Brava" className="admin-input" />
          </label>

          <label>
            <span className="admin-label">Categoria</span>
            <select name="category" defaultValue={property?.category || 'Apartamentos'} className="admin-input">
              <option>Apartamentos</option>
              <option>Coberturas</option>
              <option>Casas em Condomínio</option>
              <option>Fazendas & Quintas</option>
            </select>
          </label>
          <label>
            <span className="admin-label">Preço Inicial (R$) *</span>
            <input name="price" type="number" defaultValue={property?.price} required placeholder="Ex: 8136691" className="admin-input" />
          </label>

          <label>
            <span className="admin-label">Área Principal (m²) *</span>
            <input name="area" type="number" defaultValue={property?.area} required placeholder="Ex: 398" className="admin-input" />
          </label>
          <label>
            <span className="admin-label">Suítes / Quartos</span>
            <input name="suites" type="number" defaultValue={property?.suites || property?.bedrooms} placeholder="Ex: 4" className="admin-input" />
          </label>
          <label>
            <span className="admin-label">Banheiros</span>
            <input name="bathrooms" type="number" defaultValue={(property as any)?.bathrooms || 5} placeholder="Ex: 6" className="admin-input" />
          </label>
          <label>
            <span className="admin-label">Vagas de Garagem</span>
            <input name="parking" type="number" defaultValue={property?.parking} placeholder="Ex: 4" className="admin-input" />
          </label>

          <label className="sm:col-span-2">
            <span className="admin-label">Descrição Completa para o Raio-X *</span>
            <textarea name="description" defaultValue={property?.description} required rows={4} placeholder="Descreva os diferenciais, vista, lazer, acabamentos..." className="admin-input" />
          </label>

          <label className="sm:col-span-2">
            <span className="admin-label">Imagens Principais (URLs, uma por linha)</span>
            <textarea name="images" defaultValue={property?.images?.join('\n')} rows={3} placeholder="https://..." className="admin-input font-mono text-xs" />
          </label>

          <label className="sm:col-span-2">
            <span className="admin-label">Galeria de Fotos Completa (URLs, uma por linha)</span>
            <textarea name="gallery" defaultValue={(property as any)?.gallery?.join('\n')} rows={3} placeholder="https://..." className="admin-input font-mono text-xs" />
          </label>

          {/* Configuração de Planta do Raio-X */}
          <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
            <p className="mono-label text-xs text-[#d4af37]">Configuração da Planta 1 do Raio-X</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="fp1Title" defaultValue={(property as any)?.floorplans?.[0]?.title || 'Planta 700 - 398.78m²'} placeholder="Título da Planta (ex: Planta 700 - 398m²)" className="admin-input text-xs" />
              <input name="fp1Price" type="number" defaultValue={(property as any)?.floorplans?.[0]?.price} placeholder="Preço da Planta (R$)" className="admin-input text-xs" />
              <input name="fp1Area" defaultValue={(property as any)?.floorplans?.[0]?.area} placeholder="Metragem (ex: 398.78m²)" className="admin-input text-xs" />
              <input name="fp1Image" defaultValue={(property as any)?.floorplans?.[0]?.image} placeholder="URL da Imagem da Planta Técnica" className="admin-input text-xs font-mono" />
            </div>
          </div>

          <label>
            <span className="admin-label">Badges / Destaques (separados por vírgula)</span>
            <input name="badges" defaultValue={property?.badges?.join(', ')} placeholder="FRENTE AO PARQUE, EXCLUSIVO" className="admin-input" />
          </label>
          <label>
            <span className="admin-label">URL do Material PDF (opcional)</span>
            <input name="pdfUrl" defaultValue={(property as any)?.pdfUrl} placeholder="https://..." className="admin-input font-mono text-xs" />
          </label>

          <label className="sm:col-span-2">
            <span className="admin-label">URL da Landing Page Individual</span>
            <input name="lpUrl" defaultValue={property?.lpUrl || `/lp/${property?.id || ''}`} placeholder="/lp/nome-do-produto" className="admin-input font-mono text-xs" />
          </label>

          <label className="flex items-center gap-3 sm:col-span-2">
            <input type="checkbox" name="featured" defaultChecked={property?.featured ?? true} className="h-4 w-4 accent-[#d4af37]" />
            <span className="text-sm text-[#c9c9c9]">Exibir em destaque no catálogo Signature</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 sm:col-span-2 border-t border-white/10">
            <button type="button" onClick={onClose} className="rounded-xl border border-white/15 px-5 py-3 text-xs text-[#c9c9c9]">
              Cancelar
            </button>
            <button type="submit" className="metal-button rounded-xl px-7 py-3 text-xs font-bold">
              {create.isPending || update.isPending ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Aba de Catálogo de Produtos (Com Ações de Raio-X e Landing Page)
function Catalog() {
  const queryClient = useQueryClient();
  const query = useListProperties();
  const remove = useDeleteProperty();

  const [modal, setModal] = useState<Property | 'new' | null>(null);
  const [raioXProperty, setRaioXProperty] = useState<Property | null>(null);

  function deleteProperty(property: Property) {
    if (window.confirm(`Excluir o produto ${property.title}?`)) {
      remove.mutate({ propertyId: property.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() }) });
    }
  }

  const [showSync, setShowSync] = useState(false);
  const [syncItems, setSyncItems] = useState<any[]>([]);
  const [selectedSync, setSelectedSync] = useState<string[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);

  function fetchSync() {
    setSyncLoading(true);
    fetch('/api/crm/sync')
      .then(res => res.json())
      .then(data => {
        setSyncItems(data || []);
        setSelectedSync([]);
        setShowSync(true);
      })
      .finally(() => setSyncLoading(false));
  }

  function handleImport() {
    if (selectedSync.length === 0) return;
    setSyncLoading(true);
    fetch('/api/crm/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedSync })
    })
      .then(() => {
        setShowSync(false);
        queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
      })
      .finally(() => setSyncLoading(false));
  }

  const properties = Array.isArray(query.data) ? query.data : [];

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mono-label text-[#d4af37]">Gestão de Produtos</p>
          <h1 className="serif mt-2 text-4xl text-white">Catálogo de Empreendimentos</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchSync} disabled={syncLoading} className="metal-button flex h-11 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold bg-[#1a1a1a] border border-[#d4af37]/40 text-[#e8c766] hover:bg-[#d4af37]/10">
            <RefreshCw size={16} className={syncLoading ? "animate-spin" : ""} /> Sincronizar CRM
          </button>
          <button onClick={() => setModal('new')} className="metal-button flex h-11 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold">
            <Plus size={16} /> Novo Produto
          </button>
        </div>
      </div>

      {query.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div className="skeleton h-20 rounded-2xl" key={item} />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : properties.length === 0 ? (
        <EmptyState
          title="Nenhum produto cadastrado"
          description="Clique em '+ Novo Produto' para cadastrar o primeiro empreendimento com Raio-X e Landing Page."
          onReset={() => setModal('new')}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#121212]">
          <table className="w-full min-w-[800px] text-left">
            <thead className="border-b border-white/10 text-[10px] uppercase tracking-[.15em] text-[#7a7a7a]">
              <tr>
                <th className="px-5 py-4">Produto</th>
                <th>Incorporadora</th>
                <th>Localização</th>
                <th>Valor a partir de</th>
                <th>Status</th>
                <th className="px-5">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="border-b border-white/5 last:border-0 hover:bg-white/[.02]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'} alt="" className="h-11 w-14 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-semibold text-white">{property.title}</p>
                        <p className="text-[11px] text-[#7a7a7a]">{property.category} · {property.area} m²</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-xs text-[#c9c9c9]">{(property as any).builder || 'Sousa Andrade'}</td>
                  <td className="text-xs text-[#9a9a9a]">{property.neighborhood}, {property.location}</td>
                  <td className="text-sm text-[#e8c766]">{money(property.price)}</td>
                  <td>
                    <span className="rounded-full bg-[#4caf6d]/10 px-3 py-1 text-[10px] text-[#7acb8e]">
                      Disponível
                    </span>
                  </td>
                  <td className="px-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRaioXProperty(property)}
                        className="flex items-center gap-1.5 rounded-lg border border-[#00a884]/40 bg-[#00a884]/10 px-3 py-1.5 text-xs text-[#00a884] hover:bg-[#00a884]/20"
                        title="Ver Raio-X do Produto"
                      >
                        <Eye size={14} /> Raio-X
                      </button>

                      <Link
                        href={property.lpUrl || `/lp/${property.id}`}
                        className="flex items-center gap-1.5 rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/10 px-3 py-1.5 text-xs text-[#e8c766] hover:bg-[#d4af37]/20"
                        title="Acessar Landing Page"
                      >
                        <ExternalLink size={13} /> LP
                      </Link>

                      <button
                        onClick={() => setModal(property)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9a9a9a] hover:bg-white/10 hover:text-white"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => deleteProperty(property)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9a9a9a] hover:bg-[#e0554a]/10 hover:text-[#e0554a]"
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <PropertyModal property={modal === 'new' ? undefined : modal} onClose={() => setModal(null)} />}
      {raioXProperty && <RaioXModal property={raioXProperty} onClose={() => setRaioXProperty(null)} />}
      
      {showSync && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-[#d4af37]/30 bg-[#121212] p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="serif text-2xl text-white">Fila de Importação CRM</h2>
                <p className="text-xs text-[#7a7a7a]">Selecione os imóveis que deseja importar para o catálogo público.</p>
              </div>
              <button onClick={() => setShowSync(false)} className="text-[#9a9a9a] hover:text-white"><X /></button>
            </div>
            
            <div className="max-h-[50vh] overflow-y-auto space-y-3 mb-6 pr-2">
              {syncItems.length === 0 ? (
                <p className="text-sm text-[#7a7a7a] text-center py-10">Nenhum imóvel pendente no momento.</p>
              ) : (
                syncItems.map(item => {
                  const title = item.payload?.titulo || item.payload?.nome || item.payload?.title || `CRM #${item.crm_id}`;
                  const price = item.payload?.valor || item.payload?.price || 0;
                  const isChecked = selectedSync.includes(item.id);
                  return (
                    <label key={item.id} className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${isChecked ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-white/10 bg-[#161616] hover:bg-white/5'}`}>
                      <input type="checkbox" checked={isChecked} onChange={(e) => setSelectedSync(prev => e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id))} className="mt-1 h-5 w-5 accent-[#d4af37]" />
                      <div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="text-xs text-[#7a7a7a]">CRM ID: {item.crm_id} · Recebido em: {new Date(item.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-sm font-bold text-[#e8c766]">{money(Number(price))}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            
            <div className="flex justify-between items-center border-t border-white/10 pt-5">
              <span className="text-xs text-[#9a9a9a]">{selectedSync.length} selecionado(s)</span>
              <div className="flex gap-3">
                <button onClick={() => setShowSync(false)} className="rounded-xl px-5 py-3 text-xs text-[#c9c9c9] hover:bg-white/5">Cancelar</button>
                <button onClick={handleImport} disabled={syncLoading || selectedSync.length === 0} className="metal-button rounded-xl px-6 py-3 text-xs font-bold disabled:opacity-50">
                  {syncLoading ? 'Importando...' : 'Importar Selecionados'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Aba de Blog & Agente de IA (Integrado com OpenRouter API)
function BlogAgent() {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('openrouter_key') || '');
  const [model, setModel] = useState<string>('google/gemini-2.5-flash');
  const [topic, setTopic] = useState<string>('Tendências e Valorização Imobiliária no Setor Bueno e Marista em Goiânia');
  const [posts, setPosts] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchPosts = () => {
    fetch('/api/blog')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  function handleSaveKey(e: FormEvent) {
    e.preventDefault();
    localStorage.setItem('openrouter_key', apiKey);
    setStatusMsg('Chave do OpenRouter salva com sucesso!');
    setTimeout(() => setStatusMsg(''), 3000);
  }

  function handleGeneratePost(e: FormEvent) {
    e.preventDefault();
    if (!apiKey) {
      alert('Insira a sua chave da OpenRouter API Key para acionar o agente de IA.');
      return;
    }

    setGenerating(true);
    setStatusMsg('Agente de IA pesquisando e escrevendo artigo...');

    fetch('/api/blog/generate-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        model,
        topic,
        region: 'Goiânia - GO',
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Erro ao gerar artigo.');
        }
        return res.json();
      })
      .then(() => {
        setStatusMsg('Artigo criado e publicado no Blog com sucesso!');
        fetchPosts();
      })
      .catch((err) => {
        setStatusMsg(`Erro: ${err.message}`);
      })
      .finally(() => {
        setGenerating(false);
      });
  }

  function handleDeletePost(id: string) {
    if (confirm('Deseja excluir este artigo do blog?')) {
      fetch(`/api/blog/${id}`, { method: 'DELETE' }).then(() => fetchPosts());
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <p className="mono-label text-[#d4af37]">Automação com Inteligência Artificial</p>
        <h1 className="serif mt-2 text-4xl text-white">Agente de IA do Blog (OpenRouter API)</h1>
        <p className="mt-2 text-sm text-[#7a7a7a]">
          Gere matérias completas e aprofundadas sobre o mercado imobiliário em Goiânia utilizando IA.
        </p>
      </div>

      {/* Configuração da Chave OpenRouter */}
      <form onSubmit={handleSaveKey} className="rounded-2xl border border-white/10 bg-[#121212] p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Bot size={24} className="text-[#d4af37]" />
          <div>
            <h2 className="text-base font-semibold text-white">Conexão OpenRouter API</h2>
            <p className="text-xs text-[#7a7a7a]">Insira sua chave obtida em openrouter.ai</p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-v1-..."
            className="admin-input flex-1 font-mono text-xs"
          />
          <button type="submit" className="rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 px-5 text-xs text-[#e8c766]">
            Salvar Chave
          </button>
        </div>
      </form>

      {/* Form de Geração de Artigos com IA */}
      <form onSubmit={handleGeneratePost} className="rounded-2xl border border-[#d4af37]/30 bg-[#161618] p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Sparkles size={22} className="text-[#e8c766]" />
          <h2 className="serif text-2xl text-white">Gerar Novo Artigo com IA</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="admin-label">Modelo OpenRouter</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="admin-input">
              <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash (Rápido e Barato)</option>
              <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini</option>
              <option value="anthropic/claude-3-haiku">Anthropic Claude 3 Haiku</option>
            </select>
          </div>

          <div>
            <label className="admin-label">Região Alvo</label>
            <input value="Goiânia - GO (Setor Bueno, Marista, Oeste)" readOnly className="admin-input bg-black/40 text-[#9a9a9a]" />
          </div>
        </div>

        <div>
          <label className="admin-label">Tema / Palavras-chave do Artigo</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: O impacto do metro quadrado no Vaca Brava..."
            className="admin-input"
          />
        </div>

        <button
          type="submit"
          disabled={generating}
          className="metal-button flex items-center justify-center gap-2 w-full rounded-xl py-4 text-xs font-bold"
        >
          {generating ? <RefreshCw size={16} className="animate-spin" /> : <Bot size={16} />}
          {generating ? 'Pesquisando e Gerando Artigo...' : 'Iniciar Agente de IA para Escrever Artigo'}
        </button>

        {statusMsg && <p className="text-xs text-[#7acb8e] text-center">{statusMsg}</p>}
      </form>

      {/* Lista de Artigos Publicados */}
      <div className="space-y-4">
        <h2 className="serif text-2xl text-white">Artigos Publicados ({posts.length})</h2>

        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#121212] p-4">
              <div>
                <p className="text-sm font-semibold text-white">{post.title}</p>
                <p className="text-xs text-[#7a7a7a]">
                  {post.category} · {post.date} · {post.author}
                </p>
              </div>
              <button
                onClick={() => handleDeletePost(post.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9a9a9a] hover:bg-[#e0554a]/10 hover:text-[#e0554a]"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Aba Pipeline de Leads
function Leads() {
  const queryClient = useQueryClient();
  const query = useListLeads();
  const update = useUpdateLead();
  const leads = Array.isArray(query.data) ? query.data : [];

  function moveLead(lead: Lead, status: Lead['status']) {
    const data: LeadInput = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      propertyId: lead.propertyId,
      propertyTitle: lead.propertyTitle,
      status,
      source: lead.source,
      note: lead.note,
    };
    update.mutate({ leadId: lead.id, data }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() }) });
  }

  return (
    <div className="space-y-7">
      <div className="flex items-end justify-between">
        <div>
          <p className="mono-label text-[#d4af37]">CRM Lopes Signature</p>
          <h1 className="serif mt-2 text-4xl text-white">Pipeline de Leads</h1>
        </div>
        <button onClick={() => query.refetch()} className="flex h-10 items-center gap-2 rounded-full border border-white/10 px-4 text-xs text-[#9a9a9a]">
          <Activity size={14} /> Atualizar
        </button>
      </div>

      {query.isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div className="skeleton h-72 rounded-2xl" key={item} />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {leadColumns.map((column) => (
            <div key={column.key} className="min-w-[260px] flex-1 rounded-2xl bg-[#0f0f0f] p-3">
              <div className="mb-3 flex items-center justify-between px-2">
                <p className="text-xs font-semibold text-white">{column.label}</p>
                <span className="text-xs text-[#7a7a7a]">{leads.filter((lead) => lead.status === column.key).length}</span>
              </div>
              <div className="space-y-3">
                {leads
                  .filter((lead) => lead.status === column.key)
                  .map((lead) => (
                    <article key={lead.id} className="rounded-xl border border-white/10 bg-[#181818] p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{lead.name}</p>
                          <p className="mt-1 line-clamp-1 text-[11px] text-[#9a9a9a]">{lead.propertyTitle || 'Interesse geral'}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-[11px] text-[#7a7a7a]">
                        {new Date(lead.createdAt).toLocaleDateString('pt-BR')} · {lead.source}
                      </p>
                      <select
                        value={lead.status}
                        onChange={(event) => moveLead(lead, event.target.value as Lead['status'])}
                        className="mt-3 h-9 w-full rounded-lg border border-white/10 bg-[#101010] px-2 text-[11px] text-[#c9c9c9]"
                      >
                        {leadColumns.map((item) => (
                          <option key={item.key} value={item.key}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </article>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Aba Tracking & Pixels
function Tracking() {
  const query = useGetTrackingSettings();
  const update = useUpdateTrackingSettings();
  const [saved, setSaved] = useState(false);
  const settings = query.data;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data: TrackingSettings = {
      metaPixelId: String(form.get('metaPixelId') || ''),
      metaEnabled: form.get('metaEnabled') === 'on',
      gtmContainerId: String(form.get('gtmContainerId') || ''),
      ga4MeasurementId: String(form.get('ga4MeasurementId') || ''),
      customHeadScript: String(form.get('customHeadScript') || ''),
      customBodyScript: String(form.get('customBodyScript') || ''),
    };
    update.mutate({ data }, { onSuccess: () => setSaved(true) });
  }

  return (
    <div className="max-w-3xl space-y-7">
      <div>
        <p className="mono-label text-[#d4af37]">Infraestrutura de Dados</p>
        <h1 className="serif mt-2 text-4xl text-white">Tracking & Pixels</h1>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3156a3]/15 text-[#7ca5ff]">
              <Activity size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Meta Pixel</p>
              <p className="text-xs text-[#7a7a7a]">Eventos de conversão no Facebook/Instagram</p>
            </div>
            <label className="ml-auto flex items-center gap-2 text-xs text-[#9a9a9a]">
              <input name="metaEnabled" type="checkbox" defaultChecked={settings?.metaEnabled} className="accent-[#d4af37]" /> Ativo
            </label>
          </div>
          <input name="metaPixelId" defaultValue={settings?.metaPixelId} placeholder="ID do Meta Pixel" className="admin-input" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
              <Code2 size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Google Tag Manager & GA4</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="admin-label">GTM Container ID</span>
              <input name="gtmContainerId" defaultValue={settings?.gtmContainerId} placeholder="GTM-XXXXXXX" className="admin-input" />
            </label>
            <label>
              <span className="admin-label">GA4 Measurement ID</span>
              <input name="ga4MeasurementId" defaultValue={settings?.ga4MeasurementId} placeholder="G-XXXXXXXXXX" className="admin-input" />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" className="metal-button flex h-11 items-center gap-2 rounded-full px-6 text-xs font-bold">
            <Save size={15} /> {update.isPending ? 'Salvando...' : 'Salvar configurações'}
          </button>
          {saved && <span className="flex items-center gap-2 text-xs text-[#7acb8e]"><Check size={15} /> Salvo</span>}
        </div>
      </form>
    </div>
  );
}

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!supabase) return;

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('Conta de gestão criada! Se a confirmação de e-mail estiver ativa no Supabase, verifique sua caixa de entrada.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha na autenticação. Verifique e-mail e senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signature-shell noise flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-[#d4af37]/30 bg-[#121212] p-8 shadow-2xl md:p-10">
        <div className="mb-8 text-center">
          <PageLogo />
          <h2 className="serif mt-4 text-2xl text-white">Painel Administrativo</h2>
          <p className="mt-1 text-xs text-[#7a7a7a]">Acesso restrito à gestão Lopes Signature (Supabase Auth)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="admin-label">E-mail de Gestão</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lopessignature.com.br"
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-label">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="admin-input"
            />
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-xs text-green-400">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="metal-button h-12 w-full rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            {loading ? 'Autenticando...' : isSignUp ? 'Criar Usuário de Gestão' : 'Entrar no Painel'}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-4 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }}
            className="text-xs text-[#d4af37] hover:underline"
          >
            {isSignUp ? 'Já tem conta? Fazer Login' : 'Primeiro acesso? Criar usuário no Supabase'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (authLoading) {
    return (
      <div className="signature-shell noise flex min-h-screen items-center justify-center text-white">
        <div className="space-y-3 text-center">
          <div className="skeleton mx-auto h-10 w-40 rounded-xl" />
          <p className="text-xs text-[#7a7a7a]">Verificando sessão de gestão no Supabase...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AdminLoginPage />;
  }

  return (
    <div className="signature-shell min-h-[100dvh] text-[#f5f2e9]">
      <AdminSidebar tab={tab} setTab={setTab} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/10 bg-[#0a0a0a]/90 px-5 backdrop-blur-xl md:px-10">
          <button onClick={() => setMobileOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-[#d4af37] lg:hidden" aria-label="Abrir menu">
            <Menu size={18} />
          </button>
          <div className="hidden items-center gap-2 text-xs text-[#7a7a7a] lg:flex">
            <span className="h-2 w-2 rounded-full bg-[#4caf6d]" /> Autenticado via Supabase Auth
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="relative text-[#9a9a9a] hover:text-white" aria-label="Notificações">
              <Bell size={18} />
              <i className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
            </button>
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d4af37] text-xs font-bold text-black">
                {session?.user?.email ? session.user.email.substring(0, 2).toUpperCase() : 'ML'}
              </div>
              <span className="hidden text-xs text-[#c9c9c9] md:block">{session?.user?.email || 'Gestão Lopes Signature'}</span>
              <ChevronDown size={14} className="text-[#7a7a7a]" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-5 md:p-10">
          {tab === 'overview' && <Overview />}
          {tab === 'catalog' && <Catalog />}
          {tab === 'blog' && <BlogAgent />}
          {tab === 'leads' && <Leads />}
          {tab === 'tracking' && <Tracking />}
        </main>
      </div>
    </div>
  );
}