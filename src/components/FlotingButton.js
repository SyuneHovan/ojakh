import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const FlotingButton = ({ onPress, icon, text }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            {icon}
            <Text style={styles.label}>{text}</Text>
        </TouchableOpacity>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 110, // Position it above the tab bar
        right: 10,
        width: 100,
        height: 100,
        borderRadius: 80,
        backgroundColor: colors.primary, // Using your theme's primary color
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 10,
        zIndex: 9
    },
    label: {
        color: '#fff',
        fontSize: 12,
        marginTop: 2,
    }
});

export default FlotingButton;
