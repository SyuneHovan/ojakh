// src/theme/colors.js

const palette = {
  terracotta: '#D95B43',
  deepTeal: '#2A5254',
  parchment: '#FBF5E8',
  charcoal: '#212121',
  mutedBrown: '#7E6C53',
  darkCard: '#2d2d2d',
  white: '#ffffff',
};

export const lightTheme = {
  background: palette.parchment,
  card: palette.white,
  text: palette.charcoal,
  primary: palette.terracotta, // Terracotta is the main color for light mode
  accent: palette.deepTeal,
  border: '#EAE0CC', // A lighter version of the parchment/brown
  subtleText: palette.mutedBrown,
};

export const darkTheme = {
  background: palette.charcoal,
  card: palette.darkCard,
  text: palette.parchment,
  primary: palette.terracotta, // Terracotta stands out well in dark mode
  accent: '#74A0A2', // A slightly lighter teal for better contrast
  border: '#444444',
  subtleText: palette.mutedBrown,
};