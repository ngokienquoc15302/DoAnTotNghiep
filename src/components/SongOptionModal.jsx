import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const SongOptionsModal = ({
  isVisible,
  onClose,
  song,
  isLiked,
  onAddToPlaylist,
  onAddToLiked,
  onAddToPlayTrack,
  onClickSongInfo,
  onDeleteFromPlaylist,
  isSystemGenerated = false
}) => {
  const { colors } = useTheme();

  const options = [
    {
      icon: 'list-outline',
      text: 'Add to playlist', 
      onPress: () => {
        onAddToPlaylist(song);
        onClose();
      }
    },
    {
      icon: isLiked ? 'heart' : 'heart-outline',
      text: isLiked ? 'Remove from favorites' : 'Add to favorites', 
      onPress: () => {
        onAddToLiked(song);
        onClose();
      }
    },
    {
      icon: 'add-circle-outline',
      text: 'Add to queue',
      onPress: () => {
        onAddToPlayTrack(song);
        onClose();
      }
    },
    {
      icon: 'information-circle-outline',
      text: 'Song information', 
      onPress: () => {
        onClickSongInfo(song);
        onClose();
      }
    },
    ...(!isSystemGenerated ? [{
      icon: 'trash-outline',
      text: 'Remove from playlist',
      onPress: () => {
        onDeleteFromPlaylist(song);
        onClose();
      },
      color: '#FF5722'
    }] : [])
  ];


  return (
    <Modal
      transparent={true}
      visible={isVisible}

      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
              {/* Song Info Header */}
              <View style={[styles.songHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.songTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {song?.title || 'Song options'}
                </Text>
                <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>
                  {song?.artist || ''}
                </Text>
              </View>

              {/* Options List */}
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionRow}
                  onPress={option.onPress}
                >
                  <Icon
                    name={option.icon}
                    size={24}
                    color={option.color || colors.iconPrimary}
                    style={styles.optionIcon}
                  />
                  <Text style={[
                    styles.optionText, 
                    {color: option.color || colors.textPrimary }
                    ]}>{option.text}</Text>
                </TouchableOpacity>
              ))}

              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.cancelButton, { borderTopColor: colors.border }]}
                onPress={onClose}
              >
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20
  },
  songHeader: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  songArtist: {
    fontSize: 14
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20
  },
  optionIcon: {
    marginRight: 15
  },
  optionText: {
    fontSize: 16
  },
  cancelButton: {
    paddingVertical: 15,
    alignItems: 'center',
    borderTopWidth: 1
  },
  cancelText: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default SongOptionsModal;