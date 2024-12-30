import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  StyleSheet 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const PlaylistOptionsModal = ({ 
  isVisible, 
  onClose, 
  onEdit, 
  onDelete, 
  playlist,
  colors 
}) => {
  const options = [
    {
      icon: 'create-outline',
      text: 'Edit playlist',
      onPress: () => {
        onEdit();
      }
    },
    {
      icon: 'trash-outline',
      text: 'Delete playlist',
      onPress: () => {
        onDelete();
        onClose();
      },
      color: '#FF5722' // Red color for delete option
    }
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
              {/* Playlist Info Header */}
              <View style={[styles.playlistHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.playlistTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {playlist?.title || 'Playlist Options'}
                </Text>
                <Text style={[styles.playlistInfo, { color: colors.textSecondary }]} numberOfLines={1}>
                  {`${playlist?.songs?.length || 0} songs`}
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
                    { color: option.color || colors.textPrimary }
                  ]}>
                    {option.text}
                  </Text>
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
  playlistHeader: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1
  },
  playlistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  playlistInfo: {
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
    borderTopWidth: 1,
    marginTop: 5
  },
  cancelText: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default PlaylistOptionsModal;