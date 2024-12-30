import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, Alert, } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useTheme } from '@react-navigation/native';
import TrackPlayer from 'react-native-track-player';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import PlaylistSelectionModal from '../components/PlaylistSelectionModal ';

const { width } = Dimensions.get('window');

const SongDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { song } = route.params;
  const [isLiked, setIsLiked] = useState(false);
  const [songData, setSongData] = useState(song);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('songs')
      .doc(song.id)
      .onSnapshot(documentSnapshot => {
        if (documentSnapshot.exists) {
          setSongData({
            ...song,
            ...documentSnapshot.data()
          });
        }
      });

    return () => unsubscribe();
  }, [song.id]);

  useEffect(() => {
    const checkIfSongIsLiked = async () => {
      if (song && auth().currentUser) {
        const userDoc = await firestore()
          .collection('users')
          .doc(auth().currentUser.uid)
          .get();

        const userData = userDoc.data();
        setIsLiked(userData.likedSongs.includes(song.id));
      }
    };

    checkIfSongIsLiked();
  }, [song]);

  // Function to convert timestamp
  const formatDate = (timestamp) => {
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    return 'Not available';
  };

  const handlePlayTrack = async () => {
    try {
      // Cập nhật số lượt plays trước khi phát nhạc
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
      await TrackPlayer.skip(queue.length - 1);
      await TrackPlayer.play();
    } catch (error) {
      console.warn("Error playing track:", error);
    }
  };


  // Thêm hàm handleAddToLiked
  const handleAddToLiked = async () => {
    try {
      if (!auth().currentUser) {
        return;
      }

      const userRef = firestore()
        .collection('users')
        .doc(auth().currentUser.uid);

      // Thêm reference tới document của bài hát
      const songRef = firestore()
        .collection('songs')
        .doc(song.id);

      if (isLiked) {
        // Xóa khỏi likedSongs và giảm số likes
        await Promise.all([
          userRef.update({
            likedSongs: firestore.FieldValue.arrayRemove(song.id)
          }),
          songRef.update({
            likes: firestore.FieldValue.increment(-1)
          })
        ]);
        setIsLiked(false);
      } else {
        // Thêm vào likedSongs và tăng số likes
        await Promise.all([
          userRef.update({
            likedSongs: firestore.FieldValue.arrayUnion(song.id)
          }),
          songRef.update({
            likes: firestore.FieldValue.increment(1)
          })
        ]);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Lỗi khi thêm/xóa bài hát khỏi danh sách yêu thích:', error);
    }
  };

  const handleAddToPlaylist = async () => {
    try {
      if (!auth().currentUser) {
        return;
      }

      // Lấy danh sách playlist của user
      const userDoc = await firestore()
        .collection('users')
        .doc(auth().currentUser.uid)
        .get();

      const userData = userDoc.data();

      if (!userData.playlists || userData.playlists.length === 0) {
        // Thông báo chưa có playlist
        Alert.alert('No Playlists', 'You have no playlists. Create one first.');
        return;
      }

      // Lấy thông tin chi tiết của từng playlist
      const playlistsData = await Promise.all(
        userData.playlists.map(async (playlistId) => {
          const playlistDoc = await firestore()
            .collection('playlists')
            .doc(playlistId)
            .get();
          return { id: playlistId, ...playlistDoc.data() };
        })
      );

      setUserPlaylists(playlistsData);
      setShowPlaylistModal(true);

    } catch (error) {
      console.error('Error loading playlists:', error);
      Alert.alert('Error', 'Failed to load playlists');
    }
  };

  const addSongToPlaylist = async (playlistId) => {
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
      setShowPlaylistModal(false);

    } catch (error) {
      console.error('Error adding song to playlist:', error);
      Alert.alert('Error', 'Failed to add song to playlist');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={colors.iconPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Song Details</Text>
        </View>

        <View style={styles.heroSection}>
          <View style={[styles.artworkContainer, { backgroundColor: colors.textSecondary + '20' }]}>
            <Image
              source={{ uri: song.imageUrl }}
              style={styles.artwork}
            />
          </View>
          <View style={styles.basicInfo}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{song.title}</Text>
            <Text style={[styles.artist, { color: colors.textSecondary }]}>{song.artist}</Text>
          </View>
        </View>

        <View style={[styles.stats, { borderColor: colors.textSecondary + '20' }]}>
          <View style={styles.statItem}>
            <Icon name="headset" size={24} color={colors.iconPrimary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{songData.plays || '0'}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="favorite" size={24} color={colors.iconPrimary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{songData.likes || '0'}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="download" size={24} color={colors.iconPrimary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{songData.downloads || '0'}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePlayTrack}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.textPrimary }]}>
              <Icon name="play-circle-filled" size={24} color={colors.background} />
            </View>
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddToPlaylist}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.textPrimary }]}>
              <Icon name="playlist-add" size={24} color={colors.background} />
            </View>
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>Add to Playlist</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddToLiked}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.textPrimary }]}>
              <Icon
                name={isLiked ? "favorite" : "favorite-border"}
                size={24}
                color={colors.background}
              />
            </View>
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.detailSection, { backgroundColor: colors.textSecondary + '10' }]}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Genre</Text>
            <Text style={[styles.detailText, { color: colors.textPrimary }]}>{song.genre || 'Unclassified'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Release Date</Text>
            <Text style={[styles.detailText, { color: colors.textPrimary }]}>
              {formatDate(song.releaseDate)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Duration</Text>
            <Text style={[styles.detailText, { color: colors.textPrimary }]}>{song.duration || 'Not updated'}</Text>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Introduction</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {song.description || 'No description'}
          </Text>
        </View>

        {song.tags && song.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tags</Text>
            <View style={styles.tagContainer}>
              {song.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.textSecondary + '20' }]}>
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      <PlaylistSelectionModal
        visible={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        playlists={userPlaylists}
        onSelectPlaylist={addSongToPlaylist}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  heroSection: {
    alignItems: 'center',
    padding: 20,
  },
  artworkContainer: {
    width: width - 100,
    height: width - 100,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  basicInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  artist: {
    fontSize: 18,
    marginTop: 8,
  },
  album: {
    fontSize: 16,
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
  },
  detailSection: {
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
  },
  descriptionSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  lyricsSection: {
    padding: 20,
  },
  lyrics: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagsSection: {
    padding: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    margin: 5,
  },
  tagText: {
    fontSize: 12,
  },
});

export default SongDetailScreen;