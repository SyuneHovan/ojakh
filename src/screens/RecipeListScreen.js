import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Button,
  FlatList,
  SafeAreaView,
  ScrollView // Import ScrollView
  ,



  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import apiClient from '../api/client';

const RecipeListScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();   
  
  const [allRecipes, setAllRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [categories, setCategories] = useState([]);

  const fetchData = async () => {
    try {
      const [recipesResponse, categoriesResponse] = await Promise.all([
        apiClient.get('/recipes'),
        apiClient.get('/categories')
      ]);
      setAllRecipes(recipesResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  useEffect(() => {
    if (isFocused) {
      fetchData();
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
  };

  const handleSelectCategory = (category) => {
    // If the selected category is tapped again, unselect it
    if (selectedCategory === category) {
      setSelectedCategory('');
    } else {
      setSelectedCategory(category);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput style={styles.searchBar} placeholder="Search for a recipe..." value={searchTerm} onChangeText={setSearchTerm} />
      
      <View>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearText}>All</Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity 
              key={category} 
              style={[
                styles.categoryButton, 
                selectedCategory === category && styles.categoryButtonSelected
              ]} 
              onPress={() => handleSelectCategory(category)}
            >
              <Text style={[
                styles.categoryText, 
                selectedCategory === category && styles.categoryTextSelected
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No recipes found. Try adding one!</Text>}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

// --- Stylesheet with updates for the horizontal scroll ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  searchBar: { height: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, marginHorizontal: 16, marginTop: 10, backgroundColor: '#fff', fontSize: 16 },
  categoryContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryButtonSelected: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  clearText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recipeItem: { backgroundColor: '#fff', padding: 16, marginHorizontal: 16, marginBottom: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recipeInfo: { flex: 1 },
  recipeTitle: { fontSize: 18, fontWeight: 'bold' },
  recipeCategory: { fontSize: 14, color: '#666', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
  deleteButton: { backgroundColor: '#FF3B30', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 5 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold' },
});


export default RecipeListScreen;