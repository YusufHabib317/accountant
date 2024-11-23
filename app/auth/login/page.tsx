'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { z } from 'zod';

import { loginValidation } from '@/actions';
import { signIn } from '@/lib/auth-client';
import { loginSchema } from '@/schema/auth';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthCard } from '@/components/auth/auth-card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ClientOnly } from '@/components/common/client-only';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    const checkEmail = await loginValidation(values.email);
    if (!checkEmail.success) {
      toast({
        title: 'Login',
        description: checkEmail?.message!,
      });
      setIsLoading(false);
    } else {
      await signIn.email(
        {
          email: values.email,
          password: values.password,
        },
        {
          onRequest: () => {
            toast({
              title: 'Login',
              description: 'Authenticating, please wait...',
            });
          },
          onSuccess: () => {
            setIsLoading(false);
            toast({
              title: 'Login',
              description: 'Login successful! Redirecting...',
            });
            router.push('/dashboard/statics');
          },
          onError: (ctx) => {
            setIsLoading(false);
            toast({
              title: 'Login',
              description: ctx.error.message,
            });
            if (ctx.error.status === 403) {
              toast({
                title: 'Login',
                description: 'Please verify your email address to continue.',
              });
            }
          },
        },
      );
    }
  };

  return (
    <ClientOnly>
      <div className="container">
        <AuthCard type="login" title="Welcome back!" subTitle="Do not have an account ?">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="email" className="text-xs md:text-[1rem]">Email</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    disabled={isLoading}
                    required
                    placeholder="Enter Your Email"
                  />
                )}
              />
              {errors.email && <div className="text-red-500 ml-2 text-xs">{errors.email?.message}</div>}
            </div>
            <div className="mt-5">
              <Label htmlFor="password" className="text-xs md:text-[1rem]">Password</Label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled={isLoading}
                    required
                    placeholder="Enter Your Password"
                    type="password"
                    showPasswordToggle
                  />
                )}
              />
              {errors.password && <div className="text-red-500 ml-2 text-xs">{errors.password?.message}</div>}
            </div>

            <div className="mt-5">
              <Link
                href="/auth/reset-password"
                className="link"
              >
                Forgot password?
              </Link>
            </div>
            <div className=" flex justify-center items-center w-60 mx-auto">
              <Button
                className="mt-5 "
                color="primary"
                type="submit"
                variant="gooeyLeft"
                isLoading={isLoading}
              >
                Sign in
              </Button>
            </div>
          </form>
        </AuthCard>
      </div>
    </ClientOnly>
  );
}
