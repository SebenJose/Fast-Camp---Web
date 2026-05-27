export const localStore = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      console.error("Erro ao escrever no localStorage", e)
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error("Erro ao deletar do localStorage", e)
    }
  },
}

export const sessionStore = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return
    try {
      sessionStorage.setItem(key, value)
    } catch (e) {
      console.error("Erro ao escrever no sessionStorage", e)
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return
    try {
      sessionStorage.removeItem(key)
    } catch (e) {
      console.error("Erro ao deletar do sessionStorage", e)
    }
  },
}
