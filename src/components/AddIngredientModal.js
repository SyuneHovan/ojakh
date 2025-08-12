import { useEffect, useState } from 'react';
import {
  Button,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import apiClient from '../api/client';
import { useTheme } from '../context/ThemeContext';

const AddIngredientModal = ({ visible, onClose, onAddIngredient }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [masterIngredients, setMasterIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState([]);

  // Fetch the master list of ingredients when the modal becomes visible
  useEffect(() => {
    if (visible) {
      const fetchIngredients = async () => {
        try {
          const response = await apiClient.get('/ingredients');
          setMasterIngredients(response.data);
          setFilteredIngredients(response.data);
        } catch (error) {
          console.error("Failed to fetch ingredients for modal", error);
        }
      };
      fetchIngredients();
    }
  }, [visible]);

  // Filter the list as the user types
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredIngredients(masterIngredients);
    } else {
      const filtered = masterIngredients.filter(ingredient =>
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredIngredients(filtered);
    }
  }, [searchTerm, masterIngredients]);

  const handleSelectIngredient = (ingredientName) => {
    onAddIngredient(ingredientName); // Send the selected ingredient back to the form
    setSearchTerm(''); // Reset for next time
    onClose(); // Close the modal
  };

  const handleAddNewIngredient = () => {
    if (searchTerm.trim().length > 0) {
      onAddIngredient(searchTerm.trim()); // Send the new custom ingredient back
      setSearchTerm('');
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Ingredient</Text>
            <Button title="Cancel" onPress={onClose} color={colors.accent} />
        </View>
        
        <TextInput
          style={styles.searchBar}
          placeholder="Search for an ingredient..."
          placeholderTextColor={colors.subtleText}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <FlatList
          data={filteredIngredients}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listItem} onPress={() => handleSelectIngredient(item)}>
              <Text style={styles.listItemText}>{item}</Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            // Show this button only if the search term doesn't exactly match any item
            searchTerm.length > 0 && !filteredIngredients.some(ing => ing.toLowerCase() === searchTerm.toLowerCase()) ? (
              <TouchableOpacity style={[styles.listItem, styles.addNewButton]} onPress={handleAddNewIngredient}>
                <Text style={styles.addNewButtonText}>+ Add "{searchTerm}" as a new ingredient</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

const getStyles = (colors) => StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    searchBar: {
        height: 40,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 10,
        margin: 16,
        backgroundColor: colors.card,
        fontSize: 16,
        color: colors.text,
    },
    listItem: {
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    listItemText: {
        fontSize: 18,
        color: colors.text,
    },
    addNewButton: {
        backgroundColor: colors.primary,
    },
    addNewButtonText: {
        fontSize: 16,
        color: colors.card,
        fontWeight: 'bold',
    },
});

export default AddIngredientModal;
