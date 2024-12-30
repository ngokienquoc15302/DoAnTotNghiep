import { useNavigation, useTheme } from '@react-navigation/native';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Khởi tạo Google Sign In
        GoogleSignin.configure({
            webClientId: 'YOUR_WEB_CLIENT_ID', // Lấy từ Google Cloud Console
        });

        // Kiểm tra thông tin đăng nhập đã lưu
        checkSavedCredentials();
    }, []);

    const checkSavedCredentials = async () => {
        try {
            const savedEmail = await AsyncStorage.getItem('savedEmail');
            const savedPassword = await AsyncStorage.getItem('savedPassword');
            if (savedEmail && savedPassword) {
                setEmail(savedEmail);
                setPassword(savedPassword);
                setRememberMe(true);
            }
        } catch (error) {
            console.error('Error loading saved credentials:', error);
        }
    };

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        
        setLoading(true);
        try {
            const response = await auth().signInWithEmailAndPassword(email, password);
            if (response.user) {
                // Chỉ lưu thông tin khi rememberMe được chọn
                if (rememberMe) {
                    await saveCredentials();
                }
                navigation.navigate('HOME_SCREEN');
            }
        } catch (error) {
            let errorMessage = 'An error occurred during sign in';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'User not found';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Invalid password';
                    break;
            }
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    const saveCredentials = async () => {
        try {
            if (rememberMe) {
                // Chỉ lưu khi rememberMe = true
                await AsyncStorage.setItem('savedEmail', email);
                await AsyncStorage.setItem('savedPassword', password);
            } else {
                // Xóa thông tin đăng nhập nếu không chọn Remember me
                await AsyncStorage.removeItem('savedEmail');
                await AsyncStorage.removeItem('savedPassword');
            }
        } catch (error) {
            console.error('Error saving credentials:', error);
        }
        
    };
    const handleRegisterScreen = () => {
        navigation.navigate('REGISTER_SCREEN');
    }
    const handleForgotPasswordScreen = () => {
        navigation.navigate('FORGOTPASSWORD_SCREEN');
    }
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
                        <Image
                            source={require('../../../assets/image/logo-music.png')}
                            style={[styles.logo, { tintColor: colors.minimumTintColor }]}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={[styles.logoText, { color: colors.textPrimary }]}>KQC Music</Text>
                </View>

                <Text style={[styles.title, { color: colors.textPrimary }]}>Sign in to your account</Text>

                {/* Form đăng nhập */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Email address</Text>
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: colors.card,
                                color: '#091127',
                                borderColor: colors.border
                            }]}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: colors.card,
                                color: '#091127',
                                borderColor: colors.border
                            }]}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    {/* Remember me và Forgot password */}
                    <View style={styles.optionsRow}>
                        <TouchableOpacity
                            style={styles.rememberContainer}
                            onPress={() => setRememberMe(!rememberMe)}>
                            <View style={[styles.checkbox, { borderColor: colors.primary }, rememberMe && { backgroundColor: colors.primary }]}>
                                {rememberMe && <Text style={[styles.checkmark, { color: colors.minimumTintColor }]}>✓</Text>}
                            </View>
                            <Text style={[styles.rememberText, { color: colors.textSecondary }]}>Remember me</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleForgotPasswordScreen}>
                            <Text style={[styles.forgotPassword, { color: colors.primary }]}>Forgot your password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign in button */}
                    <TouchableOpacity 
                        style={[styles.signInButton, { backgroundColor: colors.primary }]}
                        onPress={handleSignIn}>
                        <Text style={[styles.signInText, { color: '#FFFFFF' }]}>Sign in</Text>
                    </TouchableOpacity>

                    {/* Sign up link */}
                    <View style={styles.signUpContainer}>
                        <Text style={[styles.signUpText, { color: colors.textSecondary }]}>Don't have an account? </Text>
                        <TouchableOpacity onPress={handleRegisterScreen}>
                            <Text style={[styles.signUpLink, { color: colors.primary }]}>Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    logoBox: {
        width: 60,
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 30,
        height: 30,
    },
    logoText: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 30,
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
    },
    input: {
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderRadius: 4,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        fontSize: 14,
    },
    rememberText: {
        color: '#fff',
    },
    forgotPassword: {
        color: '#00f2ea',
    },
    signInButton: {
        backgroundColor: '#00f2ea',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    signInText: {
        color: '#1a1a2e',
        fontSize: 16,
        fontWeight: '600',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    signUpText: {
        color: '#fff',
    },
    signUpLink: {
        color: '#00f2ea',
    },
});

export default LoginScreen;