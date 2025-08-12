// src/context/ThemeContext.js

import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../theme/colors';

// Create the context
export const ThemeContext = createContext();

// Create the provider component
export const ThemeProvider = ({ children }) => {
  // Get the system's current color scheme (light or dark)
  const scheme = useColorScheme();

  // Select our theme object based on the system scheme
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ scheme, colors: theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Create a custom hook to easily use the theme context
export const useTheme = () => useContext(ThemeContext);