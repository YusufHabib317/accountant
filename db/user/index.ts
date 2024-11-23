import { db } from '@/lib/db';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    });
    console.log('Database query result:', user);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    return await db.user.findUnique({
      where: { id },
    });
  } catch {
    return null;
  }
};

export const deleteUserByEmail = async (email: string) => {
  try {
    return await db.user.delete({
      where: { email },
    });
  } catch {
    return null;
  }
};

export const verifyUserByEmail = async (email: string) => {
  try {
    return await db.user.update({
      where: { email },
      data: {
        emailVerified: true,
      },
    });
  } catch {
    return null;
  }
};
