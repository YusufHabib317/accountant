import { db } from '@/lib/db';

export const getPurchaseItemsByInvoiceId = async (purchaseInvoiceId: string) => {
  try {
    return await db.purchaseItem.findMany({
      where: {
        purchaseInvoiceId,
      },
      include: {
        product: true,
      },
    });
  } catch (error) {
    console.error('Error fetching purchase items by invoice ID:', error);
    throw new Error('Failed to fetch purchase items.');
  }
};
