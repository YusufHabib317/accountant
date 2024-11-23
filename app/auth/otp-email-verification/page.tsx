/* eslint-disable sonarjs/no-duplicate-string */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

import { deleteUserByEmail, verifyUserByEmail } from '@/db';
import { emailOtp } from '@/lib/auth-client';
import { checkEmailExists } from '@/actions';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState('');
  const [isLoadingVerify, setIsLoadingVerify] = useState(false);
  const [isLoadingResend, setIsLoadingResend] = useState(false);
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const email = searchParams.get('email');
  const router = useRouter();

  const handleVerifyOtp = async () => {
    setIsLoadingVerify(true);
    try {
      const user = await emailOtp.verifyEmail({
        email: email!,
        otp,
      });
      if (user.data !== null) {
        toast({
          title: 'OTP Verification',
          description: 'Successful',
        });
        await verifyUserByEmail(email!);
        router.push('/auth/login');
      } else if (user.error.status === 400) {
        toast({
          title: 'OTP Verification',
          description: user.error.message!,
        });
      }
    } catch {
      toast({
        title: 'OTP Verification',
        description: 'Something went wrong',
      });
      await deleteUserByEmail(email!);
      router.push('/auth/login');
    } finally {
      setIsLoadingVerify(false);
    }
  };

  const handleSendOtp = async () => {
    setIsLoadingResend(true);
    try {
      const checkExistEmail = await checkEmailExists(email as string);

      if (!checkExistEmail.success) {
        toast({
          title: 'OTP Verification',
          description: checkExistEmail.message,
        });
      } else {
        await emailOtp.sendVerificationOtp({
          email: email!,
          type: 'email-verification',
        });
        toast({
          title: 'OTP Verification',
          description: 'Check your Email',
        });
      }
    } catch {
      toast({
        title: 'OTP Verification',
        description: 'Something went wrong',
      });
    } finally {
      setIsLoadingResend(false);
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container my-10">
        <Card className="p-6 md:p-5 mt-5 mx-auto max-w-[500px]">
          <p className="text-center my-10 text-2xl">
            Enter
            {' '}
            <span className="text-emerald-500 font-bold underline">OTP</span>
            {' '}
            sent to your email:
          </p>
          <div className="flex justify-center items-center">
            <div className="flex flex-col gap-5">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || isLoadingVerify}
                className="w-40 mx-auto"
              >
                {isLoadingVerify ? 'Verifying...' : 'Verify'}
              </Button>
              <Button
                onClick={handleSendOtp}
                disabled={isLoadingResend}
                className="w-40 mx-auto"
              >
                {isLoadingResend ? 'Resending Otp...' : ' Resend otp'}
              </Button>
              <div className=" flex justify-between items-center w-[17rem] mx-auto">
                <Link href="/auth/login" className="link p-1 rounded-sm underline">
                  Back to Login
                </Link>
                <Link href="https://mail.google.com/mail/u/0/" target="_blank" className="link p-1 underline rounded-sm">
                  Open Mail
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Suspense>
  );
}
