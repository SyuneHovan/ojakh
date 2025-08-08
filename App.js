import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RecipeFormScreen from './src/screens/RecipeFormScreen';
import RecipeListScreen from './src/screens/RecipeListScreen';
import RecipeViewScreen from './src/screens/RecipeViewScreen'; // Import the new screen

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Krakaran Recipes"
          component={RecipeListScreen} 
        />
        {/* Add the View Screen to the stack */}
        <Stack.Screen 
          name="RecipeView"
          component={RecipeViewScreen}
          options={({ route }) => ({ title: route.params?.recipe?.title || 'Recipe' })}
        />
        <Stack.Screen 
          name="RecipeForm" 
          component={RecipeFormScreen} 
          options={({ route }) => ({ 
            title: route.params?.recipe ? 'Edit Recipe' : 'Add New Recipe' 
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}