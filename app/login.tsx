import { IconSymbol } from '@/components/ui/IconSymbol';
import useStore from '@/hooks/useStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
	const router = useRouter();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const login = useStore((state) => state.login);

	const onChangeUsername = (text: string) => setUsername(text);
	const onChangePassword = (text: string) => setPassword(text);

	const onLogin = async () => {
		await login(username, password);
		console.log('Logged in', username, password);
		router.push('/(tabs)/list');
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			{/* <Image
				// source={'https://cinema.jodu555.de/favicon/logo.png'}
				source={'https://cinema.jodu555.de/favicon/favicon-256x256.png'}
				// source={'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png'}
				contentFit="contain"
				style={styles.logo}
			/> */}
			<Text style={styles.title}>CineFinn</Text>
			<Text style={styles.subtitle}>Login</Text>

			<View style={styles.inputContainer}>
				<IconSymbol name="brain.head.profile" size={25} color={'black'} style={styles.icon} />
				<TextInput style={styles.input} placeholder="Username" onChangeText={onChangeUsername} value={username} />
			</View>
			{/* {errors.email && touched.email && <Text style={styles.errorText}>{errors.email}</Text>} */}
			<View style={styles.inputContainer}>
				<IconSymbol name="lock" size={25} color={'black'} style={styles.icon} />
				<TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={onChangePassword} value={password} />
			</View>
			{/* {errors.password && touched.password && <Text style={styles.errorText}>{errors.password}</Text>} */}
			{/* <TouchableOpacity
			// onPress={() => navigation.navigate('Forget')}
			>
				<Text style={styles.forgotPassword}>Forgot Password?</Text>
			</TouchableOpacity> */}
			<TouchableOpacity
				style={styles.button}
				onPress={onLogin}
				// disabled={!isValid}
			>
				<Text style={styles.buttonText}>Login</Text>
			</TouchableOpacity>
			<TouchableOpacity
			// onPress={() => navigation.navigate('SignUp')}
			>
				<Text style={styles.signUp}>
					Don&apos;t have an account? <Text style={styles.signUpLink}>Sign Up</Text>
				</Text>
			</TouchableOpacity>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		// flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		// backgroundColor: '#fff',
		paddingHorizontal: 20,
		paddingBottom: 100,
	},
	logo: {
		height: 100,
		width: 200,
		marginBottom: 15,
	},
	title: {
		marginTop: 35,
		fontSize: 55,
		marginBottom: 30,
		fontWeight: 'bold',
		color: 'white',
	},
	subtitle: {
		fontSize: 32,
		marginBottom: 20,
		fontWeight: 'bold',
		color: 'white',
	},
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
	forgotPassword: {
		alignSelf: 'flex-end',
		marginBottom: 20,
		color: 'white',
	},
	button: {
		width: '100%',
		height: 50,
		backgroundColor: '#1E90FF',
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
	},
	buttonText: {
		color: '#fff',
		fontSize: 18,
	},
	signUp: {
		color: 'white',
	},
	signUpLink: {
		color: '#1E90FF',
	},
	errorText: {
		color: 'red',
		alignSelf: 'flex-start',
		marginBottom: 10,
	},
});
