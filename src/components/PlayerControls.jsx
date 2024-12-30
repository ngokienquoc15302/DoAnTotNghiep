import { TouchableOpacity } from "react-native"
import FontAwesome6 from "react-native-vector-icons/FontAwesome6"
import { iconSize } from "../constants/dimensions"
import TrackPlayer, { usePlaybackState } from "react-native-track-player"
import { useTheme } from "@react-navigation/native"

export const GotoPreviousButton = ({ size = iconSize.lg }) => {
  const { colors } = useTheme();
  const handlePrevious = async () => {
    try {
      const queue = await TrackPlayer.getQueue();
      const currentIndex = await TrackPlayer.getCurrentTrack();

      if (currentIndex > 0) {
        await TrackPlayer.skipToPrevious();
        await TrackPlayer.play();
      }
    } catch (error) {
      console.warn("Could not skip to previous track:", error);
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handlePrevious}>
      <FontAwesome6
        name="backward"
        size={size}
        color={colors.iconPrimary}
      />
    </TouchableOpacity>
  );
};

export const GotoNextButton = ({ size = iconSize.lg }) => {
  const { colors } = useTheme();
  const handleNext = async () => {
    try {
      const queue = await TrackPlayer.getQueue();
      const currentIndex = await TrackPlayer.getCurrentTrack();

      if (currentIndex < queue.length - 1) {
        await TrackPlayer.skipToNext();
        await TrackPlayer.play();
      }
    } catch (error) {
      console.warn("Could not skip to next track:", error);
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handleNext}>
      <FontAwesome6
        name="forward"
        size={size}
        color={colors.iconPrimary}
      />
    </TouchableOpacity>
  );
};

export const PlayPauseButton = ({ size = iconSize.lg }) => {
  const { colors } = useTheme();
  const isPlaying = usePlaybackState();
  const togglePlayback = async () => {
    try {
      if (isPlaying.state === "playing") {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (error) {
      console.warn("Error toggling playback:", error);
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={togglePlayback}>
      <FontAwesome6
        name={isPlaying.state === "playing" ? 'pause' : 'play'}
        size={size} 
        color={colors.iconPrimary}
      />
    </TouchableOpacity>
  );
};