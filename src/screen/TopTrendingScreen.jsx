import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

import TrendingHeader from '../components/TrendingHeader';
import TrendingSongItem from '../components/TrendingSongItem';
import TrendingPlaylistItem from '../components/TrendingPlaylistItem';

const TopTrendingScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('songs');
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    genre: null,
    time: null
  });

  // Helper function to get timestamp based on time filter
  const getTimeFilter = (timeFilter) => {
    const now = new Date();
    switch (timeFilter) {
      case 'Today':
        now.setHours(0, 0, 0, 0);
        return now;
      case 'This Week':
        now.setDate(now.getDate() - 7);
        return now;
      case 'This Month':
        now.setMonth(now.getMonth() - 1);
        return now;
      default:
        return null;
    }
  };

  // Fetch songs from Firestore
  const fetchSongs = async (genreFilter = null, timeFilter = null) => {
    try {
      setLoading(true);
      let query = firestore().collection('songs');

      // Apply genre filter if exists
      if (genreFilter) {
        query = query.where('genre', '==', genreFilter);
      }

      // Apply time filter if exists
      const timeConstraint = getTimeFilter(timeFilter);
      if (timeConstraint) {
        query = query.where('releaseDate', '>=', timeConstraint);
        query = query.orderBy('releaseDate', 'desc'); // Thêm dòng này
      }

      // Thay đổi thứ tự này xuống cuối
      query = query.orderBy('plays', 'desc').limit(20);

      const snapshot = await query.get();
      const fetchedSongs = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data()
      }));

      setSongs(fetchedSongs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch playlists from Firestore
  const fetchPlaylists = async (genreFilter = null, timeFilter = null) => {
    try {
      setLoading(true);
      let query = firestore().collection('playlists')
        .where('isSystemGenerated', '==', true);

      if (genreFilter) {
        query = query.where('tags', 'array-contains', genreFilter);
      }

      const timeConstraint = getTimeFilter(timeFilter);
      if (timeConstraint) {
        query = query.where('createdAt', '>=', timeConstraint);
        query = query.orderBy('createdAt', 'desc'); // Thêm dòng này
      }

      query = query.orderBy('likes', 'desc').limit(20);

      const snapshot = await query.get();
      const fetchedPlaylists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPlaylists(fetchedPlaylists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filtering
  const handleFilter = (selectedGenre, selectedTime) => {
    setFilters({
      genre: selectedGenre,
      time: selectedTime
    });

    // Refetch data with filters
    if (activeTab === 'songs') {
      fetchSongs(selectedGenre, selectedTime);
    } else {
      fetchPlaylists(selectedGenre, selectedTime);
    }
  };

  // Initial data fetch effect
  useEffect(() => {
    fetchSongs();
  }, []);

  // Effect to refetch when switching tabs
  useEffect(() => {
    const { genre, time } = filters;
    if (activeTab === 'songs') {
      fetchSongs(genre, time);
    } else {
      fetchPlaylists(genre, time);
    }
  }, [activeTab]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TrendingHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        navigation={navigation}
        onFilter={handleFilter}
        selectedFilters={filters}
      />

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : activeTab === 'songs' ? (
          <>
            {songs.map(song => (
              <TrendingSongItem
                key={song.id}
                song={song}
                textColor={colors.textPrimary}
                secondaryTextColor={colors.textSecondary}
              />
            ))}
          </>
        ) : (
          <>
            {playlists.map(playlist => (
              <TrendingPlaylistItem
                key={playlist.id}
                playlist={playlist}
                textColor={colors.textPrimary}
                secondaryTextColor={colors.textSecondary}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50
  },
  contentContainer: {
    paddingHorizontal: 15
  }
});

export default TopTrendingScreen;