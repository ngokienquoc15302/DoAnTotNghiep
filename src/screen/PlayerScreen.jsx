import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Feather from 'react-native-vector-icons/Feather'
import { fontSize, iconSize, spacing } from '../constants/dimensions'
import { fontFamilies } from '../constants/fonts'
import PlayerRepeatToggle from '../components/PlayerRepeatToggle'
import PlayerShuffleToggle from '../components/PlayerShuffleToggle'
import PlayerProgessBar from '../components/PlayerProgessBar'
import { GotoNextButton, GotoPreviousButton, PlayPauseButton } from '../components/PlayerControls'
import TrackPlayer, { useActiveTrack } from 'react-native-track-player'
import { useNavigation, useTheme } from '@react-navigation/native'
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';


const PlayerScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const activeTrack = useActiveTrack();
    const [isMute, setIsMute] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        setVolume();
    }, []);

    useEffect(() => {
        const checkIfSongIsLiked = async () => {
            if (activeTrack && auth().currentUser) {
                const userDoc = await firestore()
                    .collection('users')
                    .doc(auth().currentUser.uid)
                    .get();

                const userData = userDoc.data();
                setIsLiked(userData.likedSongs.includes(activeTrack.id));
            }
        };

        checkIfSongIsLiked();
    }, [activeTrack]);
    const scrollY = useSharedValue(0);

    const animatedImageStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: interpolate(
                        scrollY.value,
                        [0, 200],
                        [1, 0.8],
                        Extrapolate.CLAMP
                    )
                }
            ]
        };
    });
    const handleAddToLiked = async () => {
        try {
            if (!auth().currentUser) {
                return;
            }

            const userRef = firestore()
                .collection('users')
                .doc(auth().currentUser.uid);

            if (isLiked) {
                // Xóa khỏi likedSongs
                await userRef.update({
                    likedSongs: firestore.FieldValue.arrayRemove(activeTrack.id)
                });
                setIsLiked(false);
            } else {
                // Thêm vào likedSongs
                await userRef.update({
                    likedSongs: firestore.FieldValue.arrayUnion(activeTrack.id)
                });
                setIsLiked(true);
            }
        } catch (error) {
            console.error('Lỗi khi thêm/xóa bài hát khỏi danh sách yêu thích:', error);
        }
    };

    const setVolume = async () => {
        await TrackPlayer.setVolume(1);
        const volume = await TrackPlayer.getVolume();
        setIsMute(volume === 0 ? true : false);
    }

    const handleGoBack = () => {
        navigation.goBack();
    };
    const handlePlayerListScreen = () => {
        navigation.navigate('PLAYER_LIST_SCREEN');
    }
    const handleToggleVolume = () => {
        TrackPlayer.setVolume(isMute ? 1 : 0);
        setIsMute(!isMute);
    }
    if (!activeTrack) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: colors.background,
                }}
            >
                <ActivityIndicator size={"large"} color={colors.iconPrimary} />
            </View>
        );
    }
    return (
        <Animated.ScrollView
            onScroll={(event) => {
                scrollY.value = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
        >
            <View style={[styles.container, { backgroundColor: colors.background, }]}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={handleGoBack}>
                        <AntDesign
                            name={"arrowleft"}
                            color={colors.iconPrimary}
                            size={iconSize.md}
                        />
                    </TouchableOpacity>
                    <Text style={[styles.headerText, { color: colors.textPrimary, }]}>Playing Now</Text>
                    <TouchableOpacity onPress={handlePlayerListScreen}>
                        <AntDesign
                            name={"bars"}
                            color={colors.iconPrimary}
                            size={iconSize.md}
                        />
                    </TouchableOpacity>
                </View>
                <Animated.View style={[styles.coverImageContainer, animatedImageStyle]}>
                    <Image
                        source={{ uri: activeTrack.artwork }}
                        style={styles.coverImage}
                    />
                </Animated.View>
                <View style={styles.titleRowHeartContainer}>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: colors.textPrimary, }]}>{activeTrack.title}</Text>
                        <Text style={[styles.artist, { color: colors.textSecondary, }]}>{activeTrack.artist}</Text>
                    </View>
                    <TouchableOpacity onPress={handleAddToLiked}>
                        <AntDesign
                            name={isLiked ? "heart" : "hearto"}
                            color={colors.iconSecondary}
                            size={iconSize.md}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.playerControlContainer}>
                    <TouchableOpacity style={styles.volumeWrapper} onPress={handleToggleVolume}>
                        <Feather
                            name={isMute ? "volume-x" : "volume-1"}
                            color={colors.iconSecondary}
                            size={iconSize.lg}
                        />
                    </TouchableOpacity>
                    <View style={styles.repeatShuffleToggle}>
                        <PlayerRepeatToggle />
                        <PlayerShuffleToggle />
                    </View>
                </View>
                <PlayerProgessBar />
                <View style={styles.playPauseContainer}>
                    <GotoPreviousButton size={iconSize.xl} />
                    <PlayPauseButton size={iconSize.xl} />
                    <GotoNextButton size={iconSize.xl} />
                </View>
            </View>
        </Animated.ScrollView>
    )
}

export default PlayerScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.lg,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    headerText: {
        fontSize: fontSize.lg,
        fontFamily: fontFamilies.medium,
        flex: 1,
        textAlign: 'center',
    },
    coverImageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: spacing.xl,
    },
    coverImage: {
        height: 300,
        width: 300,
        borderRadius: 10,
    },
    title: {
        fontSize: fontSize.lg,
        fontFamily: fontFamilies.medium,
    },
    artist: {
        fontSize: fontSize.md,
    },
    titleRowHeartContainer: {
        flexDirection: 'row',
        alignItems: 'center',

    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playerControlContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    volumeWrapper: {
        flex: 1,
    },
    repeatShuffleToggle: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    playPauseContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.xl,
        marginTop: spacing.lg,
    }
})