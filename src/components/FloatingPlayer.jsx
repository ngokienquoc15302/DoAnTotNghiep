import { Image, StyleSheet, Text, TouchableOpacity, View, DeviceEventEmitter } from 'react-native'
import React, { useEffect } from 'react'
import { fontFamilies } from '../constants/fonts'
import { fontSize, iconSize, spacing } from '../constants/dimensions'
import { GotoNextButton, GotoPreviousButton, PlayPauseButton } from './PlayerControls'
import { useSharedValue } from 'react-native-reanimated'
import { Slider } from 'react-native-awesome-slider'
import MovingText from './MovingText'
import { useNavigation, useTheme } from '@react-navigation/native'
import TrackPlayer, {
  useProgress,
  State,
  usePlaybackState,
  useTrackPlayerEvents,
  Event
} from 'react-native-track-player'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'

const FloatingPlayer = ({ currentTrack }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { position, duration } = useProgress();
  const playbackState = usePlaybackState();

  const progress = useSharedValue(position);
  const min = useSharedValue(0);
  const max = useSharedValue(duration || 1);

  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackTrackChanged], async (event) => {
    try {
      if (event.type === Event.PlaybackState) {
        console.log('Playback state changed:', event.state);
      }
      if (event.type === Event.PlaybackTrackChanged) {
        const position = await TrackPlayer.getPosition();
        const duration = await TrackPlayer.getDuration();
        progress.value = position;
        max.value = duration || 1;
      }
    } catch (error) {
      console.warn('Error handling track player event:', error);
    }
  });

  useEffect(() => {
    if (position !== undefined && duration !== undefined) {
      progress.value = position;
      max.value = duration || 1;
    }
  }, [position, duration]);

  const handleOpenPlayerScreen = () => {
    navigation.navigate('PLAYER_SCREEN');
  };

  const handleSliderComplete = async (value) => {
    try {
      if (playbackState !== State.None && playbackState !== State.Stopped) {
        await TrackPlayer.seekTo(value);
      }
    } catch (error) {
      console.warn('Error seeking track:', error);
    }
  };

  const handleClearAllTracks = async () => {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.stop();
      DeviceEventEmitter.emit('PLAYLIST_EMPTY');
    } catch (error) {
      console.error("Error clearing tracks:", error);
    }
  };

  if (!currentTrack || playbackState === State.None) return null;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <View style={styles.sliderWrapper}>
        <Slider
          style={styles.sliderContainer}
          progress={progress}
          minimumValue={min}
          maximumValue={max}
          theme={{
            minimumTrackTintColor: colors.minimumTintColor,
            maximumTrackTintColor: colors.maximumTintColor,
            bubbleBackgroundColor: colors.textPrimary,
            thumbStyle: {
              width: 12,
              height: 12,
              borderRadius: 6, // Để tạo hình tròn, set borderRadius bằng 1/2 width/height
            }
          }}
          renderBubble={() => null}
          onSlidingComplete={handleSliderComplete}
          
          enabled={playbackState !== State.None && playbackState !== State.Stopped}
        />
      </View>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: 'transparent' }]}
        activeOpacity={0.9}
        onPress={handleOpenPlayerScreen}
      >
        <Image
          source={{ uri: currentTrack?.artwork }}
          style={styles.coverImage}
        />
        <View style={styles.titleContainer}>
          <MovingText
            text={currentTrack?.title || "Unknown Title"}
            animationThreshold={15}
            style={[styles.title, { color: colors.textPrimary }]}
          />
          <MovingText
            text={currentTrack?.artist || "Unknown Artist"}
            animationThreshold={15}
            style={[styles.artist, { color: colors.textSecondary }]}
          />
          
        </View>
        <View style={styles.playerControlContainer}>
          <GotoPreviousButton size={iconSize.md} />
          <PlayPauseButton size={iconSize.lg} />
          <GotoNextButton size={iconSize.md} />
          <TouchableOpacity
            onPress={handleClearAllTracks}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome6
              name="xmark"
              size={iconSize.md}
              color={colors.iconPrimary}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  sliderWrapper: {
    zIndex: 1,
    paddingTop: spacing.xs,
  },
  sliderContainer: {
    height: 2,
  },
  coverImage: {
    height: 55,
    width: 55,
    borderRadius: 12,
    marginLeft: spacing.md,
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    overflow: 'hidden',
    marginLeft: spacing.sm,
    marginRight: spacing.lg,
  },
  title: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.semibold,
    marginBottom: 4,
  },
  artist: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.regular,
    opacity: 0.8,
  },
  playerControlContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});

export default FloatingPlayer;