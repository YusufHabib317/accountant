'use server';

import { getUserByEmail } from '@/db';

export const loginValidation = async (email: string) => {
  try {
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return {
        success: false,
        message: 'user not exist',
      };
    }

    if (!existingUser.emailVerified) {
      return {
        success: false,
        message: 'email not verified',
      };
    }
    return {
      success: true,
    };
  } catch (error) {
    console.log('🚀 ~ loginValidation ~ error:', error);
    return {
      success: false,
      message: 'something went wrong',
    };
  }
};
