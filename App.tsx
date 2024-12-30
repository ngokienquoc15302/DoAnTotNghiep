import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text, View, AppState, useColorScheme, Dimensions } from "react-native"
import HomeScreen from "./src/screen/HomeScreen";
import LikeScreen from './src/screen/LikeScreen';
import PlayerScreen from './src/screen/PlayerScreen';
import StackNavigation from './src/navigation/StackNavigation';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import TrackPlayer from 'react-native-track-player';
import { useEffect } from 'react';
import { useSetupPlayer } from './src/hooks/useSetupTrackPlayer';
import useLikeSongs from './src/store/likeStore';
import { darkTheme } from './src/theme/darkTheme';
import { lightTheme } from './src/theme/lightTheme';
import { useThemeStore } from './src/store/themeStore';


const Stack = createNativeStackNavigator();
const App = () => {
  const scheme = useColorScheme();
  const {isDarkMode, toggleTheme} = useThemeStore();
  const {loadLikedSongs} = useLikeSongs();
  const onLoad = () => {
    console.log("track player setup");
  };
  
  useSetupPlayer({onLoad});

  useEffect(() => {
    loadLikedSongs();
    scheme === 'light' ? toggleTheme(false) : toggleTheme(true);
  }, [scheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1, }}>
      <NavigationContainer theme={isDarkMode? darkTheme: lightTheme}>
        <DrawerNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;