import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Button,
	KeyboardAvoidingView, Platform,
	ScrollView,
	StyleSheet,
	Text, TextInput,
	TouchableOpacity,
	View
} from 'react-native';
import apiClient from '../api/client';
import AddIngredientModal from '../components/AddIngredientModal';
import { useTheme } from '../context/ThemeContext';

const RecipeFormScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([{ header: '', description: '' }]);
  const [loading, setLoading] = useState(false);
  const recipeId = route.params?.recipeId;
  const isEditing = !!recipeId;

  // --- NEW: State to control the modal's visibility ---
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchRecipe = async () => {
        setLoading(true);
        try {
          const response = await apiClient.get(`/recipes/${recipeId}`);
          const recipe = response.data;
          setTitle(recipe.title);
          setCategory(recipe.category || '');
          setCoverImageUrl(recipe.cover_image_url || '');
          setIngredients(recipe.ingredients || []);
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
  
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };
  
  // --- NEW: Function to handle adding an ingredient from the modal ---
  const handleAddIngredient = (ingredientName) => {
    // Add the new ingredient to our list with a blank amount
    setIngredients([...ingredients, { name: ingredientName, amount: '' }]);
  };

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
    return <View style={styles.container}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g., Classic Pancakes" placeholderTextColor={colors.subtleText} />
          
          <Text style={styles.label}>Category</Text>
          <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g., Breakfast" placeholderTextColor={colors.subtleText} />

          <Text style={styles.label}>Cover Image URL</Text>
          <TextInput style={styles.input} value={coverImageUrl} onChangeText={setCoverImageUrl} placeholder="https://example.com/image.jpg" placeholderTextColor={colors.subtleText} />

          <Text style={styles.sectionTitle}>Ingredients</Text>
          {ingredients.map((ing, index) => (
            <View key={index} style={styles.dynamicRow}>
              {/* We no longer need the autocomplete here, just a simple text display */}
              <Text style={styles.ingredientName}>{ing.name}</Text>
              <TextInput
                style={styles.inputAmount}
                placeholder="Amount"
                value={ing.amount}
                onChangeText={(text) => handleIngredientChange(index, 'amount', text)}
                placeholderTextColor={colors.subtleText}
              />
              <TouchableOpacity onPress={() => removeIngredient(index)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
          {/* This button now opens the modal */}
          <Button title="Add Ingredient" onPress={() => setIsModalVisible(true)} color={colors.primary} />

          <Text style={styles.sectionTitle}>Steps</Text>
          {steps.map((step, index) => (
            <View key={index} style={styles.dynamicSection}>
              <TextInput style={styles.input} placeholder={`Step ${index + 1} Title`} value={step.header} onChangeText={(text) => handleStepChange(index, 'header', text)} placeholderTextColor={colors.subtleText} />
              <TextInput style={styles.inputMulti} multiline placeholder="Describe the step..." value={step.description} onChangeText={(text) => handleStepChange(index, 'description', text)} placeholderTextColor={colors.subtleText} />
              <TouchableOpacity onPress={() => removeStep(index)}><Text style={styles.removeText}>Remove Step</Text></TouchableOpacity>
            </View>
          ))}
          <Button title="Add Step" onPress={addStep} color={colors.primary} />

          <View style={styles.saveButton}>
            <Button title={isEditing ? 'Update Recipe' : 'Save Recipe'} onPress={handleSaveRecipe} color={colors.accent} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Render our new modal */}
      <AddIngredientModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAddIngredient={handleAddIngredient}
      />
    </>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: colors.text },
  input: { height: 40, borderColor: colors.border, borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 10, color: colors.text, backgroundColor: colors.card },
  inputMulti: { height: 80, borderColor: colors.border, borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 10, textAlignVertical: 'top', color: colors.text, backgroundColor: colors.card },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 20, color: colors.text },
  dynamicRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  ingredientName: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginRight: 10,
  },
  inputAmount: {
    height: 40,
    width: 120,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    color: colors.text,
    backgroundColor: colors.card,
  },
  dynamicSection: { marginBottom: 15, padding: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 5 },
  removeText: { color: colors.accent },
  saveButton: { marginTop: 30, marginBottom: 50 },
});

export default RecipeFormScreen;
