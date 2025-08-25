import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import useStore from '@/hooks/useStore';
import { Serie } from '@/types';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const HomeScreen = () => {
	const series = useStore((state) => state.series);
	const loading = useStore((state) => state.loading);
	const error = useStore((state) => state.error);

	const authToken = useStore((state) => state.authToken);

	const setSelectedSerieID = useStore((state) => state.setSelectedSerieID);
	const fetchSeriesList = useStore((state) => state.fetchSeriesList);
	const fetchSeriesInfo = useStore((state) => state.fetchSeriesInfo);

	const [filteredData, setFilteredData] = useState<Serie[]>([]);

	const [search, onChangeSearch] = useState('Irregular');

	const router = useRouter();

	const selectSerie = async (ID: string) => {
		const selectedSerie = series.find((item) => item.ID === ID);
		if (selectedSerie) {
			setSelectedSerieID(selectedSerie.ID);
			console.log('Selected Serie:', selectedSerie);
			try {
				await fetchSeriesInfo(selectedSerie.ID);
				router.push('/watch');
			} catch (error) {
				console.log(error);
			} finally {
			}
		}
	};

	useEffect(() => {
		fetchSeriesList();
	}, []);

	useEffect(() => {
		setFilteredData(series.filter((item) => item.title.toLowerCase().includes(search.toLowerCase())));
		// globalState.ID = search;
	}, [search, series]);

	return (
		<View style={{ flex: 1, paddingTop: 50, paddingBottom: 15, paddingStart: 10 }}>
			<ThemedText>
				Test: {loading.toString()} - {series?.length?.toString()} - Err: {error}
			</ThemedText>
			<View style={styles.inputContainer}>
				<IconSymbol name="magnifyingglass.circle" size={25} color={'black'} style={styles.icon} />
				<TextInput style={styles.input} placeholder="Username" onChangeText={onChangeSearch} value={search} />
			</View>
			{/* <TextInput placeholder="Series..." placeholderTextColor="white" style={styles.input} onChangeText={onChangeSearch} value={search} /> */}
			{loading ? (
				<ActivityIndicator size="large" />
			) : (
				<FlatList
					data={filteredData}
					keyExtractor={({ ID }) => ID}
					renderItem={({ item }) => (
						<View style={{ flexDirection: 'row', padding: 10, gap: 5 }}>
							<Image
								style={styles.tinyLogo}
								source={{
									uri: `https://cinema-api.jodu555.de/images/${item.ID}/cover.jpg?auth-token=${authToken}`,
								}}
							/>
							<View style={{ flex: 1, flexDirection: 'column', gap: 5 }}>
								<ThemedText type="subtitle">{item.title}</ThemedText>
								<ThemedText type="defaultSemiBold">
									{item.infos.startDate} - {item.infos.endDate}
								</ThemedText>
								<MoreLessComponent
									truncatedText={item.infos.description.toString().substring(0, 100)}
									fullText={item.infos.description}
								/>
								<Button title="Watch" onPress={() => selectSerie(item.ID)} />
							</View>
						</View>
					)}
				/>
			)}
		</View>
	);
};

const MoreLessComponent = ({ truncatedText, fullText }: { truncatedText: string; fullText: string }) => {
	const [more, setMore] = React.useState(false);
	return (
		<TouchableOpacity onPress={() => setMore(!more)}>
			<ThemedText>{!more ? `${truncatedText}...` : fullText}</ThemedText>
			<ThemedText type="link">{more ? 'less' : 'more'}</ThemedText>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		height: 50,
		backgroundColor: '#f1f1f1',
		color: 'black',
		borderRadius: 10,
		paddingHorizontal: 10,
		marginBottom: 20,
	},
	icon: {
		marginRight: 10,
	},
	input: {
		flex: 1,
		height: '100%',
		color: 'black',
	},
	tinyLogo: {
		width: 80,
		height: 150,
	},
	// input: {
	// 	height: 40,
	// 	margin: 12,
	// 	borderWidth: 2,
	// 	padding: 10,
	// 	color: 'white',
	// 	borderColor: 'white',
	// },
});

export default HomeScreen;
