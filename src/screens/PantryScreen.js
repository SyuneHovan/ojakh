/** @format */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import apiClient from '../api/client';
import FlotingButton from '../components/FlotingButton';
import FindRecipeIcon from '../components/icons/FindRecipeIcon';
import { useTheme } from '../context/ThemeContext';

const PantryScreen = ({ navigation }) => {
	const { colors } = useTheme();
	const styles = getStyles(colors);

	const [masterIngredients, setMasterIngredients] = useState([]);
	const [myPantry, setMyPantry] = useState([]);
	const [loading, setLoading] = useState(true);

	// State for search and filtered list
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredIngredients, setFilteredIngredients] = useState([]);

	useEffect(() => {
		const fetchIngredients = async () => {
			try {
				const response = await apiClient.get('/ingredients');
				setMasterIngredients(response.data);
				setFilteredIngredients(response.data); // Initially, the filtered list is the full list
			} catch (error) {
				console.error('Failed to fetch ingredients', error);
			} finally {
				setLoading(false);
			}
		};
		fetchIngredients();
	}, []);

	// useEffect to handle filtering when search term changes
	useEffect(() => {
		if (searchTerm === '') {
			setFilteredIngredients(masterIngredients);
		} else {
			const filtered = masterIngredients.filter((ingredient) =>
				ingredient.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredIngredients(filtered);
		}
	}, [searchTerm, masterIngredients]);

	const togglePantryIngredient = (ingredientName) => {
		setMyPantry((currentPantry) => {
			if (currentPantry.includes(ingredientName)) {
				return currentPantry.filter((item) => item !== ingredientName);
			} else {
				return [...currentPantry, ingredientName];
			}
		});
	};

	const findRecipes = async () => {
		if (myPantry.length === 0) return;
		try {
			navigation.navigate('Recipes', {
				screen: 'Krakaran Recipes',
				params: { searchResults: myPantry },
			});
		} catch (error) {
			console.error('Failed to find recipes', error);
		}
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
		<View
			style={styles.container}
			contentContainerStyle={{ paddingBottom: 150 }}>
			<Text style={styles.title}>What's in your Pantry?</Text>
			<Text style={styles.subtitle}>
				Select ingredients to get recipe suggestions.
			</Text>

			<TextInput
				style={styles.searchBar}
				placeholder='Search for an ingredient...'
				placeholderTextColor={colors.subtleText}
				value={searchTerm}
				onChangeText={setSearchTerm}
			/>

			<FlatList
				data={filteredIngredients}
				keyExtractor={(item) => item}
				renderItem={({ item }) => {
					const isSelected = myPantry.includes(item);
					return (
						<TouchableOpacity
							style={styles.ingredientItem}
							onPress={() => togglePantryIngredient(item)}>
							<MaterialCommunityIcons
								name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
								size={24}
								color={isSelected ? colors.primary : colors.subtleText}
							/>
							<Text
								style={[
									styles.ingredientText,
									isSelected && styles.ingredientTextSelected,
								]}>
								{item}
							</Text>
						</TouchableOpacity>
					);
				}}
				ListEmptyComponent={
					<Text style={styles.emptyText}>
						No ingredients match your search.
					</Text>
				}
				keyboardShouldPersistTaps='handled' // Ensures taps work even when keyboard is open
			/>
			<FlotingButton
				onPress={findRecipes}
				icon={<FindRecipeIcon />}
				text={`recipes (${myPantry.length})`}
			/>
		</View>
	);
};

const getStyles = (colors) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.background,
			padding: 16,
		},
		title: {
			fontSize: 24,
			fontWeight: 'bold',
			color: colors.text,
			marginBottom: 8,
			textAlign: 'center',
		},
		subtitle: {
			fontSize: 16,
			color: colors.subtleText,
			marginBottom: 16,
			textAlign: 'center',
		},
		searchBar: {
			height: 40,
			borderWidth: 1,
			borderColor: colors.border,
			borderRadius: 8,
			paddingHorizontal: 10,
			marginBottom: 16,
			backgroundColor: colors.card,
			fontSize: 16,
			color: colors.text,
		},
		ingredientItem: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
		},
		ingredientText: {
			fontSize: 18,
			color: colors.text,
			marginLeft: 15,
		},
		ingredientTextSelected: {
			fontWeight: 'bold',
			color: colors.primary,
		},
		emptyText: {
			textAlign: 'center',
			marginTop: 20,
			fontSize: 16,
			color: colors.subtleText,
		},
	});

export default PantryScreen;
