import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const SignupScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');


    const validateForm = () => {
        if (!formData.fullName.trim()) {
            setErrorMessage('Please enter your full name');
            return false;
        }
        if (!formData.email.trim()) {
            setErrorMessage('Please enter your email');
            return false;
        }
        if (!formData.password) {
            setErrorMessage('Please enter a password');
            return false;
        }
        if (formData.password.length < 6) {
            setErrorMessage('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match');
            return false;
        }
        if (!acceptTerms) {
            setErrorMessage('Please accept the Terms and Conditions');
            return false;
        }
        return true;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Create user with email and password
            const response = await auth().createUserWithEmailAndPassword(
                formData.email,
                formData.password
            );

            // Update user profile with full name
            await response.user.updateProfile({
                displayName: formData.fullName,
            });

            // Send email verification
            await response.user.sendEmailVerification();

            // Clear error message
            setErrorMessage('');
            
            await firestore().collection('users').doc(response.user.uid).set({
                username: formData.fullName,
                email: formData.email,
                createdAt: firestore.Timestamp.now(),
                avatarUrl: '',  // Default empty avatar
                dateOfBirth: '',
                phone: '',
                favoriteGenres: [],
                followers: [],
                following: [],
                likedSongs: [],
                playlists: []
            });
            // Show success message
            Alert.alert(
                'Registration Successful',
                'Please verify your email address. We have sent you a verification email.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('LOGIN_SCREEN'),
                    },
                ]
            );
        } catch (error) {
            let message = 'An error occurred during registration';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'This email address is already registered';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address';
                    break;
                case 'auth/operation-not-allowed':
                    message = 'Email/password accounts are not enabled';
                    break;
                case 'auth/weak-password':
                    message = 'Please choose a stronger password';
                    break;
                default:
                    console.error(error);
            }
            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };


    const updateFormData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        // Clear error message when user starts typing
        setErrorMessage('');
    };

    const handleLoginScreen = () => {
        navigation.navigate('LOGIN_SCREEN');
    };

    // Rest of your render code remains the same, but add error message display
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.content}>
                {/* Logo section */}
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

                <Text style={[styles.title, { color: colors.textPrimary }]}>Create your account</Text>

                {/* Error Message Display */}
                {errorMessage ? (
                    <Text style={[styles.errorMessage, { color: 'red' }]}>{errorMessage}</Text>
                ) : null}

                {/* Form section */}
                <View style={styles.form}>
                    {/* Full Name Input */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: colors.card,
                                color: '#091127',
                                borderColor: colors.border,
                            }]}
                            value={formData.fullName}
                            onChangeText={(text) => updateFormData('fullName', text)}
                            placeholder="Enter your full name"
                            placeholderTextColor={colors.textSecondary}
                            editable={!loading}
                        />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Email address</Text>
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: colors.card,
                                color: '#091127',
                                borderColor: colors.border,
                            }]}
                            value={formData.email}
                            onChangeText={(text) => updateFormData('email', text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="Enter your email"
                            placeholderTextColor={colors.textSecondary}
                            editable={!loading}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: colors.card,
                                color: '#091127',
                                borderColor: colors.border,
                            }]}
                            value={formData.password}
                            onChangeText={(text) => updateFormData('password', text)}
                            secureTextEntry
                            placeholder="Create a password"
                            placeholderTextColor={colors.textSecondary}
                            editable={!loading}
                        />
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm Password</Text>
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: colors.card,
                                color: '#091127',
                                borderColor: colors.border,
                            }]}
                            value={formData.confirmPassword}
                            onChangeText={(text) => updateFormData('confirmPassword', text)}
                            secureTextEntry
                            placeholder="Confirm your password"
                            placeholderTextColor={colors.textSecondary}
                            editable={!loading}
                        />
                    </View>

                    {/* Terms and Conditions */}
                    <TouchableOpacity
                        style={styles.termsContainer}
                        onPress={() => !loading && setAcceptTerms(!acceptTerms)}>
                        <View style={[
                            styles.checkbox, 
                            { borderColor: colors.primary },
                            acceptTerms && { backgroundColor: colors.primary }
                        ]}>
                            {acceptTerms && <Text style={[styles.checkmark, { color: colors.minimumTintColor }]}>✓</Text>}
                        </View>
                        <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                            I agree to the{' '}
                            <Text style={[styles.termsLink, { color: colors.primary }]}>Terms and Conditions</Text> and{' '}
                            <Text style={[styles.termsLink, { color: colors.primary }]}>Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        style={[
                            styles.signUpButton,
                            { backgroundColor: colors.primary },
                            (!acceptTerms || loading) && styles.signUpButtonDisabled
                        ]}
                        onPress={handleSignUp}
                        disabled={!acceptTerms || loading}>
                        <Text style={[styles.signUpText, { color: colors.minimumTintColor }]}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Text>
                    </TouchableOpacity>

                    {/* Sign in link */}
                    <View style={styles.signInContainer}>
                        <Text style={[styles.signInText, { color: colors.textSecondary }]}>Already have an account? </Text>
                        <TouchableOpacity onPress={handleLoginScreen} disabled={loading}>
                            <Text style={[styles.signInLink, { color: colors.primary }]}>Sign in</Text>
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
        backgroundColor: '#1a1a2e',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    logoBox: {
        width: 60,
        height: 60,
        backgroundColor: '#00f2ea',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 30,
        height: 30,
        tintColor: '#fff',
    },
    logoText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 30,
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        color: '#fff',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#ffffff10',
        borderRadius: 8,
        padding: 15,
        color: '#fff',
        fontSize: 16,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#00f2ea',
        borderRadius: 4,
        marginRight: 8,
        marginTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#00f2ea',
    },
    checkmark: {
        color: '#fff',
        fontSize: 14,
    },
    termsText: {
        color: '#fff',
        flex: 1,
        lineHeight: 20,
    },
    termsLink: {
        color: '#00f2ea',
        textDecorationLine: 'underline',
    },
    signUpButton: {
        backgroundColor: '#00f2ea',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    signUpButtonDisabled: {
        backgroundColor: '#ffffff',
    },
    signUpText: {
        color: '#1a1a2e',
        fontSize: 16,
        fontWeight: '600',
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    signInText: {
        color: '#fff',
    },
    signInLink: {
        color: '#00f2ea',
    },
});

export default SignupScreen;