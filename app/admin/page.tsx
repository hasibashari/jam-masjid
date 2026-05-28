import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/shared/lib/auth';
import AdminDashboardClient from './components/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('__Secure-Session')?.value;
  
  // Verify signed cookie on the server
  const session = verifySession(token);
  
  if (!session) {
    // Fail-safe: fail closed and redirect to login
    redirect('/admin/login');
  }

  // Session is fully verified, render the client-side dashboard panel
  return <AdminDashboardClient />;
}
