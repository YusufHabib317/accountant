'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { emailOtp, signUp } from '@/lib/auth-client';
import { registerSchema } from '@/schema/auth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthCard } from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    const { error } = await signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
      },
      {
        onRequest: () => {
          toast({
            title: 'Register',
            description: 'WAIT PLEASE...',
          });
        },
        onSuccess: () => {
          toast({
            title: 'Register',
            description: 'SUCCESSFUL',
          });
          setIsLoading(false);
          router.push(`/auth/otp-email-verification?email=${values.email}`);
        },
        onError: (ctx) => {
          setIsLoading(false);
          toast({
            title: 'Register',
            description: ctx.error.message,
          });
        },
      },
    );
    if (!error) {
      await emailOtp.sendVerificationOtp({
        email: values.email,
        type: 'email-verification',
      });
    }
  };

  return (
    <div className="container overflow-hidden">
      <AuthCard type="register" title="Welcome!" subTitle="You have an account? Log in now!">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="name" className="text-xs md:text-[1rem]">Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  disabled={isLoading}
                  required
                  placeholder="Enter Your Name"
                />
              )}
            />
            {errors.name && <div className="text-red-500 ml-2 text-xs">{errors.name?.message}</div>}
          </div>
          <div className="mt-5">
            <Label htmlFor="email" className="text-xs md:text-[1rem]">Email</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
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
            <Label htmlFor="confirmPassword" className="text-xs md:text-[1rem]">Confirm Password</Label>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  disabled={isLoading}
                  required
                  placeholder="Enter Confirm Password"
                  type="password"
                  showPasswordToggle
                />
              )}
            />
            {errors.confirmPassword && <div className="text-red-500 ml-2 text-xs">{errors.confirmPassword?.message}</div>}
          </div>

          <div className="flex justify-center items-center w-60 mx-auto">
            <Button className="mt-5" variant="default" color="primary" type="submit" isLoading={isLoading} disabled={isLoading}>
              Register
            </Button>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}
