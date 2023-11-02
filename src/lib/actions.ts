'use server'

import { revalidatePath } from 'next/cache'

export const invalidatePath = async (p: string) => revalidatePath(p)
