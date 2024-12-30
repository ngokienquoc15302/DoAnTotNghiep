import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal
} from 'react-native';
import { useTheme } from '@react-navigation/native';

const TrendingFilterModal = ({
  visible,
  onClose,
  onApply,
  selectedGenre,
  selectedTime
}) => {
  const { colors } = useTheme();
  const [genre, setGenre] = useState(selectedGenre);
  const [time, setTime] = useState(selectedTime);

  // Update local state when props change
  useEffect(() => {
    setGenre(selectedGenre);
    setTime(selectedTime);
  }, [selectedGenre, selectedTime]);

  const genres = ['Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Rap'];
  const timeRanges = ['Today', 'This Week', 'This Month', 'All Time'];

  const handleReset = () => {
    setGenre(null);
    setTime(null);
    onApply(null, null);
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Filter</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={[styles.resetText, { color: colors.primary }]}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Genre Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.textPrimary }]}>Genre</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {genres.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.filterChip,
                    { 
                      backgroundColor: genre === item 
                        ? colors.primary 
                        : colors.background,
                      borderColor: colors.primary,
                      borderWidth: 1
                    }
                  ]}
                  onPress={() => setGenre(genre === item ? null : item)}
                >
                  <Text 
                    style={[
                      styles.filterChipText, 
                      { 
                        color: genre === item 
                          ? colors.background 
                          : colors.primary 
                      }
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Time Range Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.textPrimary }]}>Time Range</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {timeRanges.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.filterChip,
                    { 
                      backgroundColor: time === item 
                        ? colors.primary 
                        : colors.background,
                      borderColor: colors.primary,
                      borderWidth: 1
                    }
                  ]}
                  onPress={() => setTime(time === item ? null : item)}
                >
                  <Text 
                    style={[
                      styles.filterChipText, 
                      { 
                        color: time === item 
                          ? colors.background 
                          : colors.primary 
                      }
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, { 
                backgroundColor: colors.background,
                borderColor: colors.primary,
                borderWidth: 1
              }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={() => onApply(genre, time)}
            >
              <Text style={[styles.modalButtonText, { color: colors.background }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  resetText: {
    fontSize: 16
  },
  filterSection: {
    marginBottom: 20
  },
  filterSectionTitle: {
    fontSize: 16,
    marginBottom: 10
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 20
  },
  filterChipText: {
    fontSize: 14
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  modalButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 10
  },
  modalButtonText: {
    fontWeight: 'bold'
  }
});

export default TrendingFilterModal;