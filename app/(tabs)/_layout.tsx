import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Button, Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import useStore from '@/hooks/useStore';

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const router = useRouter();

	const logout = useStore((state) => state.logout);

	const onLogout = async () => {
		await logout();
		router.push('/');
	};

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				headerShown: true,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				headerRight: () => (
					<View style={{ paddingEnd: 15 }}>
						<Button color={'#dc3545'} title="Logout" onPress={onLogout} />
					</View>
				),
				tabBarStyle: Platform.select({
					ios: {
						// Use a transparent background on iOS to show the blur effect
						position: 'absolute',
					},
					default: {},
				}),
			}}>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="list"
				options={{
					title: 'List',
					tabBarIcon: ({ color }) => <IconSymbol size={25} name="list.bullet" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					title: 'Explore',
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="account"
				options={{
					title: 'Account',
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="brain.head.profile" color={color} />,
				}}
			/>
		</Tabs>
	);
}
