import { cookies } from 'next/headers';
import { auth } from '@/auth';
import SidebarWrapper from './SidebarWrapper';

export default async function Sidebar() {
  const cookieStore = await cookies();
  const minimized = cookieStore.get('sidebarMinimized')?.value === 'true';
  const session = await auth();
  return <SidebarWrapper defaultMinimized={minimized} serverUser={session?.user ?? null} />;
}
