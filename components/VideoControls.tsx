import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { VideoPlayer } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

interface VideoControlsProps {
	player: VideoPlayer;
	isVisible: boolean;
	onToggleVisibility: () => void;
	onFullscreen?: () => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({ player, isVisible, onToggleVisibility, onFullscreen }) => {
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);

	const fadeAnim = useRef(new Animated.Value(1)).current;
	const hideTimeout = useRef<number | null>(null);

	// Format time in MM:SS or HH:MM:SS format
	const formatTime = (timeInSeconds: number): string => {
		if (isNaN(timeInSeconds)) return '00:00';

		const hours = Math.floor(timeInSeconds / 3600);
		const minutes = Math.floor((timeInSeconds % 3600) / 60);
		const seconds = Math.floor(timeInSeconds % 60);

		if (hours > 0) {
			return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	};

	// Auto-hide controls after 3 seconds of inactivity
	const resetHideTimer = () => {
		if (hideTimeout.current) {
			clearTimeout(hideTimeout.current);
		}

		Animated.timing(fadeAnim, {
			toValue: 1,
			duration: 200,
			useNativeDriver: true,
		}).start();

		hideTimeout.current = setTimeout(() => {
			if (isPlaying) {
				Animated.timing(fadeAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}).start();
			}
		}, 3000);
	};

	// Update time and playing state
	useEffect(() => {
		const updateTime = () => {
			setCurrentTime(player.currentTime || 0);
			setDuration(player.duration || 0);
			setIsPlaying(player.playing);
		};

		const interval = setInterval(updateTime, 100);
		return () => clearInterval(interval);
	}, [player]);

	// Reset hide timer when controls become visible
	useEffect(() => {
		if (isVisible) {
			resetHideTimer();
		}
	}, [isVisible, isPlaying, resetHideTimer]);

	// Handle play/pause toggle
	const togglePlayPause = () => {
		if (isPlaying) {
			player.pause();
		} else {
			player.play();
		}
		resetHideTimer();
	};

	// Handle skip functions
	const skipBackward = () => {
		const newTime = Math.max(0, currentTime - 10);
		player.currentTime = newTime;
		resetHideTimer();
	};

	const skipForward = () => {
		const newTime = Math.min(duration, currentTime + 10);
		player.currentTime = newTime;
		resetHideTimer();
	};

	// Handle fullscreen
	const handleFullscreen = () => {
		if (onFullscreen) {
			onFullscreen();
		} else {
			// Fallback - you can integrate with expo-screen-orientation or other fullscreen solutions
			console.log('Fullscreen requested');
		}
		resetHideTimer();
	};

	// Progress calculation
	const progress = duration > 0 ? currentTime / duration : 0;

	// Simple progress bar with direct touch handling
	const handleProgressPress = (event: any) => {
		// Get the touch position relative to the progress bar
		const { locationX } = event.nativeEvent;
		// Estimate progress bar width (you can measure this more precisely if needed)
		const progressBarWidth = 320; // Approximate width based on your video container
		const newProgress = Math.max(0, Math.min(1, locationX / progressBarWidth));
		const newTime = newProgress * duration;

		console.log('Progress bar touched:', { locationX, progressBarWidth, newProgress, newTime, duration });

		if (duration > 0 && newTime >= 0 && newTime <= duration) {
			player.currentTime = newTime;
			console.log('Seeking to:', newTime);
		}
		resetHideTimer();
	};

	// Alternative: Create clickable zones for seeking
	const createSeekButtons = () => {
		const buttons = [];
		const zoneCount = 10;

		for (let i = 0; i < zoneCount; i++) {
			const seekPercentage = (i + 1) / zoneCount;
			buttons.push(
				<Pressable
					key={i}
					style={styles.seekZone}
					onPress={() => {
						const newTime = seekPercentage * duration;
						console.log('Seek zone pressed:', { zone: i + 1, seekPercentage, newTime });
						if (duration > 0) {
							player.currentTime = newTime;
						}
						resetHideTimer();
					}}>
					<Text style={styles.seekZoneText}>{Math.round(seekPercentage * 100)}%</Text>
				</Pressable>
			);
		}
		return buttons;
	};

	if (!isVisible) return null;

	return (
		<Animated.View style={[styles.controlsOverlay, { opacity: fadeAnim }]}>
			{/* Top gradient */}
			<View style={styles.topGradient} />

			{/* Main control buttons */}
			<View style={styles.mainControls}>
				<Pressable onPress={skipBackward} style={styles.controlButton}>
					<MaterialIcons name="replay-10" size={50} color="white" />
				</Pressable>

				<Pressable onPress={togglePlayPause} style={styles.playButton}>
					<MaterialIcons name={isPlaying ? 'pause' : 'play-arrow'} size={60} color="white" />
				</Pressable>

				<Pressable onPress={skipForward} style={styles.controlButton}>
					<MaterialIcons name="forward-10" size={50} color="white" />
				</Pressable>
			</View>

			{/* Bottom controls */}
			<View style={styles.bottomControls}>
				<View style={styles.bottomGradient} />

				{/* Progress bar - Simple and reliable */}
				<View style={styles.progressContainer}>
					<Pressable style={styles.progressTrack} onPress={handleProgressPress}>
						<View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
						<View style={[styles.progressThumb, { left: `${Math.max(0, progress * 100 - 2)}%` }]} />
					</Pressable>
				</View>

				{/* Alternative: Seek buttons for testing */}
				<View style={styles.seekButtonsContainer}>{createSeekButtons()}</View>

				{/* Time and settings */}
				<View style={styles.bottomRow}>
					<Text style={styles.timeText}>
						{formatTime(currentTime)} / {formatTime(duration)}
					</Text>

					<View style={styles.settingsButtons}>
						<Pressable style={styles.settingButton} onPress={resetHideTimer}>
							<MaterialIcons name="settings" size={24} color="white" />
						</Pressable>
						<Pressable style={styles.settingButton} onPress={handleFullscreen}>
							<MaterialIcons name="fullscreen" size={24} color="white" />
						</Pressable>
					</View>
				</View>
			</View>

			{/* Invisible overlay to detect taps */}
			<Pressable
				style={styles.tapOverlay}
				onPress={() => {
					onToggleVisibility();
					resetHideTimer();
				}}
			/>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	controlsOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'space-between',
	},
	topGradient: {
		height: 80,
		// background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
		backgroundColor: 'rgba(0,0,0,0.4)',
	},
	mainControls: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 40,
		flex: 1,
	},
	controlButton: {
		padding: 10,
		borderRadius: 50,
		backgroundColor: 'rgba(0,0,0,0.3)',
	},
	playButton: {
		padding: 15,
		borderRadius: 50,
		backgroundColor: 'rgba(0,0,0,0.5)',
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	bottomControls: {
		paddingHorizontal: 15,
		paddingBottom: 15,
		position: 'relative',
	},
	bottomGradient: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: 100,
		backgroundColor: 'rgba(0,0,0,0.6)',
	},
	progressContainer: {
		marginBottom: 15,
		height: 30,
		justifyContent: 'center',
		paddingHorizontal: 5,
	},
	progressTrack: {
		height: 6,
		backgroundColor: 'rgba(255,255,255,0.3)',
		borderRadius: 3,
		position: 'relative',
		width: '100%',
	},
	progressFill: {
		height: 6,
		backgroundColor: '#ff6b6b',
		borderRadius: 3,
		position: 'absolute',
		top: 0,
		left: 0,
	},
	progressThumb: {
		position: 'absolute',
		top: -5,
		width: 16,
		height: 16,
		backgroundColor: '#ff6b6b',
		borderRadius: 8,
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.22,
		shadowRadius: 2.22,
	},
	seekButtonsContainer: {
		flexDirection: 'row',
		marginBottom: 10,
		opacity: 0.7,
	},
	seekZone: {
		flex: 1,
		height: 20,
		backgroundColor: 'rgba(255,255,255,0.1)',
		marginHorizontal: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	seekZoneText: {
		color: 'white',
		fontSize: 8,
	},
	bottomRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	timeText: {
		color: 'white',
		fontSize: 14,
		fontWeight: '500',
	},
	settingsButtons: {
		flexDirection: 'row',
		gap: 15,
	},
	settingButton: {
		padding: 5,
	},
	tapOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: -1,
	},
});

export default VideoControls;

// Integration example for your Watch component:
/*
// Add this state to your Watch component:
const [controlsVisible, setControlsVisible] = useState(true);

// Replace your existing video section with:
<View style={styles.videoContainer}>
  <VideoView
    style={styles.video}
    player={player}
    nativeControls={false}
    startsPictureInPictureAutomatically={true}
    allowsFullscreen
    allowsPictureInPicture
  />
  <VideoControls 
    player={player}
    isVisible={controlsVisible}
    onToggleVisibility={() => setControlsVisible(!controlsVisible)}
    onFullscreen={() => {
      // Handle fullscreen logic here
      // You could use expo-screen-orientation or other libraries
      console.log('Going fullscreen');
    }}
  />
</View>

// Update your styles:
videoContainer: {
  position: 'relative',
  width: 350,
  height: 275,
},
video: {
  width: '100%',
  height: '100%',
},
*/

// export default VideoControls;

// Integration example for your Watch component:
/*
// Add this state to your Watch component:
const [controlsVisible, setControlsVisible] = useState(true);

// Replace your existing video section with:
<View style={styles.videoContainer}>
  <VideoView
    style={styles.video}
    player={player}
    nativeControls={false}
    startsPictureInPictureAutomatically={true}
    allowsFullscreen
    allowsPictureInPicture
  />
  <VideoControls 
    player={player}
    isVisible={controlsVisible}
    onToggleVisibility={() => setControlsVisible(!controlsVisible)}
    onFullscreen={() => {
      // Handle fullscreen logic here
      // You could use expo-screen-orientation or other libraries
      console.log('Going fullscreen');
    }}
  />
</View>

// Update your styles:
videoContainer: {
  position: 'relative',
  width: 350,
  height: 275,
},
video: {
  width: '100%',
  height: '100%',
},
*/

// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import { VideoPlayer } from 'expo-video';
// import React, { useEffect, useRef, useState } from 'react';
// import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

// interface VideoControlsProps {
// 	player: VideoPlayer;
// 	isVisible: boolean;
// 	onToggleVisibility: () => void;
// }

// const VideoControls: React.FC<VideoControlsProps> = ({ player, isVisible, onToggleVisibility }) => {
// 	const [currentTime, setCurrentTime] = useState(0);
// 	const [duration, setDuration] = useState(0);
// 	const [isPlaying, setIsPlaying] = useState(false);
// 	const [isDragging, setIsDragging] = useState(false);

// 	const fadeAnim = useRef(new Animated.Value(1)).current;
// 	const hideTimeout = useRef<number | null>(null);

// 	// Format time in MM:SS or HH:MM:SS format
// 	const formatTime = (timeInSeconds: number): string => {
// 		if (isNaN(timeInSeconds)) return '00:00';

// 		const hours = Math.floor(timeInSeconds / 3600);
// 		const minutes = Math.floor((timeInSeconds % 3600) / 60);
// 		const seconds = Math.floor(timeInSeconds % 60);

// 		if (hours > 0) {
// 			return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
// 		}
// 		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
// 	};

// 	// Auto-hide controls after 3 seconds of inactivity
// 	const resetHideTimer = () => {
// 		if (hideTimeout.current) {
// 			clearTimeout(hideTimeout.current);
// 		}

// 		Animated.timing(fadeAnim, {
// 			toValue: 1,
// 			duration: 200,
// 			useNativeDriver: true,
// 		}).start();

// 		hideTimeout.current = setTimeout(() => {
// 			if (isPlaying && !isDragging) {
// 				Animated.timing(fadeAnim, {
// 					toValue: 0,
// 					duration: 300,
// 					useNativeDriver: true,
// 				}).start();
// 			}
// 		}, 3000);
// 	};

// 	// Update time and playing state
// 	useEffect(() => {
// 		const updateTime = () => {
// 			if (!isDragging) {
// 				setCurrentTime(player.currentTime || 0);
// 			}
// 			setDuration(player.duration || 0);
// 			setIsPlaying(player.playing);
// 		};

// 		const interval = setInterval(updateTime, 100);
// 		return () => clearInterval(interval);
// 	}, [player, isDragging]);

// 	// Reset hide timer when controls become visible
// 	useEffect(() => {
// 		if (isVisible) {
// 			resetHideTimer();
// 		}
// 	}, [isVisible, isPlaying]);

// 	// Handle play/pause toggle
// 	const togglePlayPause = () => {
// 		if (isPlaying) {
// 			player.pause();
// 		} else {
// 			player.play();
// 		}
// 		resetHideTimer();
// 	};

// 	// Handle seeking
// 	const handleSeek = (position: number) => {
// 		const newTime = position * duration;
// 		player.currentTime = newTime;
// 		setCurrentTime(newTime);
// 		resetHideTimer();
// 	};

// 	// Handle skip functions
// 	const skipBackward = () => {
// 		const newTime = Math.max(0, currentTime - 10);
// 		player.currentTime = newTime;
// 		resetHideTimer();
// 	};

// 	const skipForward = () => {
// 		const newTime = Math.min(duration, currentTime + 10);
// 		player.currentTime = newTime;
// 		resetHideTimer();
// 	};

// 	// Progress bar component
// 	const ProgressBar = () => {
// 		const progress = duration > 0 ? currentTime / duration : 0;
// 		const [localProgress, setLocalProgress] = useState(progress);

// 		useEffect(() => {
// 			if (!isDragging) {
// 				setLocalProgress(progress);
// 			}
// 		}, [progress, isDragging]);

// 		return (
// 			<View style={styles.progressContainer}>
// 				<View style={styles.progressTrack}>
// 					<View style={[styles.progressFill, { width: `${localProgress * 100}%` }]} />
// 					<Pressable
// 						style={[styles.progressThumb, { left: `${localProgress * 100}%` }]}
// 						onPressIn={() => {
// 							setIsDragging(true);
// 							resetHideTimer();
// 						}}
// 						onPressOut={() => {
// 							setIsDragging(false);
// 							handleSeek(localProgress);
// 						}}
// 					/>
// 				</View>
// 				{/* Touch area for easier interaction */}
// 				<Pressable
// 					style={styles.progressTouchArea}
// 					onPress={(e) => {
// 						const { locationX } = e.nativeEvent;
// 						// const { width } = 300;
// 						// const { width } = e.currentTarget.measure
// 						// 	? { width: 300 } // fallback width
// 						// 	: e.currentTarget;
// 						const newProgress = locationX / 300; // Use approximate width
// 						setLocalProgress(Math.max(0, Math.min(1, newProgress)));
// 						handleSeek(newProgress);
// 					}}
// 				/>
// 			</View>
// 		);
// 	};

// 	if (!isVisible) return null;

// 	return (
// 		<Animated.View style={[styles.controlsOverlay, { opacity: fadeAnim }]}>
// 			{/* Top gradient */}
// 			<View style={styles.topGradient} />

// 			{/* Main control buttons */}
// 			<View style={styles.mainControls}>
// 				<Pressable onPress={skipBackward} style={styles.controlButton}>
// 					<MaterialIcons name="replay-10" size={50} color="white" />
// 				</Pressable>

// 				<Pressable onPress={togglePlayPause} style={styles.playButton}>
// 					<MaterialIcons name={isPlaying ? 'pause' : 'play-arrow'} size={60} color="white" />
// 				</Pressable>

// 				<Pressable onPress={skipForward} style={styles.controlButton}>
// 					<MaterialIcons name="forward-10" size={50} color="white" />
// 				</Pressable>
// 			</View>

// 			{/* Bottom controls */}
// 			<View style={styles.bottomControls}>
// 				<View style={styles.bottomGradient} />

// 				{/* Progress bar */}
// 				<ProgressBar />

// 				{/* Time and settings */}
// 				<View style={styles.bottomRow}>
// 					<Text style={styles.timeText}>
// 						{formatTime(currentTime)} / {formatTime(duration)}
// 					</Text>

// 					<View style={styles.settingsButtons}>
// 						<Pressable style={styles.settingButton} onPress={resetHideTimer}>
// 							<MaterialIcons name="settings" size={24} color="white" />
// 						</Pressable>
// 						<Pressable style={styles.settingButton} onPress={resetHideTimer}>
// 							<MaterialIcons name="fullscreen" size={24} color="white" />
// 						</Pressable>
// 					</View>
// 				</View>
// 			</View>

// 			{/* Invisible overlay to detect taps */}
// 			<Pressable
// 				style={styles.tapOverlay}
// 				onPress={() => {
// 					onToggleVisibility();
// 					resetHideTimer();
// 				}}
// 			/>
// 		</Animated.View>
// 	);
// };

// const styles = StyleSheet.create({
// 	controlsOverlay: {
// 		position: 'absolute',
// 		top: 0,
// 		left: 0,
// 		right: 0,
// 		bottom: 0,
// 		justifyContent: 'space-between',
// 	},
// 	topGradient: {
// 		height: 80,
// 		backgroundColor: 'rgba(0,0,0,0.4)',
// 	},
// 	mainControls: {
// 		flexDirection: 'row',
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 		gap: 40,
// 		flex: 1,
// 	},
// 	controlButton: {
// 		padding: 10,
// 		borderRadius: 50,
// 		backgroundColor: 'rgba(0,0,0,0.3)',
// 	},
// 	playButton: {
// 		padding: 15,
// 		borderRadius: 50,
// 		backgroundColor: 'rgba(0,0,0,0.5)',
// 		elevation: 5,
// 		shadowColor: '#000',
// 		shadowOffset: { width: 0, height: 2 },
// 		shadowOpacity: 0.25,
// 		shadowRadius: 3.84,
// 	},
// 	bottomControls: {
// 		paddingHorizontal: 15,
// 		paddingBottom: 15,
// 		position: 'relative',
// 	},
// 	bottomGradient: {
// 		position: 'absolute',
// 		bottom: 0,
// 		left: 0,
// 		right: 0,
// 		height: 100,
// 		backgroundColor: 'rgba(0,0,0,0.6)',
// 	},
// 	progressContainer: {
// 		marginBottom: 15,
// 		height: 20,
// 		justifyContent: 'center',
// 	},
// 	progressTrack: {
// 		height: 4,
// 		backgroundColor: 'rgba(255,255,255,0.3)',
// 		borderRadius: 2,
// 		position: 'relative',
// 	},
// 	progressFill: {
// 		height: 4,
// 		backgroundColor: '#ff6b6b',
// 		borderRadius: 2,
// 	},
// 	progressThumb: {
// 		position: 'absolute',
// 		top: -6,
// 		width: 16,
// 		height: 16,
// 		backgroundColor: '#ff6b6b',
// 		borderRadius: 8,
// 		marginLeft: -8,
// 		elevation: 3,
// 		shadowColor: '#000',
// 		shadowOffset: { width: 0, height: 1 },
// 		shadowOpacity: 0.22,
// 		shadowRadius: 2.22,
// 	},
// 	progressTouchArea: {
// 		position: 'absolute',
// 		top: -10,
// 		left: 0,
// 		right: 0,
// 		height: 20,
// 	},
// 	bottomRow: {
// 		flexDirection: 'row',
// 		justifyContent: 'space-between',
// 		alignItems: 'center',
// 	},
// 	timeText: {
// 		color: 'white',
// 		fontSize: 14,
// 		fontWeight: '500',
// 	},
// 	settingsButtons: {
// 		flexDirection: 'row',
// 		gap: 15,
// 	},
// 	settingButton: {
// 		padding: 5,
// 	},
// 	tapOverlay: {
// 		position: 'absolute',
// 		top: 0,
// 		left: 0,
// 		right: 0,
// 		bottom: 0,
// 		zIndex: -1,
// 	},
// });

// export default VideoControls;

// // Integration example for your Watch component:
// /*
// // Add this state to your Watch component:
// const [controlsVisible, setControlsVisible] = useState(true);

// // Replace your existing video section with:
// <View style={styles.videoContainer}>
//   <VideoView
//     style={styles.video}
//     player={player}
//     nativeControls={false}
//     startsPictureInPictureAutomatically={true}
//     allowsFullscreen
//     allowsPictureInPicture
//   />
//   <VideoControls
//     player={player}
//     isVisible={controlsVisible}
//     onToggleVisibility={() => setControlsVisible(!controlsVisible)}
//   />
// </View>

// // Update your styles:
// videoContainer: {
//   position: 'relative',
//   width: 350,
//   height: 275,
// },
// video: {
//   width: '100%',
//   height: '100%',
// },
// */
