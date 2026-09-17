import { createClient } from '@supabase/supabase-js';

const url = 'https://kzarqqcazoxslamzyjqc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YXJxcWNhem94c2xhbXp5anFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTU4OTk0MiwiZXhwIjoyMTA1MTY1OTQyfQ.9dB0FCYD8NQkh8OwVoVRhJsC4J8xZa1j2ZnfEFcS2us';

const supabase = createClient(url, serviceKey);

async function main() {
  console.log("Checking auth.users...");
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error("Auth error:", authError);
  } else {
    console.log("Users:", users.map(u => ({ id: u.id, email: u.email, confirmed_at: u.confirmed_at })));
  }

  console.log("Checking admin_users...");
  const { data: adminUsers, error: adminError } = await supabase.from('admin_users').select('*');
  if (adminError) {
    console.error("Admin users error:", adminError);
  } else {
    console.log("Admin Users:", adminUsers);
  }
}

main();
