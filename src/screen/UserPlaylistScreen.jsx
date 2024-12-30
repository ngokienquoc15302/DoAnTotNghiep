import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useTheme } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { iconSize, spacing } from '../constants/dimensions';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import PlaylistOptionsModal from '../components/PlaylistOptionsModal';
import EditPlaylistModal from '../components/EditPlaylistModal';

// Utility function to format timestamp
const formatTimestamp = (timestamp) => {
  if (timestamp && timestamp._seconds) {
    return new Date(timestamp._seconds * 1000).toLocaleDateString();
  }
  return 'Undefined';
};

const UserPlaylistScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [playlists, setPlaylists] = useState([]);
  const [isCreatePlaylistModalVisible, setCreatePlaylistModalVisible] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isEditPlaylistModalVisible, setEditPlaylistModalVisible] = useState(false);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      navigation.navigate('Login');
      return;
    }

    const subscriber = firestore()
      .collection('playlists')
      .where('userId', '==', currentUser.uid)
      .onSnapshot(
        querySnapshot => {
          const playlistsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              formattedCreatedAt: formatTimestamp(data.createdAt),
              formattedUpdatedAt: formatTimestamp(data.updatedAt)
            };
          });

          setPlaylists(playlistsData);
        },
        error => {
          console.error('Error fetching playlists:', error);
        }
      );

    return () => subscriber();
  }, []);

  const handleCreatePlaylist = () => {
    setCreatePlaylistModalVisible(true);
  };

  const handlePlaylistCreation = (newPlaylist) => {
    setCreatePlaylistModalVisible(false);
    navigation.navigate('PLAYLIST_DETAIL_SCREEN', { playlist: newPlaylist });
  };

  const handleEditPlaylist = (playlist) => {
    setSelectedPlaylistId(playlist.id); // Nếu cần
    setEditPlaylistModalVisible(true);
    setSelectedPlaylist(playlist);
  };
  
  // Khi đóng EditPlaylistModal
  const handleCloseEditModal = () => {
    setEditPlaylistModalVisible(false);
    setSelectedPlaylist(null);  // Reset selected playlist sau khi đóng modal
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      const currentUser = auth().currentUser;
      await firestore().collection('playlists').doc(playlistId).delete();
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          playlists: firestore.FieldValue.arrayRemove(playlistId)
        });
      setSelectedPlaylist(null);
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const renderPlaylistItem = ({ item }) => (
    <View style={[styles.playlistItem, { backgroundColor: colors.itemSong }]}>
      <TouchableOpacity
        style={styles.playlistContent}
        onPress={() => navigation.navigate('PLAYLIST_DETAIL_SCREEN', { playlist: item })}
      >
        <Image
          source={
            item.imageUrl
              ? { uri: item.imageUrl }
              : require('../../assets/image/logo-music.png')
          }
          style={styles.playlistThumbnail}
        />
        <View style={styles.playlistInfo}>
          <Text style={[styles.playlistName, { color: colors.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.playlistDetails, { color: colors.textSecondary }]}>
            {item.songs?.length || 0} songs
          </Text>
          <Text style={[
            styles.playlistStatus,
            { color: item.isPublic ? '#4CAF50' : '#FF5722' }
          ]}>
            {item.isPublic ? 'Public' : 'Private'}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setSelectedPlaylist(item)}
      >
        <Icon name="more-horiz" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border, }]}>
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Playlists</Text>
        <TouchableOpacity
          style={styles.createPlaylistButton}
          onPress={handleCreatePlaylist}
        >
          <Icon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        renderItem={renderPlaylistItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              You don't have any playlists yet
            </Text>
            <TouchableOpacity
              style={styles.createFirstPlaylistButton}
              onPress={handleCreatePlaylist}
            >
              <Text style={styles.createFirstPlaylistButtonText}>Create your first playlist</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
      <CreatePlaylistModal
        isVisible={isCreatePlaylistModalVisible}
        onClose={() => setCreatePlaylistModalVisible(false)}
        onCreatePlaylist={handlePlaylistCreation}
        colors={colors}
      />
      <PlaylistOptionsModal
        isVisible={!!selectedPlaylist}
        onClose={handleCloseEditModal}
        onEdit={() => handleEditPlaylist(selectedPlaylist)}
        onDelete={() => handleDeletePlaylist(selectedPlaylist?.id)}
        playlist={selectedPlaylist}
        colors={colors}
      />
      <EditPlaylistModal
        isVisible={isEditPlaylistModalVisible}
        onClose={() => setEditPlaylistModalVisible(false)}
        onEditPlaylist={(updatedPlaylist) => {
          setEditPlaylistModalVisible(false);
          // Additional handling after update if needed
        }}
        playlist={selectedPlaylist}
        colors={colors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
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
  drawerToggleButton: {
    marginRight: 10
  },
  createPlaylistButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 10
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
    paddingTop: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 15,
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  listContainer: {
    padding: 15,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 10
  },
  playlistThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15
  },
  playlistInfo: {
    flex: 1
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  playlistDetails: {
    color: '#666',
    marginTop: 5
  },
  playlistStatus: {
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
    fontSize: 16,
    color: '#666'
  },
  createFirstPlaylistButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15
  },
  createFirstPlaylistButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  playlistContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 10,
  },
  menuOptions: {
    position: 'absolute',
    right: 10,
    top: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEEEEE',
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 14,
  }
});

export default UserPlaylistScreen;