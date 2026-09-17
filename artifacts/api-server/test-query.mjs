const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YXJxcWNhem94c2xhbXp5anFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTU4OTk0MiwiZXhwIjoyMTA1MTY1OTQyfQ.9dB0FCYD8NQkh8OwVoVRhJsC4J8xZa1j2ZnfEFcS2us';
const ref = 'kzarqqcazoxslamzyjqc';

async function testSql() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.admin_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      name TEXT DEFAULT 'Gestor Signature',
      role TEXT DEFAULT 'admin',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Test endpoint 1: /pg/query
  try {
    const res1 = await fetch(`https://${ref}.supabase.co/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({ query: sql }),
    });
    console.log('Test /pg/query status:', res1.status, await res1.text().catch(() => ''));
  } catch (e) {
    console.log('Test 1 error:', e.message);
  }

  // Test endpoint 2: /rest/v1/rpc
  try {
    const res2 = await fetch(`https://${ref}.supabase.co/rest/v1/`, {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
    });
    console.log('Test /rest/v1/ status:', res2.status);
  } catch (e) {
    console.log('Test 2 error:', e.message);
  }
}

testSql();
