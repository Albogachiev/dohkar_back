import { Prisma } from "@prisma/client";

export const authUserSelect = {
  id: true,
  phone: true,
  email: true,
  isPremium: true,
  role: true,
  provider: true,
} satisfies Prisma.UserSelect;

export type AuthUserPayload = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;
