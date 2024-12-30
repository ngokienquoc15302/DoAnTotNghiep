import { DeviceEventEmitter, SafeAreaView, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import StackNavigation from './StackNavigation'
import CustomDrawerContent from './CustomDrawerContent'
import FloatingPlayer from '../components/FloatingPlayer'
import TrackPlayer, { Event, useTrackPlayerEvents } from 'react-native-track-player'

const Drawer = createDrawerNavigator()

const DrawerNavigator = () => {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [currentScreen, setCurrentScreen] = useState('')
  useEffect(() => {
    // Đăng ký lắng nghe sự kiện PLAYLIST_EMPTY
    const subscription = DeviceEventEmitter.addListener(
      'PLAYLIST_EMPTY',
      () => {
        setCurrentTrack(null);
      }
    );

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, []);
  useTrackPlayerEvents([Event.PlaybackTrackChanged], async ({ type }) => {
    if (type === Event.PlaybackTrackChanged) {
      const trackId = await TrackPlayer.getCurrentTrack()
      if (trackId !== null) {
        const track = await TrackPlayer.getTrack(trackId)
        setCurrentTrack(track)
      }
    }
  })

  return (
    <SafeAreaView style={{ 
      flex: 1,
      paddingBottom: currentTrack && (currentScreen !== 'PLAYER_SCREEN' && currentScreen !== 'PLAYER_LIST_SCREEN') ? 70 : 0 
     }}>
      <Drawer.Navigator
        screenOptions={{
          headerShown: false,
          drawerType: 'slide',
          swipeEdgeWidth: 0,
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name='DRAWER_HOME'
          component={StackNavigation}
          listeners={({ navigation }) => ({
            state: (e) => {
              // Lấy tên route hiện tại
              setCurrentScreen(navigation.getState().routes[navigation.getState().index].state?.routes[navigation.getState().routes[navigation.getState().index].state?.index]?.name)
            }
          })}
        />
      </Drawer.Navigator>
      {(currentScreen !== 'PLAYER_SCREEN' && currentScreen !== 'PLAYER_LIST_SCREEN') && (
      <FloatingPlayer 
      currentTrack={currentTrack} 
      style={styles.floatingPlayer}
      />
    )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  floatingPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  }
})

export default DrawerNavigator