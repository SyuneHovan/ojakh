// App.js
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ThemeProvider, useTheme } from './src/context/ThemeContext'; // Import provider and hook
import RecipeFormScreen from './src/screens/RecipeFormScreen';
import RecipeListScreen from './src/screens/RecipeListScreen';
import RecipeViewScreen from './src/screens/RecipeViewScreen';

const Stack = createNativeStackNavigator();

// Create a new component for our main App content
const AppContent = () => {
  const { scheme, colors } = useTheme(); // Use our custom theme hook

  // Create a custom navigation theme that uses our colors
  const navigationTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator 
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text }
        }}
      >
        <Stack.Screen name="Krakaran Recipes" component={RecipeListScreen} />
        <Stack.Screen name="RecipeView" component={RecipeViewScreen} options={({ route }) => ({ title: route.params?.recipe?.title || 'Ճաշատեսակ' })} />
        <Stack.Screen name="RecipeForm" component={RecipeFormScreen} options={({ route }) => ({ title: route.params ? 'Խմբագրել ճաշատեսակը' : 'Աւելացնել ճաշատեսակ' })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// The main App component now just wraps everything in the ThemeProvider
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}