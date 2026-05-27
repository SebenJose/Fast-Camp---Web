import type * as z from "zod"
import { sessionSchema } from "@/app/lib/validations/auth.schema"

export interface IUser {
  name: string
  email: string
  password: string
}

export type ISession = z.infer<typeof sessionSchema>

export interface AuthContextValue {
  session: ISession | null
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<string | null>
  signOut: () => void
}
