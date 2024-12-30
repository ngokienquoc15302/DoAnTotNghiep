import React, { useEffect, useState, useRef } from 'react';
import { FlatList, StyleSheet, View, Text, ScrollView, Image, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Header from '../components/Header';
import SongCardWithCategory from '../components/SongCardWithCategory';
import PlaylistCardWithCategory from '../components/PlaylistCardWithCategory';
import firestore from '@react-native-firebase/firestore';
import { useTheme } from '@react-navigation/native';
import { fontSize, spacing } from '../constants/dimensions';
import { fontFamilies } from '../constants/fonts';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = () => {
  const { colors } = useTheme();
  const [slides, setSlides] = useState([]);
  const [recommendSongs, setRecommendSongs] = useState([]);
  const [newSongs, setNewSongs] = useState([]);
  const [recommendPlaylists, setRecommendPlaylists] = useState([]);
  const [newPlaylists, setNewPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  const slideScrollRef = useRef(null);
  const slideAnimatedValue = useRef(new Animated.Value(0)).current;

  // Auto slide timer
  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => {
        const nextIndex = (currentSlideIndex + 1) % slides.length;
        slideScrollRef.current?.scrollTo({
          x: nextIndex * screenWidth,
          animated: true
        });
        setCurrentSlideIndex(nextIndex);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(timer);
    }
  }, [currentSlideIndex, slides.length]);

  const handlePrevSlide = () => {
    const nextIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    slideScrollRef.current?.scrollTo({
      x: nextIndex * screenWidth,
      animated: true
    });
    setCurrentSlideIndex(nextIndex);
  };

  const handleNextSlide = () => {
    const nextIndex = (currentSlideIndex + 1) % slides.length;
    slideScrollRef.current?.scrollTo({
      x: nextIndex * screenWidth,
      animated: true
    });
    setCurrentSlideIndex(nextIndex);
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    return null;
  };

  const processFirestoreData = (doc, type = 'song') => {
    const data = doc.data();
    const processedData = {
      ...data,
      id: doc.id,
      createdAt: formatTimestamp(data.createdAt),
      updatedAt: formatTimestamp(data.updatedAt)
    };

    if (type === 'song') {
      processedData.releaseDate = formatTimestamp(data.releaseDate);
    }

    if (type === 'playlist') {
      processedData.songCount = data.songs?.length || 0;
      processedData.description = data.description || '';
      processedData.likes = data.likes || 0;
      processedData.tags = data.tags || [];
    }

    return processedData;
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch Songs
        const songsSnapshot = await firestore()
          .collection('songs')
          .get();

        const allSongs = songsSnapshot.docs.map(doc => processFirestoreData(doc, 'song'));
        
        const slidesSongs = allSongs.filter(song => song.imageSlideUrl);
        
        setSlides(slidesSongs);

        // Filter new songs (released within last 2 months)
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        
        const recentSongs = allSongs.filter(song => 
          song.releaseDate && song.releaseDate > twoMonthsAgo
        );
        setNewSongs(recentSongs);

        // Get random recommended songs
        const randomSongs = shuffleArray(allSongs).slice(0, 10);
        setRecommendSongs(randomSongs);

        // Fetch Playlists
        const playlistsSnapshot = await firestore()
          .collection('playlists')
          .where('isSystemGenerated', '==', true)
          .get();

        const allPlaylists = playlistsSnapshot.docs.map(doc => 
          processFirestoreData(doc, 'playlist')
        );

        // Set new playlists (by createdAt)
        const sortedNewPlaylists = [...allPlaylists]
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 10);
        setNewPlaylists(sortedNewPlaylists);

        // Set random recommended playlists
        const randomPlaylists = shuffleArray(allPlaylists).slice(0, 10);
        setRecommendPlaylists(randomPlaylists);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSlideScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: slideAnimatedValue } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
        setCurrentSlideIndex(slideIndex);
      },
    }
  );

  const renderSlideIndicators = () => {
    return (
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * screenWidth,
            index * screenWidth,
            (index + 1) * screenWidth,
          ];

          const width = slideAnimatedValue.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const opacity = slideAnimatedValue.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.indicator,
                {
                  width,
                  opacity,
                  backgroundColor: colors.primary,
                }
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderSection = (title, data, type = 'song') => {
    if (!data || data.length === 0) return null;

    const processedData = {
      title,
      [type === 'song' ? 'songs' : 'playlists']: data
    };

    return type === 'song' ? (
      <SongCardWithCategory item={processedData} />
    ) : (
      <PlaylistCardWithCategory item={processedData} />
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Image Slider */}
        {slides.length > 0 && (
          <View style={styles.sliderContainer}>
            <ScrollView
              ref={slideScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleSlideScroll}
              scrollEventThrottle={16}
            >
              {slides.map((slide, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  style={styles.slideItem}
                >
                  <Image
                    source={{ uri: slide.imageSlideUrl }}
                    style={styles.slideImage}
                    resizeMode="cover"
                  />
                  <View style={styles.gradientOverlay} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>
              <TouchableOpacity 
                style={[styles.navButton, styles.prevButton]} 
                onPress={handlePrevSlide}
              >
                <Text style={styles.navButtonText}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton]} 
                onPress={handleNextSlide}
              >
                <Text style={styles.navButtonText}>›</Text>
              </TouchableOpacity>
            </View>

            {renderSlideIndicators()}
          </View>
        )}

        {/* Other sections */}
        {renderSection('Recommended for You', recommendSongs, 'song')}
        {renderSection('New Songs', newSongs, 'song')}
        {renderSection('Recommended Playlists', recommendPlaylists, 'playlist')}
        {renderSection('New Playlists', newPlaylists, 'playlist')}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 120,
  },
  loadingText: {
    fontSize: fontSize.lg,
    fontFamily: fontFamilies.semibold,
  },
  sliderContainer: {
    height: 200,
    position: 'relative',
    marginBottom: spacing.md,
  },
  slideItem: {
    width: screenWidth,
    height: '100%',
    position: 'relative',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: '40%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  navigationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
});

export default HomeScreen;