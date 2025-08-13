/** @format */

import {
	Dimensions,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import PantryIcon from './icons/PantryIcon';
import RecipeIcon from './icons/RecipeIcon';
import TabBarWaveSvg from './TabBarWaveSvg';

const { width } = Dimensions.get('window');

const WavyTabBar = ({ state, descriptors, navigation }) => {
	const { colors } = useTheme();
	const styles = getStyles(colors);

	return (
		<View style={styles.container}  pointerEvents="box-none">
			<View style={{ width: width+1, height: 175 }} pointerEvents="none">
        <TabBarWaveSvg width={width+1} height={175} color={colors.accent}/>
			</View>

			<View style={styles.tabContainer}>
				{state.routes.map((route, index) => {
					const { options } = descriptors[route.key];
					const isFocused = state.index === index;

					const onPress = () => {
						const event = navigation.emit({
							type: 'tabPress',
							target: route.key,
							canPreventDefault: true,
						});

						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name);
						}
					};

					let iconName;
					if (route.name === 'Recipes') {
						iconName = isFocused ? 'notebook' : 'notebook-outline';
					} else if (route.name === 'My Pantry') {
						iconName = isFocused ? 'fridge' : 'fridge-outline';
					}

					return (
						<TouchableOpacity
							key={route.key}
							onPress={onPress}
							style={styles.tabButton}>
							{route.name === 'Recipes' ? (
								<RecipeIcon
									color={isFocused ? colors.white : colors.pasiveText}
								/>
							) : (
								<PantryIcon
									color={isFocused ? colors.white : colors.pasiveText}
								/>
							)}
							<Text
								style={[
									styles.tabLabel,
									{ color: isFocused ? colors.white : colors.pasiveText },
								]}>
								{route.name}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
};

const getStyles = (colors) =>
	StyleSheet.create({
		container: {
			position: 'absolute',
			bottom: -25,
			width: '100%',
			zIndex: 8
		},
		tabContainer: {
			flexDirection: 'row',
			position: 'absolute',
			bottom: 40,
			width: '100%',
			height: 80, // Standard tab bar height
			justifyContent: 'space-around',
			alignItems: 'center',
		},
		tabButton: {
			alignItems: 'center',
		},
		tabLabel: {
			marginTop: 4,
			fontSize: 12,
		},
	});

export default WavyTabBar;
