import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import apiClient from '../api/client';
import { useTheme } from '../context/ThemeContext'; // Import theme hook

const RecipeListScreen = () => {
  const { colors } = useTheme(); // Get theme colors
  const styles = getStyles(colors); // Generate styles with theme colors
  const navigation = useNavigation();
  const isFocused = useIsFocused();   
  
  const [allRecipes, setAllRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recipesResponse, categoriesResponse] = await Promise.all([
        apiClient.get('/recipes'),
        apiClient.get('/categories')
      ]);
      setAllRecipes(recipesResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
        <Button title="Աւելացնել" onPress={() => navigation.navigate('RecipeForm')} color={colors.primary} />
      ),
    });
  }, [navigation, colors]); // Add colors to dependency array

  useEffect(() => {
    // ... filtering logic is the same ...
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
  
  const handleDelete = (recipeId) => { /* ... delete logic ... */ };
  const handleSelectCategory = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory('');
    } else {
      setSelectedCategory(category);
    }
  };

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <TextInput 
        style={styles.searchBar} 
        placeholder="Search for a recipe..."
        placeholderTextColor={colors.subtleText}
        value={searchTerm} 
        onChangeText={setSearchTerm} 
      />
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
          <TouchableOpacity onPress={() => setSelectedCategory('')} style={styles.clearButton}>
            <Text style={styles.clearText}>բոլորը</Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity 
              key={category} 
              style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonSelected]} 
              onPress={() => handleSelectCategory(category)}
            >
              <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextSelected]}>
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

// --- Styles converted to a function that uses theme colors ---
const getStyles = (colors) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  searchBar: { 
    height: 40, 
    borderWidth: 1, 
    borderColor: colors.border, 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    marginHorizontal: 16, 
    marginTop: 10, 
    backgroundColor: colors.card, 
    fontSize: 16,
    color: colors.text
  },
  categoryContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 10,
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.primary,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: colors.card,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  clearText: {
    color: colors.primary,
    fontSize: 16,
  },
  recipeItem: { 
    backgroundColor: colors.card, 
    padding: 16, 
    marginHorizontal: 16, 
    marginBottom: 12, 
    borderRadius: 8, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  recipeInfo: { 
    flex: 1 
  },
  recipeTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: colors.text
  },
  recipeCategory: { 
    fontSize: 14, 
    color: colors.subtleText, 
    marginTop: 4 
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 50, 
    fontSize: 16, 
    color: colors.subtleText
  },
  deleteButton: { 
    backgroundColor: colors.accent, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 5 
  },
  deleteButtonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
});

export default RecipeListScreen;