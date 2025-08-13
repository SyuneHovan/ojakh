/** @format */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // 1. Import the image picker
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import apiClient from '../api/client';
import AddIngredientModal from '../components/AddIngredientModal';
import { useTheme } from '../context/ThemeContext';

const RecipeFormScreen = ({ route, navigation }) => {
	const { colors } = useTheme();
	const styles = getStyles(colors);

	const recipeId = route.params?.recipeId;
	const isEditing = !!recipeId;

	// --- FORM STATE ---
	const [title, setTitle] = useState('');
	const [category, setCategory] = useState('');
	const [ingredients, setIngredients] = useState([]);
	const [steps, setSteps] = useState([{ header: '', description: '' }]);
	const [loading, setLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);

	// --- NEW: State for image handling ---
	const [imageUri, setImageUri] = useState(null); // Holds the local preview URI OR the final URL
	const [isUploading, setIsUploading] = useState(false);

	useEffect(() => {
		if (isEditing) {
			const fetchRecipe = async () => {
				setLoading(true);
				try {
					const response = await apiClient.get(`/recipes/${recipeId}`);
					const recipe = response.data;
					setTitle(recipe.title);
					setCategory(recipe.category || '');
					setImageUri(recipe.cover_image_url || null); // Set the existing image URL
					setIngredients(recipe.ingredients || []);
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

	// --- NEW: Function to open the image gallery ---
	const handlePickImage = async () => {
		// Ask for permission to access the media library
		const permissionResult =
			await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (permissionResult.granted === false) {
			Alert.alert(
				'Permission Required',
				'You need to allow access to your photos to add an image.'
			);
			return;
		}

		const pickerResult = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.5, // Compress image to reduce upload size
			base64: true, // We need the base64 data for uploading
		});

		if (!pickerResult.canceled) {
			// The user selected an image. We save its local URI for preview.
			setImageUri(pickerResult.assets[0].uri);
			// We also need the base64 string to send to the API
			// We'll prepend the necessary data URI scheme for our API to handle
			const base64 = `data:image/jpeg;base64,${pickerResult.assets[0].base64}`;
			// We'll store this temporarily in a state that doesn't trigger re-renders
			// to avoid passing large strings around too much.
			setNewImageBase64(base64);
		}
	};
	const [newImageBase64, setNewImageBase64] = useState(null);

	// --- UPDATED: The main save function ---
	const handleSaveRecipe = async () => {
		if (!title) {
			Alert.alert('Error', 'Please enter a title for the recipe.');
			return;
		}

		let finalImageUrl = imageUri; // Start with the existing image URI

		// 1. Check if a NEW image was selected
		if (newImageBase64) {
			setIsUploading(true);
			try {
				const filename = `${Date.now()}.jpg`;
				const uploadResponse = await apiClient.post('/upload', {filename: filename,body: newImageBase64,});
				finalImageUrl = uploadResponse.data.url;
			} catch (error) {
				console.error('Image upload failed:', error);
				Alert.alert('Error', 'Failed to upload the image.');
				setIsUploading(false);
				return; // Stop if upload fails
			} finally {
				setIsUploading(false);
			}
    }

		// 2. Create the final recipe data object with the correct image URL
		const recipeData = {
			title,
			category,
			cover_image_url: finalImageUrl,
			ingredients,
			steps,
    };

		// 3. Save the recipe data to our database
		try {
			if (isEditing) {
				await apiClient.put(`/recipes/${recipeId}`, recipeData);
			} else {
				await apiClient.post('/recipes', recipeData);
			}
      navigation.navigate('RecipeView', { recipeId: recipeId })
		} catch (error) {
			console.error('Failed to save recipe:', error);
			Alert.alert('Error', 'Failed to save the recipe.');
		}
	};

	const handleIngredientChange = (index, field, value) => {
		const newIngredients = [...ingredients];
		newIngredients[index][field] = value;
		setIngredients(newIngredients);
	};

	const removeIngredient = (index) => {
		const newIngredients = ingredients.filter((_, i) => i !== index);
		setIngredients(newIngredients);
	};

	const handleAddIngredient = (ingredientName) => {
		setIngredients([...ingredients, { name: ingredientName, amount: '' }]);
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
		<>
			<KeyboardAvoidingView
				style={{ flex: 1, backgroundColor: colors.background }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
				<ScrollView
					style={styles.container}
					keyboardShouldPersistTaps='handled'
					contentContainerStyle={{ paddingBottom: 150 }}>
					{/* --- NEW: Image Picker UI --- */}
					<TouchableOpacity
						style={styles.imagePicker}
						onPress={handlePickImage}>
						{imageUri ? (
							<Image
								source={{ uri: imageUri }}
								style={styles.imagePreview}
							/>
						) : (
							<View style={styles.imagePlaceholder}>
								<MaterialCommunityIcons
									name='camera-plus-outline'
									size={40}
									color={colors.subtleText}
								/>
								<Text style={styles.imagePlaceholderText}>Add Cover Photo</Text>
							</View>
						)}
					</TouchableOpacity>

					<Text style={styles.label}>Title</Text>
					<TextInput
						style={styles.input}
						value={title}
						onChangeText={setTitle}
					/>

					{/* ... (rest of the form is the same) ... */}
					<Text style={styles.label}>Category</Text>
					<TextInput
						style={styles.input}
						value={category}
						onChangeText={setCategory}
					/>
					<Text style={styles.sectionTitle}>Ingredients</Text>
					{ingredients.map((ing, index) => (
						<View
							key={index}
							style={styles.dynamicRow}>
							{/* We no longer need the autocomplete here, just a simple text display */}
							<Text style={styles.ingredientName}>{ing.name}</Text>
							<TextInput
								style={styles.inputAmount}
								placeholder='Amount'
								value={ing.amount}
								onChangeText={(text) =>
									handleIngredientChange(index, 'amount', text)
								}
								placeholderTextColor={colors.subtleText}
							/>
							<TouchableOpacity onPress={() => removeIngredient(index)}>
								<Text style={styles.removeText}>Remove</Text>
							</TouchableOpacity>
						</View>
					))}
					{/* This button now opens the modal */}
					<Button
						title='Add Ingredient'
						onPress={() => setIsModalVisible(true)}
						color={colors.primary}
					/>

					<Text style={styles.sectionTitle}>Steps</Text>
					{steps.map((step, index) => (
						<View
							key={index}
							style={styles.dynamicSection}>
							<TextInput
								style={styles.input}
								placeholder={`Step ${index + 1} Title`}
								value={step.header}
								onChangeText={(text) => handleStepChange(index, 'header', text)}
								placeholderTextColor={colors.subtleText}
							/>
							<TextInput
								style={styles.inputMulti}
								multiline
								placeholder='Describe the step...'
								value={step.description}
								onChangeText={(text) =>
									handleStepChange(index, 'description', text)
								}
								placeholderTextColor={colors.subtleText}
							/>
							<TouchableOpacity onPress={() => removeStep(index)}>
								<Text style={styles.removeText}>Remove Step</Text>
							</TouchableOpacity>
						</View>
					))}
					<Button
						title='Add Step'
						onPress={addStep}
						color={colors.primary}
					/>

					<View style={styles.saveButton}>
						<Button
							title={
								isUploading
									? 'Uploading Image...'
									: isEditing
									? 'Update Recipe'
									: 'Save Recipe'
							}
							onPress={handleSaveRecipe}
							color={colors.accent}
							disabled={isUploading}
						/>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>

			<AddIngredientModal
				visible={isModalVisible}
				onClose={() => setIsModalVisible(false)}
				onAddIngredient={handleAddIngredient}
			/>
		</>
	);
};

const getStyles = (colors) =>
	StyleSheet.create({
		container: { flex: 1, padding: 16 },
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

		// --- NEW: Styles for the image picker ---
		imagePicker: {
			width: '100%',
			height: 200,
			backgroundColor: colors.card,
			borderRadius: 8,
			borderWidth: 1,
			borderColor: colors.border,
			justifyContent: 'center',
			alignItems: 'center',
			marginBottom: 20,
			overflow: 'hidden',
		},
		imagePreview: {
			width: '100%',
			height: '100%',
		},
		imagePlaceholder: {
			alignItems: 'center',
		},
		imagePlaceholderText: {
			marginTop: 8,
			color: colors.subtleText,
			fontSize: 16,
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
		dynamicSection: {
			marginBottom: 15,
			padding: 10,
			borderWidth: 1,
			borderColor: colors.border,
			borderRadius: 5,
		},
		removeText: { color: colors.accent },
		saveButton: { marginTop: 30, marginBottom: 50 },
	});

export default RecipeFormScreen;
