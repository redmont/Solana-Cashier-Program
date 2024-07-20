export const pluralise = (amount: number, singular: string, plural: string) =>
  amount === 1 ? singular : plural;
