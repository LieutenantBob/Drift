export const colors = {
  night:       '#0A090F',
  midnight:    '#06050C',
  ink:         '#1C1814',
  ink2:        '#3D3530',
  muted:       '#8C8070',
  amber:       '#C4875A',
  indigo:      '#3D4B7A',
  teal:        '#7A9E8E',
  rose:        '#B07080',
  gold:        '#C9A84C',
  parchment:   '#F5F0E8',
  paper2:      '#EDE8DC',
} as const;

export type ColorKey = keyof typeof colors;
