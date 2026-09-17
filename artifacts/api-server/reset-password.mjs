import { createClient } from '@supabase/supabase-js';

const url = 'https://kzarqqcazoxslamzyjqc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YXJxcWNhem94c2xhbXp5anFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTU4OTk0MiwiZXhwIjoyMTA1MTY1OTQyfQ.9dB0FCYD8NQkh8OwVoVRhJsC4J8xZa1j2ZnfEFcS2us';

const supabase = createClient(url, serviceKey);

async function main() {
  const email = 'lopesgynadm@gmail.com';
  const newPassword = 'LopesSignature2024!';
  
  // Find user
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error("Auth error:", authError);
    return;
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    console.error(`User ${email} not found`);
    return;
  }
  
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true
  });
  
  if (error) {
    console.error("Error updating password:", error);
  } else {
    console.log(`Successfully updated password for ${email}. New password: ${newPassword}`);
  }
}

main();
