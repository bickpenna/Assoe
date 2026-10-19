/** Restituisce un IBAN senza spazi solo se supera il controllo formale MOD 97. */
export function validIbanOrUndefined(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  const iban = value.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban)) return undefined;

  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;

  for (const character of rearranged) {
    const digits = character >= 'A' ? String(character.charCodeAt(0) - 55) : character;
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  }

  return remainder === 1 ? iban : undefined;
}
