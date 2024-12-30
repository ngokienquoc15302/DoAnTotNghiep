import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Image, 
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WelcomeScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
    
            // Kiểm tra xem có lưu thông tin đăng nhập không
            const savedEmail = await AsyncStorage.getItem('savedEmail');
            const savedPassword = await AsyncStorage.getItem('savedPassword');
    
            const user = auth().currentUser;
            
            if (user && savedEmail && savedPassword) {
                try {
                    await user.getIdToken(true);
                    navigation.replace('HOME_SCREEN');
                } catch (error) {
                    await auth().signOut();
                    await AsyncStorage.removeItem('savedEmail');
                    await AsyncStorage.removeItem('savedPassword');
                    setIsLoading(false);
                }
            } else {
                // Nếu không có thông tin lưu trữ hoặc user không hợp lệ
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            await auth().signOut();
            await AsyncStorage.removeItem('savedEmail');
            await AsyncStorage.removeItem('savedPassword');
            setIsLoading(false);
        }
    };

    const handleSignIn = () => {
        navigation.navigate('LOGIN_SCREEN');
    };

    const handleSignUp = () => {
        navigation.navigate('REGISTER_SCREEN');
    };

    // Nếu đang loading, hiển thị indicator
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
                        <Image
                            source={require('../../assets/image/logo-music.png')}
                            style={[styles.logo, { tintColor: colors.minimumTintColor }]}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={[styles.logoText, { color: colors.textPrimary }]}>KQC Music</Text>
                </View>

                {/* Welcome Illustration */}
                <View style={styles.illustrationContainer}>
                    <Image
                        source={require('../../assets/image/img-welcome.png')}
                        style={styles.illustration}
                        resizeMode="contain"
                    />
                </View>

                {/* Welcome Text */}
                <View style={styles.textContainer}>
                    <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
                        Enjoy Your Music
                    </Text>
                    <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                        Discover, listen, and enjoy your favorite music anytime, anywhere.
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.signInButton, { backgroundColor: colors.primary }]}
                        onPress={handleSignIn}>
                        <Text style={[styles.signInText, { color: '#FFFFFF' }]}>Sign in</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.signUpButton, { borderColor: colors.primary }]}
                        onPress={handleSignUp}>
                        <Text style={[styles.signUpText, { color: colors.primary }]}>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        justifyContent: 'space-between',
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
    illustrationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginVertical: 30,
    },
    illustration: {
        width: '100%',
        maxHeight: 300,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    welcomeSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    buttonContainer: {
        marginBottom: 20,
    },
    signInButton: {
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 15,
    },
    signInText: {
        fontSize: 16,
        fontWeight: '600',
    },
    signUpButton: {
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
    },
    signUpText: {
        fontSize: 16,
        fontWeight: '600',
    }
});

export default WelcomeScreen;