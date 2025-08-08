// --- Imports ---
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import apiClient from '../api/client';

const CATEGORIES = ['Ապուր', 'Թխուածք', 'Պահածո', 'Աղցան'];

const RecipeListScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();   
  
  const [allRecipes, setAllRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchRecipes = async () => {
    try {
      const response = await apiClient.get('/recipes');
      setAllRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };
  
  useEffect(() => {
    if (isFocused) {
      fetchRecipes();
    }
  }, [isFocused]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title="New" onPress={() => navigation.navigate('RecipeForm')} />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    let recipes = [...allRecipes];
    if (searchTerm) {
      recipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory) {
      recipes = recipes.filter(recipe => recipe.category === selectedCategory);
    }
    setFilteredRecipes(recipes);
  }, [searchTerm, selectedCategory, allRecipes]);
  
  const clearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
  };

  // =================================================================
  // --- NEW: Function to Handle Deleting a Recipe ---
  // =================================================================
  const handleDelete = (recipeId) => {
    // Show a confirmation dialog before deleting
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to permanently delete this recipe?",
      [
        // The "Cancel" button
        {
          text: "Cancel",
          style: "cancel"
        },
        // The "Delete" button
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              await apiClient.delete(`/recipes/${recipeId}`);
              // After successful deletion, update the state to remove the recipe from the list
              setAllRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));
              Alert.alert("Success", "Recipe deleted.");
            } catch (error) {
              console.error('Failed to delete recipe:', error);
              Alert.alert("Error", "Failed to delete the recipe.");
            }
          },
          style: "destructive" 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput style={styles.searchBar} placeholder="Search for a recipe..." value={searchTerm} onChangeText={setSearchTerm} />
      <View style={styles.categoryContainer}>
        {CATEGORIES.map(category => (
          <TouchableOpacity key={category} style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonSelected]} onPress={() => setSelectedCategory(category)}>
            <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextSelected]}>{category}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={clearFilters}><Text style={styles.clearText}>Clear</Text></TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredRecipes}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('RecipeView', { recipeId: item.id })}>
            <View style={styles.recipeItem}>
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>{item.title}</Text>
                <Text style={styles.recipeCategory}>{item.category}</Text>
              </View>
              {/* --- NEW: Delete Button --- */}
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No recipes found. Try adding one!</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

// --- Updated Styling ---
const styles = StyleSheet.create({
  // ...other styles are the same
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#f8f8f8' },
  searchBar: { height: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, marginBottom: 16, backgroundColor: '#fff', fontSize: 16 },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' },
  categoryButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#007AFF', margin: 4 },
  categoryButtonSelected: { backgroundColor: '#007AFF' },
  categoryText: { color: '#007AFF', fontWeight: '500' },
  categoryTextSelected: { color: '#fff' },
  clearText: { color: '#FF3B30', fontWeight: '500', padding: 8 },
  // Updated recipeItem to support layout
  recipeItem: { 
    backgroundColor: '#fff', 
    padding: 16, 
    marginBottom: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#eee', 
    flexDirection: 'row',        // Lays out children side-by-side
    justifyContent: 'space-between', // Pushes children to opposite ends
    alignItems: 'center'         // Aligns items vertically
  },
  recipeInfo: {
    flex: 1, // Allows this view to take up available space
  },
  recipeTitle: { fontSize: 18, fontWeight: 'bold' },
  recipeCategory: { fontSize: 14, color: '#666', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
  // New styles for the delete button
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default RecipeListScreen;