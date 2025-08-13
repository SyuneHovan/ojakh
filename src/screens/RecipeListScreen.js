/** @format */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Image,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import apiClient from '../api/client';
import FlotingButton from '../components/FlotingButton';
import AddRecipeIcon from '../components/icons/AddRecipeIcon';
import { useTheme } from '../context/ThemeContext';

const RecipeListScreen = ({ route }) => {
	const { colors, scheme } = useTheme();
	const styles = getStyles(colors, scheme);
	const navigation = useNavigation();
	const isFocused = useIsFocused();
	const searchResults = route.params?.searchResults;

	const [allRecipes, setAllRecipes] = useState([]);
	const [filteredRecipes, setFilteredRecipes] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('');
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const handleData = async () => {
			setLoading(true);
			try {
				if (searchResults) {
					const response = await apiClient.post(
						'/recipes/find-by-ingredients',
						{ myIngredients: searchResults }
					);
					setAllRecipes(response.data);
					navigation.setParams({ searchResults: undefined });
				} else {
					const [recipesResponse, categoriesResponse] = await Promise.all([
						apiClient.get('/recipes'),
						apiClient.get('/categories'),
					]);
					setAllRecipes(recipesResponse.data);
					setCategories(categoriesResponse.data);
				}
			} catch (error) {
				console.error('Error handling data:', error);
			} finally {
				setLoading(false);
			}
		};

		if (isFocused) {
			handleData();
		}
	}, [isFocused, searchResults]);

	useEffect(() => {
		let recipes = [...allRecipes];
		if (searchTerm) {
			recipes = recipes.filter((recipe) =>
				recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		if (selectedCategory) {
			recipes = recipes.filter(
				(recipe) => recipe.category === selectedCategory
			);
		}
		setFilteredRecipes(recipes);
	}, [searchTerm, selectedCategory, allRecipes]);

	const handleDelete = (recipeId) => {
		Alert.alert(
			'Delete Recipe',
			'Are you sure you want to permanently delete this recipe?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					onPress: async () => {
						try {
							await apiClient.delete(`/recipes/${recipeId}`);
							setAllRecipes((prevRecipes) =>
								prevRecipes.filter((recipe) => recipe.id !== recipeId)
							);
						} catch (error) {
							console.error('Failed to delete recipe:', error);
							Alert.alert('Error', 'Failed to delete the recipe.');
						}
					},
					style: 'destructive',
				},
			]
		);
	};

	const handleSelectCategory = (category) => {
		if (selectedCategory === category) {
			setSelectedCategory('');
		} else {
			setSelectedCategory(category);
		}
	};

	// --- RENDER ITEM UPDATED FOR NEW UI ---
	const renderRecipeItem = ({ item }) => {
		return (
			<View style={[styles.card]}>
				<TouchableOpacity
					style={{ flex: 1 }}
					onPress={() =>
						navigation.navigate('RecipeView', { recipeId: item.id })
					}>
					<Image
						source={{
							uri:
								item.cover_image_url ||
								'https://placehold.co/600x400/EEE/31343C?text=No+Image',
						}}
						style={styles.cardImage}
					/>
					<View style={styles.cardTextContainer}>
						<Text style={styles.cardTitle}>{item.title}</Text>
						<Text style={styles.cardCategory}>{item.category}</Text>
					</View>
				</TouchableOpacity>
				<View style={styles.deleteButtonContainer}>
					<TouchableOpacity
						style={styles.deleteButton}
						onPress={() => handleDelete(item.id)}>
						<MaterialCommunityIcons
							name='delete'
							size={24}
							style={styles.deleteIcon}
						/>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	if (loading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator
					size='large'
					color={colors.primary}
				/>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.searchContainer}>
				<MaterialCommunityIcons
					name='magnify'
					size={22}
					style={styles.searchIcon}
				/>
				<TextInput
					style={styles.searchBar}
					placeholderTextColor={colors.subtleText}
					value={searchTerm}
					onChangeText={setSearchTerm}
				/>
			</View>

			<View>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.categoryContainer}>
					<TouchableOpacity
						onPress={() => setSelectedCategory('')}
						style={styles.allButton}>
						<Text
							style={[
								styles.allButtonText,
								{ opacity: !selectedCategory ? 1 : 0.5 },
							]}>
							բոլորը
						</Text>
					</TouchableOpacity>
					{categories.map((category) => (
						<TouchableOpacity
							key={category}
							style={[
								styles.categoryPill,
								selectedCategory === category && styles.categoryPillSelected,
							]}
							onPress={() => handleSelectCategory(category)}>
							<Text
								style={[
									styles.categoryText,
									selectedCategory === category && styles.categoryTextSelected,
								]}>
								{category.toLowerCase()}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

			<FlatList
				key={'two-columns'}
				data={filteredRecipes}
				renderItem={renderRecipeItem}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.gridContainer}
				numColumns={2}
				ListEmptyComponent={
					<Text style={styles.emptyText}>No recipes found.</Text>
				}
			/>
			<FlotingButton onPress={() => navigation.navigate('RecipeForm')} icon={<AddRecipeIcon />} text={'add recipe'} />
		</SafeAreaView>
	);
};

// --- Stylesheet updated for new dark mode design ---
const getStyles = (colors, scheme) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.background,
		},
		searchContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			marginHorizontal: 16,
			marginTop: 10,
			border: 'none',
			borderBottomWidth: 2,
			borderBottomColor: colors.white,
			backgroundColor: 'transparent',
		},
		searchIcon: {
			paddingLeft: 0,
			color: colors.white,
		},
		searchBar: {
			flex: 1,
			height: 44,
			backgroundColor: 'transparent',
			paddingHorizontal: 10,
			fontSize: 16,
			color: colors.white,
		},
		categoryContainer: {
			paddingVertical: 12,
			paddingHorizontal: 16,
			alignItems: 'center',
		},
		allButton: {
			marginRight: 15,
		},
		allButtonText: {
			color: '#FFFFFF',
			fontWeight: '500',
			marginBottom: 2,
			fontSize: 16,
		},
		categoryPill: {
			paddingVertical: 6,
			paddingHorizontal: 10,
			borderRadius: 10,
			marginRight: 10,
			backgroundColor: '#8C9295',
		},
		categoryPillSelected: {
			backgroundColor: colors.primary,
		},
		categoryText: {
			color: colors.text,
			fontWeight: '500',
			fontSize: 16,
		},
		categoryTextSelected: {
			color: '#FFFFFF',
		},
		gridContainer: {
			paddingHorizontal: 8,
			paddingBottom: 150,
		},
		card: {
			flex: 1,
			marginHorizontal: 4,
			marginVertical: 8,
			borderRadius: 12,
			backgroundColor: colors.card,
			overflow: 'hidden',
		},
		cardImage: {
			width: '100%',
			height: 100,
		},
		cardTextContainer: {
			padding: 12,
		},
		cardTitle: {
			fontSize: 18,
			fontWeight: 'bold',
			color: colors.text,
		},
		cardCategory: {
			fontSize: 14,
			color: colors.subtleText,
			marginTop: 4,
		},
		deleteButtonContainer: {
			position: 'absolute',
			bottom: 0,
			right: 0,
			width: 50,
			height: 50,
			backgroundColor: colors.error,
			borderTopLeftRadius: 40,
			justifyContent: 'center',
			alignItems: 'center',
		},
		deleteButton: {
			marginLeft: 8,
			marginTop: 8,
		},
		deleteIcon: {
			color: '#FFFFFF',
		},
		emptyText: {
			textAlign: 'center',
			marginTop: 50,
			fontSize: 16,
			color: colors.subtleText,
		},
	});

export default RecipeListScreen;
