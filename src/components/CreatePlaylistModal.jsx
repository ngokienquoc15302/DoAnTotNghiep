import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Switch
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import ImagePicker from 'react-native-image-crop-picker';

const CreatePlaylistModal = ({
  isVisible,
  onClose,
  onCreatePlaylist,
  colors
}) => {
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCreatePlaylist = async () => {
    try {
      const currentUser = auth().currentUser;
      const newPlaylistRef = firestore().collection('playlists').doc();

      // Split tags and trim whitespace
      const playlistTags = tags
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      await newPlaylistRef.set({
        title: playlistTitle || 'New Playlist',
        description: playlistDescription,
        userId: currentUser.uid,
        isPublic: isPublic,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        songs: [],
        tags: playlistTags,
        likes: 0,
        imageUrl: selectedImage || ''
      });

      const newPlaylist = {
        id: newPlaylistRef.id,
        title: playlistTitle || 'New Playlist',
        description: playlistDescription,
        userId: currentUser.uid,
        isPublic: isPublic,
        createdAt: null,
        updatedAt: null,
        formattedCreatedAt: 'Undefined',
        formattedUpdatedAt: 'Undefined',
        songs: [],
        tags: playlistTags,
        likes: 0,
        imageUrl: selectedImage || ''
      };

      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          playlists: firestore.FieldValue.arrayUnion(newPlaylistRef.id)
        });
      setSelectedImage(null);
      setPlaylistTitle('');
      setPlaylistDescription('');
      setIsPublic(false);
      setTags('');

      onCreatePlaylist(newPlaylist);
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true
      });
      setSelectedImage(image.path);
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[
          styles.modalContent,
          {
            backgroundColor: colors.background === '#091227'
              ? '#1A2240'
              : 'white'
          }
        ]}>
          <Text style={[
            styles.modalTitle,
            { color: colors.textPrimary }
          ]}>
            Create New Playlist
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                backgroundColor: colors.background === '#091227'
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.05)'
              }
            ]}
            placeholderTextColor={colors.textSecondary}
            placeholder="Playlist name"
            value={playlistTitle}
            onChangeText={setPlaylistTitle}
          />

          <TextInput
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                backgroundColor: colors.background === '#091227'
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.05)'
              }
            ]}
            placeholderTextColor={colors.textSecondary}
            placeholder="Description (optional)"
            value={playlistDescription}
            onChangeText={setPlaylistDescription}
            multiline
          />

          <TextInput
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                backgroundColor: colors.background === '#091227'
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.05)'
              }
            ]}
            placeholderTextColor={colors.textSecondary}
            placeholder="Tags (separated by commas)"
            value={tags}
            onChangeText={setTags}
          />

          <View style={styles.imagePickerContainer}>
            <TouchableOpacity
              style={[
                styles.imagePickerButton,
                {
                  backgroundColor: colors.background === '#091227'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.05)'
                }
              ]}
              onPress={handleImagePick}
            >
              <Text style={{ color: colors.textPrimary }}>
                {selectedImage ? 'Change Image' : 'Add Playlist Image'}
              </Text>
            </TouchableOpacity>
            {selectedImage && (
              <Text style={{ color: colors.textSecondary, marginTop: 5 }}>
                Image selected
              </Text>
            )}
          </View>

          <View style={styles.switchContainer}>
            <Text style={{ color: colors.textPrimary }}>Public</Text>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{
                false: colors.background === '#091227' ? '#2C3352' : '#E0E0E0',
                true: '#1DB954'
              }}
              thumbColor={isPublic ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreatePlaylist}
            >
              <Text style={styles.createButtonText}>Create Playlist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  input: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 15
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  imagePickerContainer: {
    marginBottom: 15,
  },
  imagePickerButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 10
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#333'
  },
  createButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#1DB954',
    borderRadius: 10
  },
  createButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold'
  }
});

export default CreatePlaylistModal;