/* eslint-disable react/button-has-type */

'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { authConfigRoutes, links } from '@/data';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { ClientOnly } from '../../client-only';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import { useToast } from '@/hooks/use-toast';

export function AppSidebar() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentPath = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  const logOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast({
            title: 'Log out',
            description: 'Successfully logged out',
          });
          router.push(`${authConfigRoutes.DEFAULT_LOGIN_REDIRECT}`);
        },
        onError: (ctx) => {
          toast({
            title: 'Log out',
            description: ctx.error.message,
          });
        },
      },
    });
  };
  return (
    <ClientOnly>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={currentPath.includes(item.href)} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon style={{ width: '20px', height: '20px' }} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu className="flex justify-start items-start ml-2">
                {mounted && (
                <button onClick={toggleTheme}>
                  {theme === 'dark' ? (
                    <Sun size={20} />
                  ) : (
                    <Moon size={20} />
                  )}
                </button>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
            <SidebarGroupContent>
              <SidebarMenu className="flex justify-start items-start ml-2 my-3">
                {mounted && (
                <button onClick={logOut}>
                  <LogOut size={20} />
                </button>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
            <SidebarGroupContent className="mt-5">
              <SidebarMenu style={{ marginLeft: 3 }}>
                <SidebarTrigger />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </ClientOnly>
  );
}
