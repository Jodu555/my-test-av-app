import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

export default function Explore() {
	const onPressFunction = () => {
		console.log('Pressed');
	};

	return (
		<ScrollView style={{ padding: 50 }}>
			<ThemedText>Test: Explore</ThemedText>
			<Pressable onPress={onPressFunction}>
				<Image
					style={{
						width: 300,
						height: 300,
					}}
					source={{
						uri: `http://cinema.jodu555.de/flag-langs/gerdub.svg`,
					}}
					contentFit="cover"
				/>
			</Pressable>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	// container: {
	// 	flex: 1,
	// 	// backgroundColor: '#fff',
	// 	alignItems: 'center',
	// 	justifyContent: 'center',
	// },
	// image: {
	// 	flex: 1,
	// 	width: '100%',
	// 	backgroundColor: '#0553',
	// },
});
