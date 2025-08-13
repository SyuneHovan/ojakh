// src/theme/colors.js

const palette = {
  slate: '#18252A',
  linen: '#F5EFE6',
  terracotta: '#8B3A1F',
  charcoal: '#212121',
  walnut: '#4A413A',
  error: '#631C04',

  slate100: '#23383E',
  linen100: '#DCD1C4',
  terracotta100: '#B95233',
  charcoal100: '#366A73',
  walnut100: '#6D6158',

  slate200: '#2E484F',
  linen200: '#C2B6A9',
  terracotta200: '#D56B4A',
  charcoal200: '#4F8992',
  walnut200: '#8B7C71',
  
  slate300: '#3D5C65',
  linen300: '#A89C8F',
  terracotta300: '#E48A6F',
  charcoal300: '#70A5AD',
  walnut300: '#A99C92',
  
  slate400: '#52747D',
  linen400: '#8E8276',
  terracotta400: '#F2A994',
  charcoal400: '#94C1C8',
  walnut400: '#C6BDB6',
};



export const lightTheme = {
  background: palette.slate,
  card: palette.walnut400,
  text: palette.slate,
  primary: palette.terracotta,
  accent: palette.slate400,
  border: '#EAE0CC', // A lighter version of the parchment/brown
  subtleText: palette.linen400,
  error: palette.error,
  pasiveText: palette.slate200,
  white: '#fff'
};

export const darkTheme = {
  background: palette.slate,
  card: palette.walnut400,
  text: palette.parchment,
  primary: palette.terracotta,
  accent: palette.slate400,
  border: '#444444',
  subtleText: palette.linen400,
  error: palette.error,
  pasiveText: palette.slate200,
  white: '#fff'
};