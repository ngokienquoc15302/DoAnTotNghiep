import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer'
import { fontSize, iconSize, spacing } from '../constants/dimensions'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Octicons from 'react-native-vector-icons/Octicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import { fontFamilies } from '../constants/fonts'
import { useTheme } from '@react-navigation/native'
import { useThemeStore } from '../store/themeStore'
import { Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import auth from '@react-native-firebase/auth'

const CustomDrawerContent = (props) => {
    const { isDarkMode, toggleTheme } = useThemeStore();
    const { colors } = useTheme();
    const toggleDrawer = () => {
        props.navigation.toggleDrawer();
    }
    const handleLogout = async (navigation, toggleDrawer) => {
        try {
            toggleDrawer();
            await auth().signOut();
            // Remove login information when logging out
            await AsyncStorage.removeItem('savedEmail');
            await AsyncStorage.removeItem('savedPassword');

            // Remove login token from AsyncStorage
            await AsyncStorage.removeItem('userToken');

            // Show confirmation alert
            Alert.alert(
                'Logout',
                'You have successfully logged out!',
                [{
                    text: 'OK',
                    onPress: () => {
                        // Navigate to login screen and reset navigation stack
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'WELCOME_SCREEN' }],
                        });
                    }
                }]
            );
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'An error occurred while logging out.');
        }
    };
    return (
        <DrawerContentScrollView style={[styles.container, { backgroundColor: colors.background, }]}>
            <View style={styles.headerIconContainer}>
                <TouchableOpacity onPress={toggleDrawer}>
                    <AntDesign
                        name={'close'}
                        color={colors.iconPrimary}
                        size={iconSize.lg}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleTheme()}>
                    <Octicons
                        name={isDarkMode ? 'sun' : 'moon'}
                        color={colors.iconPrimary}
                        size={iconSize.lg}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.drawerItemContainer}>
                <DrawerItem
                    label={"Home"}
                    icon={() => (
                        <FontAwesome
                            name={'home'}
                            size={iconSize.md}
                            color={colors.iconPrimary}
                        />
                    )}
                    labelStyle={[styles.labelStyle, { color: colors.textPrimary, }]}
                    style={styles.drawerItem}
                    onPress={() => {
                        props.navigation.navigate('HOME_SCREEN')
                    }}
                />
                <DrawerItem
                    label={"Profile"}
                    icon={() => (
                        <FontAwesome
                            name={'user'}
                            size={iconSize.md}
                            color={colors.iconPrimary}
                        />
                    )}
                    labelStyle={[styles.labelStyle, { color: colors.textPrimary, }]}
                    style={styles.drawerItem}
                    onPress={() => {
                        props.navigation.navigate('PROFILE_SCREEN')
                    }}
                />
                <DrawerItem
                    label={"Liked Song"}
                    icon={() => (
                        <FontAwesome
                            name={'heart'}
                            size={iconSize.md}
                            color={colors.iconPrimary}
                        />
                    )}
                    labelStyle={[styles.labelStyle, { color: colors.textPrimary, }]}
                    style={styles.drawerItem}
                    onPress={() => {
                        props.navigation.navigate('LIKE_SCREEN')
                    }}
                />
                <DrawerItem
                    label={"My Playlist"}
                    icon={() => (
                        <MaterialCommunityIcons
                            name={'playlist-music-outline'}
                            size={iconSize.md}
                            color={colors.iconPrimary}
                        />
                    )}
                    labelStyle={[styles.labelStyle, { color: colors.textPrimary, }]}
                    style={styles.drawerItem}
                    onPress={() => {
                        props.navigation.navigate('MY_PLAYLIST_SCREEN')
                    }}
                />
                <DrawerItem
                    label={"Top Trending"}
                    icon={() => (
                        <MaterialIcons
                            name={'trending-up'}
                            size={iconSize.md}
                            color={colors.iconPrimary}
                        />
                    )}
                    labelStyle={[styles.labelStyle, { color: colors.textPrimary, }]}
                    style={styles.drawerItem}
                    onPress={() => {
                        props.navigation.navigate('TOP_TRENDING_SCREEN')
                    }}
                />
                <DrawerItem
                    label={"LogOut"}
                    icon={() => (
                        <Entypo
                            name={'log-out'}
                            size={iconSize.md}
                            color={colors.iconPrimary}
                        />
                    )}
                    labelStyle={[styles.labelStyle, { color: colors.textPrimary, }]}
                    style={styles.drawerItem}
                    onPress={() => handleLogout(props.navigation, toggleDrawer)}
                />
            </View>
        </DrawerContentScrollView>
    )
}

export default CustomDrawerContent

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
    },
    headerIconContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    drawerItemContainer: {
        marginVertical: spacing.xl,
    },
    labelStyle: {
        fontSize: fontSize.md,
        fontFamily: fontFamilies.medium,
    },
    drawerItem: {
        marginVertical: spacing.sm,
    }
})