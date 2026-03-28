export interface IUser {
  name: string
  email: string
  password: string
}

export interface ISession {
  name: string
  email: string
}

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
