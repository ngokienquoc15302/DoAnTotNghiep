import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useTheme } from '@react-navigation/native';

const TrendingPlaylistItem = ({ playlist }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={[styles.playlistItem, {
        backgroundColor: colors.itemSong
      }]}
      onPress={() => { navigation.navigate('PLAYLIST_DETAIL_SCREEN', { playlist: playlist }) }}
    >
      <Image
      source={
        playlist.imageUrl
          ? { uri: playlist.imageUrl }
          : require('../../assets/image/logo-music.png')
      }
        style={styles.playlistImage}
      />

      <View style={styles.playlistInfo}>
        <Text
          style={[
            styles.playlistName,
            { color: colors.textPrimary }
          ]}
          numberOfLines={1}
        >
          {playlist.title}
        </Text>
        <Text
          style={[
            styles.playlistCreator,
            { color: colors.textSecondary }
          ]}
          numberOfLines={1}
        >
          {playlist.description || 'Playlist'} • {playlist.songs?.length || 0} songs
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.playPlaylistButton,
          { backgroundColor: '#4CAF50' }
        ]}
      >
        <Icon
          name="play"
          size={20}
          color={colors.background}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    borderRadius: 10,
    padding: 10
  },
  playlistImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15
  },
  playlistInfo: {
    flex: 1
  },
  playlistName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  playlistCreator: {
    // Color will be set dynamically
  },
  playPlaylistButton: {
    padding: 10,
    borderRadius: 50
  }
});

export default TrendingPlaylistItem;