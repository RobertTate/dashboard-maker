export const modesMap = {
  dark: "Dark",
  light: "Light",
};

export const themesMap = {
  default: "Default",
  avocado: "Avocado",
  sapphire: "Sapphire",
  rose: "Rose",
  ember: "Ember",
  forest: "Forest",
  sunset: "Sunset",
  aurora: "Aurora",
  oceanfloor: "Ocean Floor",
  desertdusk: "Desert Dusk",
  glacier: "Glacier",
  emberglow: "Ember Glow",
  steel: "Steel",
  royal: "Royal",
  coralteal: "Coral Teal",
  goldviolet: "Gold Violet",
  skynight: "Sky Night",
  mosswine: "Moss Wine",
  sandsea: "Sand Sea",
  berrycitrus: "Berry Citrus",
  icefire: "Ice Fire",
  orchidjade: "Orchid Jade",
  sunforest: "Sun Forest",
  stormrose: "Storm Rose",
  charcoal: "Charcoal",
  jade: "Jade",
};

export type Theme = keyof typeof themesMap;
export type Mode = keyof typeof modesMap;
