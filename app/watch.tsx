import { ThemedText } from '@/components/ThemedText';
import useStore from '@/hooks/useStore';
import { Lang } from '@/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEventListener } from 'expo';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoSource, VideoView } from 'expo-video';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface State {
	currentMovie: number;
	currentSeason: number;
	currenteEpisode: number;
	currentLanguage: Lang;
	isLoading: boolean;
}

export default function Watch() {
	const loading = useStore((state) => state.loading);
	const error = useStore((state) => state.error);
	const authToken = useStore((state) => state.authToken);

	const getSelectedSerie = useStore((state) => state.getSelectedSerie);
	const selectedSerieID = useStore((state) => state.selectedSerieID);

	const currentMovie = useStore((state) => state.currentMovie);
	const currentSeason = useStore((state) => state.currentSeason);
	const currenteEpisode = useStore((state) => state.currenteEpisode);
	const currentLanguage = useStore((state) => state.currentLanguage);

	const getEntityObject = useStore((state) => state.getEntityObject);
	const onMovieChange = useStore((state) => state.onMovieChange);
	const onSeasonChange = useStore((state) => state.onSeasonChange);
	const onEpisodeChange = useStore((state) => state.onEpisodeChange);
	const onLanguageChange = useStore((state) => state.onLanguageChange);

	const watchList = useStore((state) => state.watchList);
	const fetchWatchList = useStore((state) => state.fetchWatchList);

	const BASE_API_URL = 'https://cinema-api.jodu555.de';

	const BASE_URL = 'https://cinema.jodu555.de';

	useEffect(() => {
		fetchWatchList();
	}, []);

	const buildVideoSource = useCallback((title: string, season: number, episode: number, movie: number, lang: Lang): VideoSource => {
		let baseURL = `${BASE_API_URL}/video?auth-token=${authToken}&series=${selectedSerieID}`;

		if (movie !== -1) {
			baseURL += `&movie=${movie}`;
		} else {
			baseURL += `&season=${season}&episode=${episode}`;
		}

		baseURL += `&language=${lang}`;

		console.log(baseURL);

		return {
			uri: baseURL,
			contentType: 'progressive',
			metadata: {
				title: `${title} - Season ${season}, Episode ${episode}`,
				artist: 'CineFinn',
				artwork: `${BASE_API_URL}/images/${selectedSerieID}/cover.jpg?auth-token=${authToken}`,
			},
		};
	}, []);

	const player = useVideoPlayer(
		buildVideoSource(getSelectedSerie()?.title || 'Unknown Series', currentSeason, currenteEpisode, currentMovie, currentLanguage),
		(player) => {
			player.timeUpdateEventInterval = 2;
			player.loop = false;
			player.showNowPlayingNotification = true;

			// player.play();
		}
	);

	useEffect(() => {
		player.replaceAsync(
			buildVideoSource(getSelectedSerie()?.title || 'Unknown Series', currentSeason, currenteEpisode, currentMovie, currentLanguage)
		);
	}, [currentMovie, currentSeason, currenteEpisode, currentLanguage, player, buildVideoSource, getSelectedSerie]);

	// const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

	useEventListener(player, 'playToEnd', () => {
		console.log('playToEnd');
		//TODO: skip to next episode
	});
	useEventListener(player, 'timeUpdate', ({ bufferedPosition, currentTime }) => {
		console.log('timeUpdate', bufferedPosition, currentTime);
	});
	useEventListener(player, 'statusChange', ({ status, error }) => {
		console.log('Player status changed: ', status);
		if (status === 'error') {
			console.error('Player error: ', error);
		}
	});
	useEventListener(player, 'sourceLoad', (data) => {
		console.log('Player status changed: ', data);
	});

	const dump = () => {
		const stateCopy = JSON.parse(
			JSON.stringify({
				loading,
				error,
				currentMovie,
				currentSeason,
				currenteEpisode,
				currentLanguage,
			})
		);
		delete stateCopy.currentSeries;

		return JSON.stringify(stateCopy);
	};

	const isEpisodeWatched = (season: number, episode: number) => {
		return watchList.find((item) => item.ID === selectedSerieID && item.season === season && item.episode === episode && item.watched === true);
	};

	const [showJumpToLatestWatchPosition, setShowJumpToLatestWatchPosition] = useState(true);

	const onJumpToLatestWatchPosition = async () => {
		const latestWatchPosition = watchList.find((item) => item.ID === selectedSerieID && item.watched === true);
		if (latestWatchPosition) {
			console.log(player.currentTime, player.duration, latestWatchPosition.time);
			if (player.status === 'readyToPlay') {
				player.currentTime = latestWatchPosition.time;
				// await player.seekBy(player.currentTime - latestWatchPosition.time);
				console.log('Seeked to:', latestWatchPosition.time);
				setShowJumpToLatestWatchPosition(false);
			}
		}
	};

	return (
		<ScrollView>
			<Text style={{ color: 'white', paddingTop: 30, paddingStart: 20, paddingEnd: 15 }}>{dump()}</Text>
			<ThemedText style={{ paddingStart: 5, paddingTop: 20 }} type="subtitle">
				{getSelectedSerie()?.title}
			</ThemedText>
			{loading ? (
				<ActivityIndicator size="large" />
			) : (
				<>
					{(getSelectedSerie()?.movies.length || 0) > 0 && (
						<View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 5, gap: 5 }}>
							<ThemedText style={{ color: 'white', paddingStart: 10 }}>Movies: </ThemedText>
							{getSelectedSerie()?.movies.map((movie, index) => (
								<Button
									key={index}
									title={(index + 1).toString()}
									disabled={currentMovie === index + 1}
									onPress={() => onMovieChange(index + 1)}></Button>
							))}
						</View>
					)}

					{/* <Button title="Watched" color={'#00ff40'}></Button>
                            <Button title="UnWatched" color={'#6c757d'}></Button>
                            <Button title="Selected" color={'#0dcaf0'}></Button> */}

					<View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 5, gap: 5 }}>
						<ThemedText style={{ color: 'white', paddingStart: 10 }}>Seasons: </ThemedText>
						{getSelectedSerie()?.seasons.map((season, index) => (
							<Button
								color={currentSeason === season[0].season ? '#0dcaf0' : '#6c757d'}
								key={index}
								title={season[0].season.toString()}
								onPress={() => onSeasonChange(season[0].season)}></Button>
						))}
					</View>
					{currenteEpisode !== -1 && (
						<View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 5, gap: 5 }}>
							<ThemedText style={{ color: 'white', paddingStart: 10 }}>Episodes: </ThemedText>
							{/* TODO: This is not correct since the index is not always the same as season number when season missing */}
							{getSelectedSerie()?.seasons[currentSeason - 1].map((episode, index) => (
								<Button
									color={
										currenteEpisode === episode.episode
											? '#0dcaf0'
											: isEpisodeWatched(currentSeason, episode.episode)
											? '#00ff40'
											: '#6c757d'
									}
									key={index}
									title={episode.episode.toString()}
									// disabled={currenteEpisode === episode.episode}
									onPress={() => onEpisodeChange(episode.episode)}></Button>
							))}
						</View>
					)}
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 5, gap: 5 }}>
						{/* <ThemedText style={{ color: 'white', paddingStart: 10 }}>Episodes: </ThemedText> */}
						{/* TODO: This is not correct since the index is not always the same as season number when season missing */}
						{getEntityObject()?.langs.map((lang, index) => (
							<Pressable key={index} onPress={() => onLanguageChange(lang)}>
								<Image
									style={{
										width: 60,
										height: 40,
										opacity: currentLanguage === lang ? 1 : 0.5,
									}}
									source={{
										uri: `${BASE_URL}/flag-langs/${lang.toLowerCase()}.svg`,
									}}
									contentFit="cover"
								/>
							</Pressable>
							// <Button key={index} title={lang.toString()} disabled={state.currentLanguage === lang}></Button>
						))}
					</View>
					{isEpisodeWatched(currentSeason, currenteEpisode) !== null && showJumpToLatestWatchPosition ? (
						<View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 15, gap: 5 }}>
							<Button title="Jump to latest watch position!" color={'#0dcaf0'} onPress={() => onJumpToLatestWatchPosition()} />
						</View>
					) : null}
					<View>
						<VideoView
							style={styles.video}
							player={player}
							// nativeControls={false}
							nativeControls={true}
							startsPictureInPictureAutomatically={true}
							allowsFullscreen
							allowsPictureInPicture
						/>
						<View
							style={{
								position: 'absolute',
								top: -30,
								left: 0,
								right: 0,
								bottom: 0,
								// justifyContent: 'center',
								alignItems: 'center',
								flexDirection: 'row',
								gap: 20,
								justifyContent: 'space-around',
							}}>
							<MaterialIcons name="skip-previous" size={50} color={'white'} />
							<MaterialIcons name="fast-rewind" size={50} color={'white'} />
							<MaterialIcons name="play-arrow" size={50} color={'white'} />
							<MaterialIcons name="fast-forward" size={50} color={'white'} />
							<MaterialIcons name="skip-next" size={50} color={'white'} />
						</View>
						<View
							style={{ position: 'absolute', bottom: 20, left: 12, right: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
							<ThemedText>00:00 - 23:40</ThemedText>
							<View style={{ flexDirection: 'row', gap: 15 }}>
								<MaterialIcons name="settings" size={25} color={'white'} />
								<MaterialIcons name="fullscreen" size={25} color={'white'} />
							</View>
						</View>
					</View>
					<View style={{ paddingBottom: 150 }}></View>
				</>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		padding: 10,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 50,
	},
	video: {
		width: 350,
		height: 275,
		paddingBottom: 50,
		position: 'relative',
	},
	controlsContainer: {
		padding: 10,
	},
});
