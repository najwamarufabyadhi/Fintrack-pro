import { createClient } from '@/lib/supabase/server';
import { SettingsView } from '@/components/settings/SettingsView';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userData = user
    ? {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Pengguna FinTrack',
      }
    : null;

  return <SettingsView user={userData} />;
}
