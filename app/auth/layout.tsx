import { ReactNode } from 'react';

export const metadata = {
  title: 'Authentication Page',
  description: 'Login or register to access your account.',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main>{children}</main>;
}
