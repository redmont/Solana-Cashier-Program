export const pluralise = (amount: number, singular: string, plural: string) =>
  amount === 1 ? singular : plural;

export const md = (strings: TemplateStringsArray, ...values: any[]): string => {
  let result = '';

  strings.forEach((str, i) => {
    result += str + (values[i] || '');
  });

  return result.replace(/\n/g, '  \n');
};

export const signedNumberFormat = new Intl.NumberFormat('en-US', {
  signDisplay: 'exceptZero',
  maximumFractionDigits: 6,
});
