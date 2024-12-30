import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { iconSize, spacing } from '../constants/dimensions';
import TrackPlayer from 'react-native-track-player';

const LikeScreen = () => {
  const { colors } = useTheme();
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .onSnapshot(async (userDoc) => {
        try {
          const likedSongIds = userDoc.data()?.likedSongs || [];

          if (likedSongIds.length === 0) {
            setLikedSongs([]);
            setLoading(false);
            return;
          }

          const songsSnapshot = await firestore()
            .collection('songs')
            .where(firestore.FieldPath.documentId(), 'in', likedSongIds)
            .get();

          const songs = songsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setLikedSongs(songs);
          setLoading(false);
        } catch (error) {
          console.error("Error loading liked songs:", error);
          setLoading(false);
        }
      });

    return () => unsubscribe();
  }, []);

  const handlePlayAllLikedSongs = async () => {
    if (likedSongs.length === 0) return;

    try {
      const setupResult = await TrackPlayer.getState();

      if (setupResult === 'idle' || setupResult === null) {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          capabilities: [
            TrackPlayer.Capabilities.Play,
            TrackPlayer.Capabilities.Pause,
            TrackPlayer.Capabilities.SkipToNext,
            TrackPlayer.Capabilities.SkipToPrevious,
            TrackPlayer.Capabilities.Stop,
          ],
          compactCapabilities: [
            TrackPlayer.Capabilities.Play,
            TrackPlayer.Capabilities.Pause,
          ],
        });
      }

      await TrackPlayer.reset();

      const tracks = likedSongs.map(song => ({
        id: song.id,
        url: song.audioUrl,
        title: song.title,
        artist: song.artist,
        artwork: song.imageUrl,
        duration: song.duration
      }));

      await TrackPlayer.add(tracks);
      await TrackPlayer.skip(0);
      await TrackPlayer.play();
    } catch (error) {
      console.error('Error playing liked songs:', error);
    }
  };

  const renderSongItem = ({ item }) => (
    <View style={[styles.songItem, { backgroundColor: colors.itemSong }]}>
      <TouchableOpacity
        style={styles.songContent}
        onPress={() => navigation.navigate('MUSIC_DETAIL_SCREEN', { song: item })}
      >
        <Image
          source={
            item.imageUrl
              ? { uri: item.imageUrl }
              : require('../../assets/image/logo-music.png')
          }
          style={styles.songThumbnail}
        />
        <View style={styles.songInfo}>
          <Text style={[styles.songName, { color: colors.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.songArtist, { color: colors.textSecondary }]}>{item.artist}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textPrimary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.toggleDrawer()}
          >
            <FontAwesome5
              name="grip-lines"
              color={colors.textPrimary}
              size={iconSize.md}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Liked Songs</Text>
        <TouchableOpacity
          style={styles.playAllButton}
          onPress={handlePlayAllLikedSongs}
        >
          <MaterialCommunityIcons
            name="playlist-play"
            color="#FFFFFF"
            size={24}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={likedSongs}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              You haven't liked any songs yet
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10
  },
  playAllButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 10
  },
  listContainer: {
    padding: 15,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 10,
    padding: 10
  },
  songContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  songThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15
  },
  songInfo: {
    flex: 1
  },
  songName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  songArtist: {
    marginTop: 5
  },
  songDuration: {
    marginTop: 5,
    fontSize: 12
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  emptyStateText: {
    fontSize: 16
  },
  iconButton: {
    padding: spacing.xs,
    borderRadius: 8,
  },
});

export default LikeScreen;