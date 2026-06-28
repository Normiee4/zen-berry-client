export const getToday = (): string => new Date().toISOString().slice(0, 10)

export const getYesterday = (): string =>
  new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

export const getDaysAgo = (days: number): string =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

export const daysBetween = (date1: string, date2: string): number =>
  Math.round((new Date(date2).getTime() - new Date(date1).getTime()) / (24 * 60 * 60 * 1000))

export const getCurrentHour = (): number => new Date().getHours()

export const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}
