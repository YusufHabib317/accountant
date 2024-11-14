import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Link from 'next/link';

type AuthCardProps = {
 children: React.ReactNode;
 title: string;
 subTitle: string;
 type: 'login' | 'register';
}
export function AuthCard(props: AuthCardProps) {
  const {
    children, title, subTitle, type,
  } = props;
  return (
    <Card className="p-6 md:p-10 mt-10 mx-auto max-w-[650px]">
      <CardHeader className="pb-0 pt-2 px-4 mb-5 flex-col items-center">
        <h2 className="text-center text-2xl md:text-4xl">{title}</h2>
        <h2 className="text-white/50 text-center mt-3 text-xs md:text-[1rem]">
          {subTitle}
          {' '}
          {type === 'register' && <Link href="/auth/login" className="link">Login</Link>}
          {type === 'login' && <Link href="/auth/register" className="link">Create account</Link>}
        </h2>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
