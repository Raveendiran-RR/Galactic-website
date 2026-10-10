// Browser storage can throw (private windows, blocked cookies). Never let it break the app.
export const safeSession = {
  get(key: string): string | null {
    try {
      return window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      window.sessionStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
  },
}

export const safeLocal = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
  },
}

export const KEYS = {
  intro: 'rg.intro',
  mode: 'rg.mode',
}
