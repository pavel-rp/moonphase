export function makeTag(name: string, ...params: (string | number | undefined)[]): string {
  return [name, ...params.filter(Boolean)].join(':');
}