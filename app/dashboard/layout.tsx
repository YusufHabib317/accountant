import { AppSidebar } from '@/components/common/dashboard-layout/sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { cookies } from 'next/headers';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';
  return (
    <SidebarProvider defaultOpen={defaultOpen} className="relative">
      <AppSidebar />
      <div className="absolute top-8 left-5 z-30 md:hidden">
        <SidebarTrigger />
      </div>
      <SidebarInset className="p-5">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
