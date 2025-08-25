import { ThemedText } from '@/components/ThemedText';
import useStore from '@/hooks/useStore';
import { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

export default function Explore() {
	const loading = useStore((state) => state.loading);
	const authInfo = useStore((state) => state.authInfo);

	const authenticate = useStore((state) => state.authenticate);

	const [switchStates, setSwitchStates] = useState<Record<string, boolean>>({});

	const onRefresh = async () => {
		await authenticate();
	};

	const prettifyRole = (role: number) => {
		switch (role) {
			case 1:
				return 'User';
			case 2:
				return 'Moderator';
			case 3:
				return 'Admin';
			default:
				return 'Unknown - ' + role.toString();
		}
	};

	const activityDetails = useMemo(() => {
		return JSON.parse(authInfo.activityDetails);
	}, [authInfo.activityDetails]);

	interface SettingValue {
		title: string;
		type: string;
		value: any;
	}

	const settings = useMemo<Record<string, SettingValue>>(() => {
		return JSON.parse(authInfo.settings);
	}, [authInfo.settings]);

	useEffect(() => {
		const sstate: Record<string, boolean> = {};
		Object.entries(JSON.parse(authInfo.settings) as Record<string, SettingValue>).forEach(([key, value]) => {
			sstate[key] = value.value;
		});
		setSwitchStates(sstate as any);
	}, [authInfo.settings]);

	const switchValueChange = (key: string, value: boolean) => {
		console.log('switchValueChange', key, value);
		setSwitchStates((states) => {
			return {
				...states,
				[key]: value,
			};
		});
	};

	return (
		<ScrollView style={{ padding: 50 }} refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}>
			<ThemedText type="title">Account</ThemedText>
			<View style={{ paddingStart: 25 }}>
				<ThemedText type="subtitle" style={{ paddingTop: 10 }}>
					Details:
				</ThemedText>
				<View style={{ paddingStart: 25 }}>
					<ThemedText>UUID: {authInfo.UUID.split('-')[0]}</ThemedText>
					<ThemedText>Username: {authInfo.username}</ThemedText>
					<ThemedText>Email: {authInfo.email}</ThemedText>
					<ThemedText>Role: {prettifyRole(authInfo.role)}</ThemedText>
				</View>
				<ThemedText type="subtitle" style={{ paddingTop: 10 }}>
					Activity Details:
				</ThemedText>
				<View style={{ paddingStart: 25 }}>
					<ThemedText>Last IP: {activityDetails.lastIP}</ThemedText>
					<ThemedText>Last Handshake: {activityDetails.lastHandshake}</ThemedText>
					<ThemedText>Last Login: {activityDetails.lastLogin}</ThemedText>
				</View>
			</View>
			<View style={{ paddingStart: 0, paddingBottom: 50 }}>
				<ThemedText type="subtitle" style={{ paddingTop: 10 }}>
					Settings:
				</ThemedText>
				<View style={{ paddingStart: 0 }}>
					{/* <ThemedText>UUID: {JSON.stringify(switchStates)}</ThemedText> */}
					{Object.entries(settings).map(([key, value]) => (
						<View key={key}>
							{value.type !== 'hide' ? (
								<View style={{ flex: 1, alignItems: 'center', padding: 10, gap: 5 }}>
									<ThemedText>{value.title}</ThemedText>
									{value.type === 'checkbox' ? (
										<Switch
											style={{ marginTop: 5, paddingEnd: -50 }}
											trackColor={{ false: '#767577', true: '#5D93AB' }}
											thumbColor={switchStates[key] ? '#065A82' : '#f4f3f4'}
											ios_backgroundColor="#3e3e3e"
											value={switchStates[key]}
											onValueChange={(value) => switchValueChange(key, value)}
										/>
									) : key === 'preferredLanguage' ? (
										<View style={styles.inputContainer}>
											{/* <IconSymbol name="lock" size={25} color={'black'} style={styles.icon} /> */}
											<TextInput
												style={styles.input}
												placeholder="Preffered Language"
												// onChangeText={onChangePassword}
												value={value.value}
											/>
										</View>
									) : null}
								</View>
							) : null}
						</View>
					))}
				</View>
			</View>
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
});
