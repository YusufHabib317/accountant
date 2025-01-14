import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { sendEmail } from '@/utils/email';
import { db } from './db';
import { getBaseUrl } from './get-base-url';

const baseUrl = getBaseUrl();

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),

  rateLimit: {
    window: 10,
    max: 100,
  },

  session: {
    expiresIn: 60 * 60,
    updateAge: 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendResetPassword: async (user: any, url: any) => {
      const resetUrl = url
        .replace(/\/auth\/auth\//, '/auth/')
        .replace(/^https?:\/\/localhost:\d+/, baseUrl);

      await sendEmail({
        email: user.email,
        subject: 'Reset your password',
        message: `Click the link to reset your password: ${resetUrl}`,
      });
    },
  },

  autoSignIn: false,

  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 6000,
      async sendVerificationOTP({ email, otp, type }) {
        await sendEmail({
          email,
          subject: 'Your Code Verification',
          message: `Please use this code to complete your verification.\n ${otp}`,
        });
      },
    }),
  ],

  trustedOrigins: [
    baseUrl,
    `${baseUrl}/api/auth`,
    `${baseUrl}/api/auth/login`,
    `${baseUrl}/api/auth/register`,
    `${baseUrl}/api/auth/reset-password`,
    `${baseUrl}/api/auth/otp-email-verification`,
    ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:*'] : []),
  ],

  cors: {
    credentials: true,
    allowedHeaders: ['content-type', 'authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    origin: (requestOrigin: any, callback: (arg0: null, arg1: boolean) => void) => {
      callback(null, true);
    },
  },
});
