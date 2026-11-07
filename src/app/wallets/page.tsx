import { getDashboardData } from '@/lib/data/finance';
import { WalletsView } from '@/components/wallets/WalletsView';

export default async function WalletsPage() {
  const data = await getDashboardData();
  const isLoggedIn = !!data.user;

  return <WalletsView wallets={data.wallets} isLoggedIn={isLoggedIn} />;
}
