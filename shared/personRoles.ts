/** Ordine gerarchico unico per Studio, pagina Associati e direttivo. */
export const PERSON_ROLE_GROUPS = [
  { role: 'president', label: 'Presidente', groupTitle: 'Presidenza', board: true },
  { role: 'vicePresident', label: 'Vicepresidente', groupTitle: 'Vicepresidenza', board: true },
  { role: 'secretary', label: 'Segretario', groupTitle: 'Segreteria', board: true },
  { role: 'boardMember', label: 'Consigliere', groupTitle: 'Consiglio direttivo', board: true },
  { role: 'civilServiceVolunteer', label: 'Volontario del servizio civile', groupTitle: 'Servizio civile', board: false },
  { role: 'volunteer', label: 'Volontario', groupTitle: 'Volontari', board: false },
] as const;

export type PersonRole = (typeof PERSON_ROLE_GROUPS)[number]['role'];

export function personRoleLabel(role: PersonRole): string {
  return PERSON_ROLE_GROUPS.find((group) => group.role === role)?.label ?? role;
}
