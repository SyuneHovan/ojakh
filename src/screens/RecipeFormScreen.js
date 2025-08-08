import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import apiClient from '../api/client';

const RecipeFormScreen = ({ route, navigation }) => {
  const recipeId = route.params?.recipeId; // Get ID if editing
  const isEditing = !!recipeId;

  // Form field states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState([{ header: '', description: '' }]);
  const [loading, setLoading] = useState(false);

  // Fetch recipe data if we are in "edit" mode
  useEffect(() => {
    if (isEditing) {
      const fetchRecipe = async () => {
        setLoading(true);
        try {
          const response = await apiClient.get(`/recipes/${recipeId}`);
          const recipe = response.data;
          // Pre-fill the form
          setTitle(recipe.title);
          setCategory(recipe.category || '');
          setCoverImageUrl(recipe.cover_image_url || '');
          setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: '', amount: '' }]);
          setSteps(recipe.steps.length > 0 ? recipe.steps : [{ header: '', description: '' }]);
        } catch (error) {
          console.error("Failed to fetch recipe for editing", error);
        } finally {
          setLoading(false);
        }
      };
      fetchRecipe();
    }
  }, [recipeId, isEditing]);

  // ... (All the handler functions like handleIngredientChange, addIngredient, etc. are the same)
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };
  const addIngredient = () => { setIngredients([...ingredients, { name: '', amount: '' }]) };
  const removeIngredient = (index) => { setIngredients(ingredients.filter((_, i) => i !== index)) };
  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };
  const addStep = () => { setSteps([...steps, { header: '', description: '' }]) };
  const removeStep = (index) => { setSteps(steps.filter((_, i) => i !== index)) };

  const handleSaveRecipe = async () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a title for the recipe.');
      return;
    }
    const recipeData = { title, category, cover_image_url: coverImageUrl, ingredients, steps };
    try {
      if (isEditing) {
        await apiClient.put(`/recipes/${recipeId}`, recipeData);
      } else {
        await apiClient.post('/recipes', recipeData);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save recipe:', error);
      Alert.alert('Error', 'Failed to save the recipe.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  // The form JSX is the same as before
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Title</Text><TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g., Classic Pancakes" />
      <Text style={styles.label}>Category</Text><TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g., Breakfast" />
      <Text style={styles.label}>Cover Image URL</Text><TextInput style={styles.input} value={coverImageUrl} onChangeText={setCoverImageUrl} placeholder="https://example.com/image.jpg" />
      <Text style={styles.sectionTitle}>Ingredients</Text>
      {ingredients.map((ing, index) => (
        <View key={index} style={styles.dynamicRow}><TextInput style={styles.inputRow} placeholder="Name (e.g., Flour)" value={ing.name} onChangeText={(text) => handleIngredientChange(index, 'name', text)} /><TextInput style={styles.inputRow} placeholder="Amount (e.g., 1 cup)" value={ing.amount} onChangeText={(text) => handleIngredientChange(index, 'amount', text)} /><TouchableOpacity onPress={() => removeIngredient(index)}><Text style={styles.removeText}>Remove</Text></TouchableOpacity></View>
      ))}
      <Button title="Add Ingredient" onPress={addIngredient} />
      <Text style={styles.sectionTitle}>Steps</Text>
      {steps.map((step, index) => (
        <View key={index} style={styles.dynamicSection}><TextInput style={styles.input} placeholder={`Step ${index + 1} Title`} value={step.header} onChangeText={(text) => handleStepChange(index, 'header', text)} /><TextInput style={styles.inputMulti} multiline placeholder="Describe the step..." value={step.description} onChangeText={(text) => handleStepChange(index, 'description', text)} /><TouchableOpacity onPress={() => removeStep(index)}><Text style={styles.removeText}>Remove Step</Text></TouchableOpacity></View>
      ))}
      <Button title="Add Step" onPress={addStep} />
      <View style={styles.saveButton}><Button title={isEditing ? 'Update Recipe' : 'Save Recipe'} onPress={handleSaveRecipe} /></View>
    </ScrollView>
  );
};

// --- Stylesheet is the same as before ---
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 10 },
  inputMulti: { height: 80, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 10, textAlignVertical: 'top' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 },
  dynamicRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  inputRow: { flex: 1, height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginRight: 10 },
  dynamicSection: { marginBottom: 15, padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 5 },
  removeText: { color: 'red' },
  saveButton: { marginTop: 30, marginBottom: 50 },
});

export default RecipeFormScreen;