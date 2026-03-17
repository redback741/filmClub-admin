import { z } from 'zod'

export type UserStatus = 'active' | 'inactive' | 'invited' | 'suspended'

const userRoleSchema = z.union([
  z.literal('superadmin'),
  z.literal('admin'),
  z.literal('cashier'),
  z.literal('manager'),
])

const userSchema = z.object({
  id: z.string(),
  nickName: z.string().optional().default(''),
  username: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  isFrozen: z.boolean().optional().default(false),
  role: userRoleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
