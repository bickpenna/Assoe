/** Ambiti editoriali delle iniziative, mantenute nello stesso tipo di documento. */
export const INITIATIVE_AREAS = [
  { value: 'social', title: 'Iniziative sociali' },
  { value: 'volunteering', title: 'Volontariato' },
] as const;

export type InitiativeArea = (typeof INITIATIVE_AREAS)[number]['value'];

export function isInitiativeArea(value: unknown): value is InitiativeArea {
  return INITIATIVE_AREAS.some((area) => area.value === value);
}

export function initiativeAreaLabel(value: unknown): string {
  return INITIATIVE_AREAS.find((area) => area.value === value)?.title ?? 'Ambito obbligatorio';
}

export function initiativeAreaError(value: unknown): string | undefined {
  return isInitiativeArea(value) ? undefined : 'Scegli Iniziative sociali oppure Volontariato.';
}
