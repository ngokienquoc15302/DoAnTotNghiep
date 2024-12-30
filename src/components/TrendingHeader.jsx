import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { iconSize } from '../constants/dimensions';
import TrendingFilterModal from './TrendingFilterModal';
import { useTheme } from '@react-navigation/native';

const TrendingHeader = ({
  activeTab,
  onTabChange,
  navigation,
  onFilter
}) => {
  const { colors } = useTheme();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const handleApplyFilter = (genre, country, time) => {
    setSelectedGenre(genre);
    setSelectedCountry(country);
    setSelectedTime(time);
    setFilterModalVisible(false);
    onFilter(genre, country, time);
  };

  return (
    <View>
      <View style={[styles.headerContainer, { 
        backgroundColor: colors.background, 
        borderBottomColor: colors.maximumTintColor 
      }]}>
        <View >
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.toggleDrawer()}
          >
            <FontAwesome5
              name="grip-lines"
              color={colors.iconPrimary}
              size={iconSize.md}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Top trending</Text>
        </View>
        
      </View>

      <View style={[styles.tabContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'songs' && [styles.activeTab, { borderBottomColor: colors.iconPrimary }]
          ]}
          onPress={() => onTabChange('songs')}
        >
          <Text style={[styles.tabText, { color: colors.textPrimary }]}>Top Songs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'playlists' && [styles.activeTab, { borderBottomColor: colors.iconPrimary }]
          ]}
          onPress={() => onTabChange('playlists')}
        >
          <Text style={[styles.tabText, { color: colors.textPrimary }]}>Top Playlists</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Icon 
            name="filter" 
            size={20} 
            color={colors.iconPrimary} 
          />
        </TouchableOpacity>
      </View>

      <TrendingFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilter}
        selectedGenre={selectedGenre}
        selectedTime={selectedTime}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconButton: {
    padding: 10
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  activeTab: {
    borderBottomWidth: 2
  },
  tabText: {
    fontWeight: 'bold'
  },
  filterButton: {
    padding: 10
  }
});

export default TrendingHeader;