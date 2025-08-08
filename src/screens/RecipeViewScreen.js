import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Button, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiClient from '../api/client';

const RecipeViewScreen = ({ route, navigation }) => {
  const { recipeId } = route.params; // Get the ID
  const [recipe, setRecipe] = useState(null); // State to hold the full recipe
  const [loading, setLoading] = useState(true);

  // Fetch the full recipe data when the screen loads
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/recipes/${recipeId}`);
        
        setRecipe(response.data);
      } catch (error) {
        console.error("Failed to fetch recipe", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [recipeId]);

  // Add an "Edit" button to the header
  useLayoutEffect(() => {
    if (recipe) { // Only show the button if the recipe has loaded
      navigation.setOptions({
        headerRight: () => (
          <Button 
            title="Edit" 
            onPress={() => navigation.navigate('RecipeForm', { recipeId: recipe.id })}
          />
        ),
        title: recipe.title
      });
    }
  }, [navigation, recipe]);

  // State for checklists
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [checkedSteps, setCheckedSteps] = useState([]);

  // ... (The toggleIngredient and toggleStep functions are the same as before)
  const toggleIngredient = (index) => {
    const newChecked = [...checkedIngredients];
    if (newChecked.includes(index)) {
      setCheckedIngredients(newChecked.filter((i) => i !== index));
    } else {
      newChecked.push(index);
      setCheckedIngredients(newChecked);
    }
  };
  const toggleStep = (index) => {
    const newChecked = [...checkedSteps];
    if (newChecked.includes(index)) {
      setCheckedSteps(newChecked.filter((i) => i !== index));
    } else {
      newChecked.push(index);
      setCheckedSteps(newChecked);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  if (!recipe) {
    return <Text>Recipe not found.</Text>;
  }

  // The rest of the JSX is the same as before, using the 'recipe' state variable
  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: recipe.cover_image_url || 'https://via.placeholder.com/400' }} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{recipe.title}</Text>
        {recipe.category && <View style={styles.tag}><Text style={styles.tagText}>{recipe.category}</Text></View>}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredients.map((ingredient, index) => (
          <TouchableOpacity key={index} style={styles.checklistItem} onPress={() => toggleIngredient(index)}>
            <MaterialCommunityIcons name={checkedIngredients.includes(index) ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'} size={24} color={checkedIngredients.includes(index) ? '#4CAF50' : '#ccc'} />
            <Text style={[styles.checklistItemText, checkedIngredients.includes(index) && styles.checkedText]}><Text style={styles.ingredientAmount}>{ingredient.amount}</Text> {ingredient.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Directions</Text>
        {recipe.steps.map((step, index) => (
          <TouchableOpacity key={index} style={styles.stepItem} onPress={() => toggleStep(index)}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text><MaterialCommunityIcons name={checkedSteps.includes(index) ? 'check-circle' : 'circle-outline'} size={20} color={checkedSteps.includes(index) ? '#4CAF50' : '#ccc'} /></View>
            <View style={styles.stepContent}><Text style={[styles.stepHeader, checkedSteps.includes(index) && styles.checkedText]}>{step.header}</Text><Text style={[styles.stepDescription, checkedSteps.includes(index) && styles.checkedText]}>{step.description}</Text></View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

// --- Stylesheet is the same as before ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 250 },
  detailsContainer: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  tag: { backgroundColor: '#E0E0E0', borderRadius: 15, paddingVertical: 5, paddingHorizontal: 15, alignSelf: 'flex-start' },
  tagText: { fontWeight: '500', color: '#333' },
  section: { paddingHorizontal: 20, paddingBottom: 20, borderTopWidth: 8, borderTopColor: '#f7f7f7' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 20, marginBottom: 15 },
  checklistItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  checklistItemText: { fontSize: 16, marginLeft: 15, flex: 1 },
  ingredientAmount: { fontWeight: 'bold' },
  checkedText: { textDecorationLine: 'line-through', color: '#aaa' },
  stepItem: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
  stepNumber: { alignItems: 'center', marginRight: 15 },
  stepNumberText: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginBottom: 5 },
  stepContent: { flex: 1 },
  stepHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  stepDescription: { fontSize: 16, lineHeight: 24, color: '#555' },
});


export default RecipeViewScreen;