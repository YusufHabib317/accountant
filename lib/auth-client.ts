import { emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const {
  signIn,
  signUp,
  useSession,
  emailOtp,
  forgetPassword,
  resetPassword,
  signOut,
} = createAuthClient({
  baseURL: 'https://accountant-zz8m.onrender.com',
  plugins: [emailOTPClient()],
});
