export const sortOrdersMap = {
  insertion: "Old to New",
  az: "A to Z",
};

export type SortOrder = keyof typeof sortOrdersMap;

export const DEFAULT_SORT_ORDER: SortOrder = "insertion";
