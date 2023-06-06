
export const truncateString = (str: string, length: number) =>
str ? `${str.slice(0, length)}…${str.slice(-length)}` : ''