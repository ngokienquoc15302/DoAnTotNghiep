import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation, useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import TrackPlayer from 'react-native-track-player';
import SongOptionsModal from '../components/SongOptionModal';
import PlaylistSelectionModal from '../components/PlaylistSelectionModal ';

const { width, height } = Dimensions.get('window');

const PlaylistDetailScreen = ({ route }) => {
  const { playlist } = route.params;
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [userLikedSongs, setUserLikedSongs] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isPlaylistModalVisible, setPlaylistModalVisible] = useState(false);

  // Scroll animation value
  const scrollY = useSharedValue(0);

  useEffect(() => {
    const fetchSongsDetails = async () => {
      if (!playlist.songs?.length) {
        setSongs([]);
        setLoading(false);
        return;
      }

      try {
        const songPromises = playlist.songs.map(async (songId) => {
          const snapshot = await firestore()
            .collection('songs')
            .doc(songId)
            .get();

          return snapshot.exists && snapshot.data()?.title
            ? { id: snapshot.id, ...snapshot.data() }
            : null;
        });

        const songsData = await Promise.all(songPromises);
        const validSongs = songsData.filter(song => song !== null);

        setSongs(validSongs);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongsDetails();
  }, [playlist]);


  const handlePlayAllToggle = async () => {
    if (songs.length === 0) return;

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

      // Xóa queue hiện tại
      await TrackPlayer.reset();

      // Thêm tất cả các bài hát vào queue
      const tracks = songs.map(song => ({
        id: song.id,
        url: song.audioUrl,
        title: song.title,
        artist: song.artist,
        artwork: song.imageUrl
      }));

      await TrackPlayer.add(tracks);

      // Phát bài hát đầu tiên
      await TrackPlayer.skip(0);
      await TrackPlayer.play();

      setIsPlaying(true);
    } catch (error) {
      console.warn("Error playing playlist:", error);
    }
  };

  const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const handleMoreOptions = (song) => {
    setSelectedSong(song);
    setOptionsModalVisible(true);
  };

  const handleAddToPlaylist = async (song) => {
    try {
      if (!auth().currentUser) {
        return;
      }

      const userDoc = await firestore()
        .collection('users')
        .doc(auth().currentUser.uid)
        .get();

      const userData = userDoc.data();

      if (!userData.playlists || userData.playlists.length === 0) {
        Alert.alert('No Playlists', 'You have no playlists. Create one first.');
        return;
      }

      // Lấy thông tin chi tiết của từng playlist và lọc
      const playlistsData = await Promise.all(
        userData.playlists.map(async (playlistId) => {
          const playlistDoc = await firestore()
            .collection('playlists')
            .doc(playlistId)
            .get();
          return { id: playlistId, ...playlistDoc.data() };
        })
      );

      // Lọc ra các playlist không phải playlist hiện tại và không có isSystemGenerated
      const filteredPlaylists = playlistsData.filter(playlistData =>
        playlistData.id !== playlist.id && !playlistData.isSystemGenerated
      );

      if (filteredPlaylists.length === 0) {
        Alert.alert('No Available Playlists', 'No other playlists available to add songs to.');
        return;
      }

      setUserPlaylists(filteredPlaylists);
      setPlaylistModalVisible(true);

    } catch (error) {
      console.error('Error loading playlists:', error);
      Alert.alert('Error', 'Failed to load playlists');
    }
  };

  const addSongToPlaylist = async (playlistId, song) => {
    try {
      const playlistRef = firestore()
        .collection('playlists')
        .doc(playlistId);

      // Kiểm tra xem bài hát đã có trong playlist chưa
      const playlistDoc = await playlistRef.get();
      const playlistData = playlistDoc.data();

      if (playlistData.songs.includes(song.id)) {
        Alert.alert('Already Added', 'This song is already in the playlist');
        return;
      }

      // Thêm bài hát vào playlist
      await playlistRef.update({
        songs: firestore.FieldValue.arrayUnion(song.id),
        updatedAt: firestore.FieldValue.serverTimestamp()
      });

      Alert.alert('Success', 'Song added to playlist');
      setPlaylistModalVisible(false);

    } catch (error) {
      console.error('Error adding song to playlist:', error);
      Alert.alert('Error', 'Failed to add song to playlist');
    }
  };

  const handleAddToPlayTrack = async (song) => {
    try {
      // Cập nhật số lượt plays
      const songRef = firestore()
        .collection('songs')
        .doc(song.id);

      await songRef.update({
        plays: firestore.FieldValue.increment(1)
      });

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

      await TrackPlayer.add({
        id: song.id,
        url: song.audioUrl,
        title: song.title,
        artist: song.artist,
        artwork: song.imageUrl
      });
      const queue = await TrackPlayer.getQueue();
      if (queue.length === 1) {
        await TrackPlayer.skip(queue.length - 1);
        await TrackPlayer.play();
      }
    } catch (error) {
      console.warn("Error playing track:", error);
    }
  };

  useEffect(() => {
    const fetchUserLikedSongs = async () => {
      if (!auth().currentUser) return;

      try {
        const userDoc = await firestore()
          .collection('users')
          .doc(auth().currentUser.uid)
          .get();

        const userData = userDoc.data();
        if (userData && userData.likedSongs) {
          setUserLikedSongs(userData.likedSongs);
        }
      } catch (error) {
        console.error('Error fetching liked songs:', error);
      }
    };

    fetchUserLikedSongs();
  }, []);

  useEffect(() => {
    if (selectedSong) {
      setIsLiked(userLikedSongs.includes(selectedSong.id));
    }
  }, [selectedSong, userLikedSongs]);

  const handleAddToLiked = async (song) => {
    try {
      if (!auth().currentUser) return;

      const userRef = firestore()
        .collection('users')
        .doc(auth().currentUser.uid);

      const songRef = firestore()
        .collection('songs')
        .doc(song.id);

      if (isLiked) {
        await Promise.all([
          userRef.update({
            likedSongs: firestore.FieldValue.arrayRemove(song.id)
          }),
          songRef.update({
            likes: firestore.FieldValue.increment(-1)
          })
        ]);
        setUserLikedSongs(prev => prev.filter(id => id !== song.id));
        setIsLiked(false);
      } else {
        await Promise.all([
          userRef.update({
            likedSongs: firestore.FieldValue.arrayUnion(song.id)
          }),
          songRef.update({
            likes: firestore.FieldValue.increment(1)
          })
        ]);
        setUserLikedSongs(prev => [...prev, song.id]);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error updating liked songs:', error);
    }
  };

  const handleDeleteFromPlaylist = async (song) => {
    try {
      const playlistRef = firestore()
        .collection('playlists')
        .doc(playlist.id);

      // Remove the song from the playlist
      await playlistRef.update({
        songs: firestore.FieldValue.arrayRemove(song.id),
        updatedAt: firestore.FieldValue.serverTimestamp()
      });

      // Update the local songs state to reflect the change
      setSongs(prevSongs => prevSongs.filter(s => s.id !== song.id));

    } catch (error) {
      console.error('Error removing song from playlist:', error);
      Alert.alert('Error', 'Failed to remove song from playlist');
    }
  };

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 200],
        [1, 0],
        Extrapolate.CLAMP
      ),
      transform: [
        {
          scale: interpolate(
            scrollY.value,
            [0, 200],
            [1, 0.8],
            Extrapolate.CLAMP
          )
        }
      ]
    };
  });

  const renderSongItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.songItem,
        {
          backgroundColor: colors.background === '#091227'
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(0,0,0,0.05)'
        }
      ]}
      activeOpacity={0.7}
      onPress={() => {
        // Handle song play
      }}
    >
      <Image
        source={
          item.imageUrl
            ? { uri: item.imageUrl }
            : require('../../assets/image/default-playlist.png')
        }
        style={styles.songCoverArt}
      />
      <View style={styles.songInfo}>
        <Text
          style={[styles.songTitle, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {item.title || 'Unknown Title'}
        </Text>
        <Text
          style={[styles.songArtist, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {item.artist || 'Unknown Artist'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.songMoreIcon}
        onPress={() => handleMoreOptions(item)}
      >
        <Icon name="ellipsis-horizontal" size={24} color={colors.iconSecondary} />
      </TouchableOpacity>
      <SongOptionsModal
        isVisible={isOptionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        song={selectedSong}
        isLiked={isLiked}
        onAddToPlaylist={handleAddToPlaylist}
        onAddToLiked={handleAddToLiked}
        onAddToPlayTrack={handleAddToPlayTrack}
        onDeleteFromPlaylist={handleDeleteFromPlaylist}
        onClickSongInfo={() => navigation.navigate('MUSIC_DETAIL_SCREEN', { song: selectedSong })}
        isSystemGenerated={playlist.isSystemGenerated}
      />
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <View
        colors={
          colors.background
        }
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color={colors.background === '#091227' ? '#3498db' : '#4A6CFF'}
        />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View
        colors={
          colors.background
        }
        style={styles.errorContainer}
      >
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>
          Unable to load playlist
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.retryButtonText, { color: 'white' }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: colors.background === '#091227'
                ? 'rgba(255,255,255,0.2)'
                : 'rgba(0,0,0,0.1)'
            }
          ]}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="arrow-back"
            size={24}
            color={colors.iconPrimary}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            { color: colors.textPrimary }
          ]}
          numberOfLines={1}
        >
          Playlist Detail
        </Text>
      </View>

      {/* Playlist Header */}
      <Animated.View style={[styles.playlistHeader, animatedHeaderStyle]}>
        <Image
          source={
            playlist.imageUrl
              ? { uri: playlist.imageUrl }
              : require('../../assets/image/logo-music.png')
          }
          style={styles.playlistCoverImage}
        />
        <View style={styles.playlistTitleContainer}>
          <Text
            style={[
              styles.playlistTitle,
              { color: colors.textPrimary }
            ]}
            numberOfLines={2}
          >
            {playlist.title || 'Untitled Playlist'}
          </Text>
          <Text
            style={[
              styles.playlistSubtitle,
              { color: colors.textSecondary }
            ]}
          >
            {playlist.description || ''}
          </Text>
          <Text
            style={[
              styles.playlistDetails,
              { color: colors.textSecondary }
            ]}
          >
            {songs.length} Songs • {playlist.tags?.join(', ') || ''}
          </Text>
        </View>
      </Animated.View>
      {/*PlayAllButton*/}
      {songs.length > 0 && (
        <TouchableOpacity
          style={[
            styles.playAllButton,
            {
              backgroundColor: colors.background === '#091227'
                ? '#3498db'
                : '#4A6CFF'
            }
          ]}
          onPress={handlePlayAllToggle}
        >
          <Icon
            name="play"
            size={24}
            color="white"
          />
          <Text style={styles.playAllButtonText}>Play All</Text>
        </TouchableOpacity>
      )}

      {/* Song List */}
      <FlatList
        data={songs}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.songListContainer}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <Text
              style={[
                styles.emptyListText,
                { color: colors.textSecondary }
              ]}
            >
              No songs in this playlist
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
      <PlaylistSelectionModal
        visible={isPlaylistModalVisible}
        onClose={() => setPlaylistModalVisible(false)}
        playlists={userPlaylists}
        onSelectPlaylist={(playlistId) => addSongToPlaylist(playlistId, selectedSong)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    resizeMode: 'cover',
    opacity: 0.5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 15,
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  playlistCoverImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  playlistTitleContainer: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  playlistSubtitle: {
    fontSize: 16,
  },
  songListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 10,
    padding: 10,
  },
  songCoverArt: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 15,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  songArtist: {
    fontSize: 14,
  },
  songMoreIcon: {
    padding: 10,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 18,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 15,
    borderRadius: 30,
    backgroundColor: '#4A6CFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  playAllButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4A6CFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  playlistDetails: {
    fontSize: 14,
    marginTop: 5,
  },
});

export default PlaylistDetailScreen;