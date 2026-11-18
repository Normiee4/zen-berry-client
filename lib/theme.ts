export const THEME_CLASS_MAP: Record<string, string> = {
  'light-zen': '',
  'warm-earth': 'warm-earth',
  'cozy-dark': 'cozy-dark',
}

export const THEME_COOKIE_KEY = 'zenberry_theme'
export const THEME_LOCAL_STORAGE_KEY = 'zenberry_theme'

/** Browser-only: applies a theme class to <html> and persists it in cookie + localStorage. */
export function applyTheme(theme: string) {
  const cls = THEME_CLASS_MAP[theme] ?? ''
  document.documentElement.className = cls
  document.cookie = `${THEME_COOKIE_KEY}=${theme}; path=/; max-age=31536000`
  localStorage.setItem(THEME_LOCAL_STORAGE_KEY, theme)
}
