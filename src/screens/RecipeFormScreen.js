/** @format */

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import apiClient from '../api/client';
import { useTheme } from '../context/ThemeContext'; // Import theme hook

const RecipeFormScreen = ({ route, navigation }) => {
	const { colors } = useTheme(); // Get theme colors
	const styles = getStyles(colors); // Generate styles

	const recipeId = route.params?.recipeId;
	const isEditing = !!recipeId;
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
					setIngredients(
						recipe.ingredients.length > 0
							? recipe.ingredients
							: [{ name: '', amount: '' }]
					);
					setSteps(
						recipe.steps.length > 0
							? recipe.steps
							: [{ header: '', description: '' }]
					);
				} catch (error) {
					console.error('Failed to fetch recipe for editing', error);
				} finally {
					setLoading(false);
				}
			};
			fetchRecipe();
		}
	}, [recipeId, isEditing]);

	const addIngredient = () => {
		setIngredients([...ingredients, { name: '', amount: '' }]);
	};

	const handleIngredientChange = (index, field, value) => {
		const newIngredients = [...ingredients];
		newIngredients[index][field] = value;
		setIngredients(newIngredients);
	};
	const removeIngredient = (index) => {
		setIngredients(ingredients.filter((_, i) => i !== index));
	};
	const handleStepChange = (index, field, value) => {
		const newSteps = [...steps];
		newSteps[index][field] = value;
		setSteps(newSteps);
	};
	const addStep = () => {
		setSteps([...steps, { header: '', description: '' }]);
	};
	const removeStep = (index) => {
		setSteps(steps.filter((_, i) => i !== index));
	};

	const handleSaveRecipe = async () => {
		if (!title) {
			Alert.alert('Error', 'Խնդրում ենք լրացնել վերնագիրը');
			return;
		}
		const recipeData = {
			title,
			category,
			cover_image_url: coverImageUrl,
			ingredients,
			steps,
		};
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
		return (
			<ActivityIndicator
				size='large'
				style={{ flex: 1 }}
			/>
		);
	}

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
		<KeyboardAvoidingView
			style={{ flex: 1, backgroundColor: colors.background }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
			<ScrollView style={styles.container}>
				<Text style={styles.label}>Վերնագիր</Text>
				<TextInput
					style={styles.input}
					value={title}
					onChangeText={setTitle}
					placeholder='e.g., Classic Pancakes'
					placeholderTextColor={colors.subtleText}
				/>

				<Text style={styles.label}>Բաժին</Text>
				<TextInput
					style={styles.input}
					value={category}
					onChangeText={setCategory}
					placeholder='e.g., Breakfast'
					placeholderTextColor={colors.subtleText}
				/>

				<Text style={styles.label}>Նկարի յղում</Text>
				<TextInput
					style={styles.input}
					value={coverImageUrl}
					onChangeText={setCoverImageUrl}
					placeholder='https://example.com/image.jpg'
					placeholderTextColor={colors.subtleText}
				/>

				<Text style={styles.sectionTitle}>Բաղադրիչներ</Text>
				{ingredients.map((ing, index) => (
					<View
						key={index}
						style={styles.dynamicRow}>
						<TextInput
							style={styles.inputRow}
							placeholder='Name'
							value={ing.name}
							onChangeText={(text) =>
								handleIngredientChange(index, 'name', text)
							}
							placeholderTextColor={colors.subtleText}
						/>
						<TextInput
							style={styles.inputRow}
							placeholder='Amount'
							value={ing.amount}
							onChangeText={(text) =>
								handleIngredientChange(index, 'amount', text)
							}
							placeholderTextColor={colors.subtleText}
						/>
						<TouchableOpacity onPress={() => removeIngredient(index)}>
							<Text style={styles.removeText}>ջնջել</Text>
						</TouchableOpacity>
					</View>
				))}
				<Button
					title='Աւելացնել բաղադրիչ'
					onPress={addIngredient}
					color={colors.primary}
				/>

				<Text style={styles.sectionTitle}>Քայլեր</Text>
				{steps.map((step, index) => (
					<View
						key={index}
						style={styles.dynamicSection}>
						<TextInput
							style={styles.input}
							placeholder={`Քայլ ${index + 1}-ի վերնագիր`}
							value={step.header}
							onChangeText={(text) => handleStepChange(index, 'header', text)}
							placeholderTextColor={colors.subtleText}
						/>
						<TextInput
							style={styles.inputMulti}
							multiline
							placeholder='քայլի նկարագրութիւն...'
							value={step.description}
							onChangeText={(text) =>
								handleStepChange(index, 'description', text)
							}
							placeholderTextColor={colors.subtleText}
						/>
						<TouchableOpacity onPress={() => removeStep(index)}>
							<Text style={styles.removeText}>ջնջել</Text>
						</TouchableOpacity>
					</View>
				))}
				<Button
					title='Աւելացնել քայլ'
					onPress={addStep}
					color={colors.primary}
				/>

				<View style={styles.saveButton}>
					<Button
						title={'Պահպանել'}
						onPress={handleSaveRecipe}
						color={colors.accent}
					/>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const getStyles = (colors) =>
	StyleSheet.create({
		container: {
			flex: 1,
			padding: 16,
			backgroundColor: colors.background,
		},
		label: {
			fontSize: 16,
			fontWeight: 'bold',
			marginTop: 10,
			marginBottom: 5,
			color: colors.text,
		},
		input: {
			height: 40,
			borderColor: colors.border,
			borderWidth: 1,
			borderRadius: 5,
			paddingHorizontal: 10,
			marginBottom: 10,
			color: colors.text,
			backgroundColor: colors.card,
		},
		inputMulti: {
			height: 80,
			borderColor: colors.border,
			borderWidth: 1,
			borderRadius: 5,
			paddingHorizontal: 10,
			marginBottom: 10,
			textAlignVertical: 'top',
			color: colors.text,
			backgroundColor: colors.card,
		},
		sectionTitle: {
			fontSize: 20,
			fontWeight: 'bold',
			marginTop: 20,
			marginBottom: 10,
			borderTopWidth: 1,
			borderTopColor: colors.border,
			paddingTop: 20,
			color: colors.text,
		},
		dynamicRow: {
			flexDirection: 'row',
			alignItems: 'center',
			marginBottom: 10,
		},
		inputRow: {
			flex: 1,
			height: 40,
			borderColor: colors.border,
			borderWidth: 1,
			borderRadius: 5,
			paddingHorizontal: 10,
			marginRight: 10,
			color: colors.text,
			backgroundColor: colors.card,
		},
		dynamicSection: {
			marginBottom: 15,
			padding: 10,
			borderWidth: 1,
			borderColor: colors.border,
			borderRadius: 5,
		},
		removeText: {
			color: colors.accent,
		},
		saveButton: {
			marginTop: 30,
			marginBottom: 50,
		},
	});

export default RecipeFormScreen;
