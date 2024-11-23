'use server';

import { getUserByEmail } from '@/db';

export const checkEmailExists = async (email: string) => {
  try {
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return {
        success: true,
        message: 'Email exists',
      };
    }
    return {
      success: false,
      message: 'Email does not exist',
    };
  } catch {
    return {
      success: false,
      message: 'Something went wrong while checking the email',
    };
  }
};
