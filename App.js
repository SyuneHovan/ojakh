// App.js
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Import Tab Navigator
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import PantryScreen from './src/screens/PantryScreen'; // Import our new screen
import RecipeFormScreen from './src/screens/RecipeFormScreen';
import RecipeListScreen from './src/screens/RecipeListScreen';
import RecipeViewScreen from './src/screens/RecipeViewScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator(); // Create a Tab object

// This is our original stack of screens for viewing and editing recipes
const RecipeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Ojakh Recipes" component={RecipeListScreen} />
      <Stack.Screen name="RecipeView" component={RecipeViewScreen} />
      <Stack.Screen name="RecipeForm" component={RecipeFormScreen} />
    </Stack.Navigator>
  );
};

// This is the new main navigator with tabs at the bottom
const MainTabNavigator = () => {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // We let the Stack Navigator handle its own header
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtleText,
        tabBarStyle: { backgroundColor: colors.card },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Recipes') {
            iconName = focused ? 'notebook' : 'notebook-outline';
          } else if (route.name === 'My Pantry') {
            iconName = focused ? 'fridge' : 'fridge-outline';
          }
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Recipes" component={RecipeStack} />
      <Tab.Screen name="My Pantry" component={PantryScreen} />
    </Tab.Navigator>
  );
};

// AppContent now renders our main Tab Navigator
const AppContent = () => {
  const { scheme, colors } = useTheme();
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
      <MainTabNavigator />
    </NavigationContainer>
  );
}

// The main App component remains the same
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}