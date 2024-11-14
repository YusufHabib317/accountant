'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientOnly } from '@/components/common/client-only';

export default function Hero() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  return (
    <ClientOnly isLoading={isPending}>
      <div className="relative container">
        <div className="pt-[50px]">
          {session?.user && (
          <div className="flex gap-5 items-center">
            <p className="text-[5rem] text-sky-600 font-extrabold">Welcome</p>
            <Badge className="mt-5">
              <span className="font-extrabold">
                {session.user.email}
              </span>
            </Badge>
          </div>
          )}

          <h1 className="text-[4rem] font-extrabold">
            Your
            <span className="ml-5 text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-sky-800">
              accounting made easy
            </span>
            <div>
              with our comprehensive solution
            </div>
          </h1>

          <p className="text-2xl max-w-[800px]">
            Streamline your sales and procurement processes with our intuitive
            platform – manage transactions, track inventory, and generate
            reports effortlessly.
          </p>

          <div className="mt-5 flex gap-5 items-center">
            <Link href="/dashboard/statics">
              <Button variant="outline">
                Go to Dashboard
              </Button>
            </Link>
            {session?.user && (
            <Button
              variant="outline"
              onClick={() => signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push('/auth/login');
                  },
                },
              })}
            >
              Sign Out
            </Button>
            )}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
