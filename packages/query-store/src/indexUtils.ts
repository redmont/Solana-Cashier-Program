export class IndexUtils {
  /**
   * Format fighter code names for use in the `matchFighters` field.
   * @param fighterCodeNames - The code names of the fighters.
   * @returns The formatted string.
   */
  static formatMatchFighters(fighterCodeNames: string[]) {
    return fighterCodeNames.map((codeName) => codeName.toLowerCase()).join('#');
  }
}
