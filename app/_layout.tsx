import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import useStore from '@/hooks/useStore';
import { useEffect } from 'react';
import { Button } from 'react-native';

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const router = useRouter();

	const authToken = useStore((state) => state.authToken);
	const auhenticate = useStore((state) => state.authenticate);

	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	});
	useEffect(() => {
		auhenticate();
	}, []);
	if (!loaded) {
		// Async font loading only occurs in development.
		return null;
	}

	const loggedIn = authToken !== '';

	return (
		<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
			{/* <Text style={{ color: 'white' }}>{authToken}</Text> */}
			<Stack>
				<Stack.Protected guard={loggedIn}>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="watch" options={{ headerTitle: 'Watch' }} />
					<Stack.Screen name="+not-found" />
				</Stack.Protected>
				<Stack.Protected guard={!loggedIn}>
					<Stack.Screen
						name="login"
						options={{
							headerTitle: 'Login',
							headerShown: true,
							headerRight: () => <Button title="Register" onPress={() => router.push('/watch')} />,
						}}
					/>
					{/* <Stack.Screen name="register" options={{ headerTitle: 'Register', headerShown: true }} /> */}
				</Stack.Protected>
			</Stack>
			<StatusBar style="auto" />
		</ThemeProvider>
	);
}
