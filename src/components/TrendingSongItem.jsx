import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useTheme } from '@react-navigation/native';

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const convertToMilliseconds = (timestamp) => {
  return timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000);
};


const formatDate = (timestamp) => {
  // Chuyển đổi timestamp từ { seconds, nanoseconds } sang milliseconds
  const msTimestamp = timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000);
  
  const date = new Date(msTimestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};


const TrendingSongItem = ({ song }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.songItem, { backgroundColor: colors.itemSong }]}
      onPress={() => navigation.navigate('MUSIC_DETAIL_SCREEN', { song: song })}
      activeOpacity={0.7}
    >
      <View style={styles.songRank}>
        <Text style={[styles.rankText, { color: colors.textPrimary }]}>
          {song.rank || '-'}
        </Text>
      </View>

      <Image
        source={{ uri: song.imageUrl }}
        style={styles.albumImage}
        resizeMode="cover"
      />

      <View style={styles.songInfo}>
        <Text 
          style={[styles.songTitle, { color: colors.textPrimary }]} 
          numberOfLines={1}
        >
          {song.title}
        </Text>
        <Text 
          style={[styles.songArtist, { color: colors.textSecondary }]} 
          numberOfLines={1}
        >
          {song.artist}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={[styles.releaseDate, { color: colors.textSecondary }]}>
          {formatDate(song.releaseDate)}
        </Text>
        <View style={styles.stats}>
          <Icon name="heart" size={12} color={colors.textSecondary} />
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            {formatNumber(song.likes)}
          </Text>
          <Text style={[styles.separator, { color: colors.textSecondary }]}>|</Text>
          <Icon name="play" size={12} color={colors.textSecondary} />
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            {formatNumber(song.plays)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
  },
  songRank: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  albumImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15
  },
  songInfo: {
    flex: 1,
    marginRight: 10
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  songArtist: {
    fontSize: 14,
    opacity: 0.8
  },
  statsContainer: {
    alignItems: 'flex-end',
    minWidth: 80
  },
  releaseDate: {
    fontSize: 12,
    marginBottom: 4
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statsText: {
    fontSize: 12,
    marginLeft: 4,
    marginRight: 8
  },
  separator: {
    fontSize: 12, // Kích thước phù hợp
    textAlignVertical: 'center', // Canh giữa theo chiều dọc
    marginRight: 8,
  },
});

export default TrendingSongItem;