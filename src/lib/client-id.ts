export function qunCreateClientID(now: number, random_value: number): string {
  const time_part = now.toString(36)
  const random_part = random_value.toString(36).replace('.', '').slice(1, 13)
  return `q-${time_part}-${random_part}`
}
