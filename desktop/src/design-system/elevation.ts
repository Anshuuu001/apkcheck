export const elevation = {
  base: 0,
  flat: 1,
  raised: 2,
  dropdown: 10,
  sticky: 100,
  modal: 1000,
  tooltip: 2000,
};
export type Elevation = keyof typeof elevation;
