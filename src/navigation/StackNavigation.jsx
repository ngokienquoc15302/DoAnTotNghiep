import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screen/HomeScreen';
import SearchScreen from '../screen/SearchScreen';
import LikeScreen from '../screen/LikeScreen';
import MyPlaylistScreen from '../screen/UserPlaylistScreen';
import TopTrendingScreen from '../screen/TopTrendingScreen';

import PlayerScreen from '../screen/PlayerScreen';
import PlayerListScreen from '../screen/PlayerListScreen';

import MusicDetailScreen from '../screen/MusicDetailScreen';
import PlaylistDetailScreen from '../screen/PlaylistDetailScreen';

import ProfileScreen from '../screen/ProfileScreen';
import EditProfileScreen from '../screen/EditProfileScreen';
import ChangePasswordScreen from '../screen/ChangePasswordScreen';

import LoginScreen from '../screen/auth/LoginScreen';
import RegisterScreen from '../screen/auth/RegisterScreen';
import WelcomeScreen from '../screen/WelcomeScreen';
import ForgotPasswordScreen from '../screen/auth/ForgotPasswordScreen';

import ImportSongScreen from '../screen/import/ImportSongScreen';
import ImportPlaylistScreen from '../screen/import/ImportPlaylistScreen';

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false,}} initialRouteName='WELCOME_SCREEN'>
        <Stack.Screen name="HOME_SCREEN" component={HomeScreen}/>
        <Stack.Screen name="SEARCH_SCREEN" component={SearchScreen}/>
        <Stack.Screen name="LIKE_SCREEN" component={LikeScreen}/>
        <Stack.Screen name="MY_PLAYLIST_SCREEN" component={MyPlaylistScreen}/>
        <Stack.Screen name="TOP_TRENDING_SCREEN" component={TopTrendingScreen}/>

        <Stack.Screen name="PLAYER_SCREEN" component={PlayerScreen}/>
        <Stack.Screen name="PLAYER_LIST_SCREEN" component={PlayerListScreen}/>


        <Stack.Screen name="MUSIC_DETAIL_SCREEN" component={MusicDetailScreen}/>
        <Stack.Screen name="PLAYLIST_DETAIL_SCREEN" component={PlaylistDetailScreen}/>

        <Stack.Screen name="IMPORT_SONG_SCREEN" component={ImportSongScreen}/>
        <Stack.Screen name="IMPORT_PLAYLIST_SCREEN" component={ImportPlaylistScreen}/>

        <Stack.Screen name="PROFILE_SCREEN" component={ProfileScreen}/>
        <Stack.Screen name="EDIT_PROFILE_SCREEN" component={EditProfileScreen}/>
        <Stack.Screen name="CHANGE_PASSWORD_SCREEN" component={ChangePasswordScreen}/>

        <Stack.Screen name="LOGIN_SCREEN" component={LoginScreen}/>
        <Stack.Screen name="REGISTER_SCREEN" component={RegisterScreen}/>
        <Stack.Screen name="WELCOME_SCREEN" component={WelcomeScreen}/>
        <Stack.Screen name="FORGOTPASSWORD_SCREEN" component={ForgotPasswordScreen}/>
      </Stack.Navigator>
  )
}

export default StackNavigation

const styles = StyleSheet.create({})