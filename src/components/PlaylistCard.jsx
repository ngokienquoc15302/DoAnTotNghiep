import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { fontFamilies } from '../constants/fonts';
import { fontSize, spacing } from '../constants/dimensions';
import { useNavigation, useTheme } from '@react-navigation/native';

const PlaylistCard = ({item, containerStyle, imageStyle}) => {
  const navigation = useNavigation();
  const {colors} = useTheme();
  
  // Convert timestamp
  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleDateString();
    }
    return 'Undefined';
  };
  
  // Process playlist data
  const processedItem = {
    ...item,
    createdAt: formatTimestamp(item?.createdAt),
    updatedAt: formatTimestamp(item?.updatedAt)
  };

  return (
    <TouchableOpacity 
      style={[styles.container, containerStyle]} 
      activeOpacity={0.7}
      onPress={() => { navigation.navigate('PLAYLIST_DETAIL_SCREEN', { playlist: processedItem }) }}
    >
      <View style={[styles.imageWrapper, {
        shadowColor: colors.shadow,
        backgroundColor: colors.surface,
      }]}>
        <Image 
          source={
            item?.imageUrl 
            ? {uri: item.imageUrl }
            : require ('../../assets/image/default-playlist.png')
          } 
          style={[styles.coverImage, imageStyle]} 
          resizeMode="cover"
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
        />
      </View>
      <Text style={[styles.title, {color: colors.textPrimary}]} numberOfLines={1}>
        {item?.title || 'No title'}
      </Text>
      <Text style={[styles.info, {color: colors.textSecondary}]}>
        {item?.songs?.length ? `${item.songs.length} songs` : 'No songs'}
      </Text>
    </TouchableOpacity>
  )
}

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
  info: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.regular,
  }
});

export default PlaylistCard;