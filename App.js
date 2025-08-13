/** @format */

// App.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Import Tab Navigator
import {
  NavigationContainer
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WavyTabBar from './src/components/WavyTabBar';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import PantryScreen from './src/screens/PantryScreen'; // Import our new screen
import RecipeFormScreen from './src/screens/RecipeFormScreen';
import RecipeListScreen from './src/screens/RecipeListScreen';
import RecipeViewScreen from './src/screens/RecipeViewScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator(); // Create a Tab object

// This is our original stack of screens for viewing and editing recipes
const RecipeStack = () => {
  const { colors } = useTheme();
  const options = {
    headerTintColor: colors.white, // Sets title and back button color
    headerStyle: { backgroundColor: colors.background }, // Correct way to set background color
    headerShadowVisible: false, // Keeps the flat look
  }
	return (
		<Stack.Navigator>
			<Stack.Screen
				name='Recipes'
				component={RecipeListScreen}
				options={options}
			/>
			<Stack.Screen
				name='RecipeView'
				component={RecipeViewScreen}
        options={options}
			/>
			<Stack.Screen
				name='RecipeForm'
        component={RecipeFormScreen}
        options={options}
			/>
		</Stack.Navigator>
	);
};

// This is the new main navigator with tabs at the bottom
const MainTabNavigator = () => {
	const { colors } = useTheme();
	return (
		<Tab.Navigator
			// This is the key change: we provide our own component
			tabBar={(props) => <WavyTabBar {...props} />}
			screenOptions={{
				headerShown: false,
			}}>
			<Tab.Screen
				name='Recipes'
				component={RecipeStack}
			/>
			<Tab.Screen
				name='My Pantry'
				component={PantryScreen}
			/>
		</Tab.Navigator>
	);
};

// AppContent now renders our main Tab Navigator
const AppContent = () => {
	return (
		<NavigationContainer>
			<MainTabNavigator />
		</NavigationContainer>
	);
};

// The main App component remains the same
export default function App() {
	return (
		<ThemeProvider>
			<AppContent />
		</ThemeProvider>
	);
}
