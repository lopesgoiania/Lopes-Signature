import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kzarqqcazoxslamzyjqc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YXJxcWNhem94c2xhbXp5anFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTU4OTk0MiwiZXhwIjoyMTA1MTY1OTQyfQ.9dB0FCYD8NQkh8OwVoVRhJsC4J8xZa1j2ZnfEFcS2us';

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log('--- TESTANDO CONEXÃO DIRETA COM SUPABASE ---');

  const { data: props, error: propsErr } = await supabase.from('properties').select('*');
  console.log('Tabela properties:', { count: props?.length, error: propsErr?.message });

  const { data: blogs, error: blogsErr } = await supabase.from('blog_posts').select('*');
  console.log('Tabela blog_posts:', { count: blogs?.length, error: blogsErr?.message });

  const { data: events, error: eventsErr } = await supabase.from('analytics_events').select('*');
  console.log('Tabela analytics_events:', { count: events?.length, error: eventsErr?.message });

  const { data: leads, error: leadsErr } = await supabase.from('leads').select('*');
  console.log('Tabela leads:', { count: leads?.length, error: leadsErr?.message });

  const { data: adminUsers, error: adminErr } = await supabase.from('admin_users').select('*');
  console.log('Tabela admin_users:', { count: adminUsers?.length, error: adminErr?.message });

  // Listar usuários do Supabase Auth
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
  console.log('Usuários no auth.users do Supabase:', {
    total: authData?.users?.length,
    users: authData?.users?.map((u) => ({ id: u.id, email: u.email })),
    error: authErr?.message,
  });
}

main().catch(console.error);
