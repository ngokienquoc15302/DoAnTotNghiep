import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

const PlaylistSelectionModal = ({ 
  visible, 
  onClose, 
  playlists, 
  onSelectPlaylist 
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            Select Playlist
          </Text>
          <ScrollView>
            {playlists.map((playlist) => (
              <TouchableOpacity
                key={playlist.id}
                style={[styles.playlistItem, { borderBottomColor: colors.textSecondary + '20' }]}
                onPress={() => onSelectPlaylist(playlist.id)}
              >
                <Text style={[styles.playlistTitle, { color: colors.textPrimary }]}>
                  {playlist.title}
                </Text>
                {playlist.description && (
                  <Text style={[styles.playlistDescription, { color: colors.textSecondary }]}>
                    {playlist.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: colors.textPrimary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
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
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  playlistItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  playlistTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  playlistDescription: {
    fontSize: 12,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
  },
});

export default PlaylistSelectionModal;