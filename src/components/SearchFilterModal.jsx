import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@react-navigation/native';

const SearchFilterModal = ({
  visible,
  onClose,
  currentFilters,
  onApplyFilters,
  searchType
}) => {
  const { colors } = useTheme();
  // Create a local state to manage filter changes without immediately updating parent state
  const [localFilters, setLocalFilters] = useState(currentFilters);

  // Update local filters when currentFilters changes
  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  // Reset filters to default values
  const handleResetFilters = () => {
    const defaultFilters = {
        genre: null,
        sortBy: 'createdAt',  // Thay đổi thành createdAt
        isPublic: null
    };
    setLocalFilters(defaultFilters);
};

  // Apply filters and close modal
  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const genreOptions = ['Rap']; 

  const sortOptions = searchType === 'songs' 
    ? [
        { value: 'createdAt', label: 'Mới nhất' },
        { value: 'name', label: 'Tên bài hát' },
        { value: 'plays', label: 'Lượt nghe' },
      ]
    : [
        { value: 'createdAt', label: 'Mới nhất' },
        { value: 'name', label: 'Tên playlist' },
        { value: 'songCount', label: 'Số bài hát' },
      ];


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Bộ lọc tìm kiếm</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.iconPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterSection}>
            {/* Genre Filter Section */}
            {searchType === 'songs' && (
              <View style={styles.filterGroup}>
                <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>Thể loại</Text>
                <View style={styles.optionsGrid}>
                  {genreOptions.map((genre) => (
                    <TouchableOpacity
                      key={genre}
                      style={[
                        styles.optionButton,
                        localFilters.genre === genre && styles.selectedOption,
                        { borderColor: colors.border }
                      ]}
                      onPress={() => setLocalFilters(prev => ({
                        ...prev,
                        genre: prev.genre === genre ? null : genre
                      }))}
                    >
                      <Text style={[
                        styles.optionText,
                        { color: localFilters.genre === genre ? '#1DB954' : colors.textPrimary }
                      ]}>
                        {genre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Sort By Section */}
            <View style={styles.filterGroup}>
              <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>Sắp xếp theo</Text>
              <View style={styles.optionsList}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      localFilters.sortBy === option.value && styles.selectedSortOption
                    ]}
                    onPress={() => setLocalFilters(prev => ({
                      ...prev,
                      sortBy: option.value
                    }))}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      { color: localFilters.sortBy === option.value ? '#1DB954' : colors.textPrimary }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Visibility Filter for Playlists */}
            {searchType === 'playlists' && (
              <View style={styles.filterGroup}>
                <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>Hiển thị</Text>
                <View style={styles.optionsList}>
                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      localFilters.isPublic === true && styles.selectedVisibilityOption
                    ]}
                    onPress={() => setLocalFilters(prev => ({
                      ...prev,
                      isPublic: prev.isPublic === true ? null : true
                    }))}
                  >
                    <Text style={[
                      styles.visibilityOptionText,
                      { color: localFilters.isPublic === true ? '#1DB954' : colors.textPrimary }
                    ]}>
                      Công khai
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      localFilters.isPublic === false && styles.selectedVisibilityOption
                    ]}
                    onPress={() => setLocalFilters(prev => ({
                      ...prev,
                      isPublic: prev.isPublic === false ? null : false
                    }))}
                  >
                    <Text style={[
                      styles.visibilityOptionText,
                      { color: localFilters.isPublic === false ? '#1DB954' : colors.textPrimary }
                    ]}>
                      Riêng tư
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.footerButton, styles.resetButton]}
              onPress={handleResetFilters}
            >
              <Text style={styles.resetButtonText}>Đặt lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.applyButton]}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    padding: 5,
  },
  filterSection: {
    paddingHorizontal: 20,
  },
  filterGroup: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 6,
  },
  selectedOption: {
    borderColor: '#1DB954',
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  optionText: {
    fontSize: 14,
  },
  optionsList: {
    flexDirection: 'column',
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedSortOption: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  sortOptionText: {
    fontSize: 16,
  },
  visibilityOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedVisibilityOption: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  visibilityOptionText: {
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: 'transparent',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#666',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#1DB954',
    marginLeft: 10,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SearchFilterModal;