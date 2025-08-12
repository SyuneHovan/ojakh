// src/theme/colors.js

const palette = {
  terracotta: '#E2725B', // A rustic, reddish-brown
  olive: '#8A9A5B',       // A muted, earthy green
  cream: '#F5F5DC',
  offBlack: '#202020',
  lightGray: '#f0f0f0',
  mediumGray: '#a0a0a0',
  white: '#ffffff',
};

export const lightTheme = {
  background: palette.cream,
  card: palette.white,
  text: palette.offBlack,
  primary: palette.olive, // Olive is the main color for light mode
  accent: palette.terracotta,
  border: palette.lightGray,
  subtleText: palette.mediumGray,
};

export const darkTheme = {
  background: palette.offBlack,
  card: '#282828',
  text: palette.cream,
  primary: palette.terracotta, // Terracotta is the main color for dark mode
  accent: palette.olive,
  border: '#333333',
  subtleText: palette.mediumGray,
};