/* eslint-disable sonarjs/no-duplicate-string */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { forgetPassword, resetPassword } from '@/lib/auth-client';
import { sendResetEmailSchema, setNewPasswordSchema } from '@/schema/auth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkEmailExists } from '@/actions';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { MoveLeft } from 'lucide-react';

export default function ForgetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSetNewPassword, setIsLoadingSetNewPassword] = useState(false);
  const searchParams = useSearchParams();
  const tokenQuery = searchParams.get('token');
  const errorQuery = searchParams.get('error');
  const router = useRouter();
  const { toast } = useToast();

  const { control: controlSendEmail, handleSubmit: formResetSendEmail, formState: { errors: errorsSendEmail } } = useForm({
    resolver: zodResolver(sendResetEmailSchema),
    defaultValues: {
      email: '',
    },
  });

  const { control: controlNewPassword, handleSubmit: formResetNewPassword, formState: { errors: errorsNewPassword } } = useForm({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof sendResetEmailSchema>) => {
    setIsLoading(true);
    try {
      const checkExistEmail = await checkEmailExists(values.email);
      if (!checkExistEmail.success) {
        toast({
          title: 'Reset Password',
          description: checkExistEmail.message,
        });
      } else {
        await forgetPassword(
          {
            email: values.email,
            redirectTo: '/auth/reset-password',
          },
          {
            onError: (ctx) => {
              toast({
                title: 'Reset Password',
                description: ctx.error.message,
              });
            },
            onSuccess: () => {
              toast({
                title: 'Reset Password',
                description: 'CHECK YOUR EMAIL',
              });
            },
          },
        );
      }
    } catch {
      toast({
        title: 'Reset Password',
        description: 'SOMETHING WENT WRONG',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitSetNewPassword = async (
    values: z.infer<typeof setNewPasswordSchema>,
  ) => {
    try {
      setIsLoadingSetNewPassword(true);
      await resetPassword(
        {
          newPassword: values.newPassword,
        },
        {
          onError: (ctx) => {
            toast({
              title: 'Reset Password',
              description: ctx.error.message,
            });
          },
          onSuccess: (ctx) => {
            toast({
              title: 'Reset Password',
              description: 'SUCCESSFUL',
            });
            router.push('/auth/login');
          },
        },
      );
    } catch {
      toast({
        title: 'Reset Password',
        description: 'SOMETHING WENT WRONG',
      });
    } finally {
      setIsLoadingSetNewPassword(false);
    }
  };

  if (errorQuery && errorQuery === 'INVALID_TOKEN') {
    return <div>Token Invalid</div>;
  }

  if (tokenQuery && tokenQuery.length !== 0) {
    return (
      <div className="container">
        <Card className="p-6 md:p-10 mt-10 mx-auto max-w-[650px]">
          <CardHeader className="flex flex-col">
            <h2 className="text-center text-2xl md:text-4xl">Reset Your Password</h2>
            <h2 className="text-gray-500 text-center mt-3 text-xs md:text-xl">
              Please enter your new password below.
            </h2>
          </CardHeader>
          <form onSubmit={formResetNewPassword(onSubmitSetNewPassword)}>
            <div>
              <Label htmlFor="newPassword" className="text-xs md:text-[1rem]">New Password</Label>
              <Controller
                name="newPassword"
                control={controlNewPassword}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="password"
                    disabled={isLoadingSetNewPassword}
                    required
                    placeholder="Enter Your New Password"
                    showPasswordToggle
                  />
                )}
              />
              {errorsNewPassword.newPassword && <div className="text-red-500 ml-2 text-xs">{errorsNewPassword.newPassword?.message}</div>}
            </div>
            <div className="mt-5">
              <Label htmlFor="confirmNewPassword" className="text-xs md:text-[1rem]">Confirm Password</Label>
              <Controller
                name="confirmNewPassword"
                control={controlNewPassword}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="password"
                    disabled={isLoadingSetNewPassword}
                    required
                    placeholder="Enter Confirm Password"
                    showPasswordToggle
                  />
                )}
              />
              {errorsNewPassword.confirmNewPassword && <div className="text-red-500 ml-2 text-xs">{errorsNewPassword.confirmNewPassword?.message}</div>}
            </div>

            <div className=" flex justify-center items-center w-60 mx-auto">
              <Button className="mt-5 " variant="gooeyLeft" color="primary" type="submit" isLoading={isLoadingSetNewPassword}>
                Reset password
              </Button>
            </div>
          </form>
          <div className="mt-5">
            <Link href="/auth/login" className="link">
              <div className="flex gap-2">
                <MoveLeft />
                <div>Back to the login page</div>
              </div>
            </Link>
          </div>
        </Card>
      </div>

    );
  }

  return (
    <div className="container">
      <Card className="p-6 md:p-10 mt-10 mx-auto max-w-[650px]">
        <CardHeader className="flex flex-col">
          <h2 className="text-center text-2xl md:text-4xl">Reset Your Password</h2>
          <h2 className="text-white/50 text-center mt-3 text-xs md:text-xl">
            Please enter your email to receive a password reset link.
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={formResetSendEmail(onSubmit)}>
            <Label htmlFor="email" className="text-xs md:text-[1rem]">Email</Label>
            <Controller
              name="email"
              control={controlSendEmail}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  disabled={isLoading}
                  required
                />
              )}
            />
            {errorsSendEmail.email && <div className="text-red-500 ml-2 text-xs">{errorsSendEmail.email?.message}</div>}
            <div className="flex flex-row justify-center items-center w-60 gap-5 mx-auto mt-5 ">
              <Button className="mt-5 " variant="gooeyLeft" color="primary" type="submit" isLoading={isLoading}>
                Send Email
              </Button>
              <Link className="mt-5 border p-2 rounded-md transition-all hover:border-white/50" href="https://mail.google.com/mail/u/0/" target="_blank">
                Open Mail
                {' '}
              </Link>
            </div>
          </form>
          <div className="mt-5 max-w-60 mr-auto">
            <Link href="/auth/login" className="link">
              <div className="flex gap-2 hover:underline">
                <MoveLeft />
                <div>Back to the login page</div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
