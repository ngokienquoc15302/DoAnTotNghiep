import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fontFamilies } from '../constants/fonts';
import { fontSize, spacing } from '../constants/dimensions';
import { useNavigation, useTheme } from '@react-navigation/native';

const SongCard = ({ item, containerStyle, imageStyle }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  // Convert timestamp to date string
  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleDateString();
    }
    return 'Undefined';
  };
  
  // Process fields that might be timestamps
  const processedItem = {
    ...item,
    releaseDate: formatTimestamp(item?.releaseDate),
    createdAt: formatTimestamp(item?.createdAt),
    updatedAt: formatTimestamp(item?.updatedAt)
  };

  return (
    <TouchableOpacity 
      style={[styles.container, containerStyle]} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('MUSIC_DETAIL_SCREEN', { song: processedItem })}
    >
      <View style={[styles.imageWrapper, {
        shadowColor: colors.shadow,
        backgroundColor: colors.surface,
      }]}>
        <Image 
          source={
            item?.imageUrl 
              ? { uri: item.imageUrl }
              : require('../../assets/image/logo-music.png')
          } 
          style={[styles.coverImage, imageStyle]} 
          resizeMode="cover"
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
        />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
        {item?.title || 'No title'}
      </Text>
      <Text style={[styles.artist, { color: colors.textSecondary }]}>
        {item?.artist || 'Unknown artist'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
  },
  imageWrapper: {
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  coverImage: {
    width: 180,
    height: 180,
    borderRadius: 16,
  },
  title: {
    fontFamily: fontFamilies.semibold,
    fontSize: fontSize.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  artist: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.regular,
  }
});

export default SongCard;