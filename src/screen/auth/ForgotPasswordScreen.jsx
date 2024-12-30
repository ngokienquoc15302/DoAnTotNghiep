import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    SafeAreaView,
    Alert,
    ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { iconSize } from '../../constants/dimensions';

const ForgotPasswordScreen = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email) return;

        try {
            setIsLoading(true);
            await auth().sendPasswordResetEmail(email);
            setIsSubmitted(true);
            setTimeout(() => {
                navigation.navigate('LOGIN_SCREEN');
            }, 30000);
        } catch (error) {
            let errorMessage = 'An error occurred. Please try again.';

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account exists with this email address.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many attempts. Please try again later.';
                    break;
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setIsLoading(true);
            await auth().sendPasswordResetEmail(email);
            Alert.alert('Success', 'Reset password email has been resent.');
        } catch (error) {
            Alert.alert('Error', 'Failed to resend email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.content}>
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                    <AntDesign name="arrowleft" color={colors.iconPrimary} size={iconSize.md} />
                </TouchableOpacity>

                {!isSubmitted ? (
                    <>
                        <View style={styles.logoContainer}>
                            <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
                                <Image
                                    source={require('../../../assets/image/logo-music.png')}
                                    style={[styles.logo, { tintColor: colors.background }]}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={[styles.logoText, { color: colors.textPrimary }]}>KQC Music</Text>
                        </View>

                        <Text style={[styles.title, { color: colors.textPrimary }]}>Forgot Password</Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            Enter the email address associated with your account and we'll send you a link to reset your password.
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Email address</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: colors.itemSong,
                                    color: colors.textPrimary
                                }]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!email || isLoading) && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={!email || isLoading}
                        >
                            <Text style={[styles.submitButtonText, { color: colors.background }]}>
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.successContainer}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.itemSong }]}>
                            <Image
                                source={require('../../../assets/image/logo-music.png')}
                                style={[styles.emailSentIcon, { tintColor: colors.iconPrimary }]}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Check your email</Text>

                        <Text style={[styles.successDescription, { color: colors.textSecondary }]}>
                            We have sent a password reset link to{'\n'}
                            <Text style={[styles.emailText, { color: colors.textPrimary }]}>{email}</Text>
                        </Text>

                        <View style={styles.resendContainer}>
                            <Text style={[styles.resendText, { color: colors.textSecondary }]}>
                                Didn't receive the email?{' '}
                            </Text>
                            <TouchableOpacity
                                onPress={handleResend}
                                disabled={isLoading}
                            >
                                <Text style={[
                                    styles.resendLink,
                                    { color: colors.primary },
                                    isLoading && styles.resendLinkDisabled
                                ]}>
                                    {isLoading ? 'Sending...' : 'Click to resend'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
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
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginBottom: 10,
    },
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#fff',
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
        marginBottom: 15,
    },
    description: {
        color: '#ffffff90',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 30,
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
    submitButton: {
        backgroundColor: '#00f2ea',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#00f2ea50',
    },
    submitButtonText: {
        color: '#1a1a2e',
        fontSize: 16,
        fontWeight: '600',
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        marginBottom: 20,
    },
    signInText: {
        color: '#fff',
    },
    signInLink: {
        color: '#00f2ea',
    },
    // Success Message Styles
    successContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    iconContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#ffffff10',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emailSentIcon: {
        width: 50,
        height: 50,
        tintColor: '#00f2ea',
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 15,
    },
    successDescription: {
        color: '#ffffff90',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    emailText: {
        color: '#fff',
        fontWeight: '500',
    },
    resendContainer: {
        flexDirection: 'row',
        marginTop: 30,
        alignItems: 'center',
    },
    resendText: {
        color: '#ffffff90',
    },
    resendLink: {
        color: '#00f2ea',
        textDecorationLine: 'underline',
    },
    resendLinkDisabled: {
        color: '#00f2ea50',
    },
});

export default ForgotPasswordScreen;