import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    Image, 
    TouchableOpacity, 
    DeviceEventEmitter
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';

import { fontSize, iconSize, spacing } from '../constants/dimensions';
import { fontFamilies } from '../constants/fonts';

const MusicListScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [tracks, setTracks] = useState([]);
    const activeTrack = useActiveTrack();

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const queue = await TrackPlayer.getQueue();
                setTracks(queue);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách bài nhạc:", error);
            }
        };

        fetchTracks();
    }, []);

    const handleRemoveTrack = async (track) => {
        try {
            const queue = await TrackPlayer.getQueue();
            const trackIndex = queue.findIndex(t => t.id === track.id);
            
            if (trackIndex !== -1) {
                if (queue.length === 1) {
                    await TrackPlayer.reset();
                    await TrackPlayer.stop();
                    DeviceEventEmitter.emit('PLAYLIST_EMPTY');
                    navigation.navigate('HOME_SCREEN');
                } else {
                    await TrackPlayer.remove(trackIndex);
                }
                
                const updatedQueue = await TrackPlayer.getQueue();
                setTracks(updatedQueue);
            }
        } catch (error) {
            console.error("Lỗi khi xóa bài hát:", error);
        }
    };

    const handleClearAllTracks = async () => {
        try {
            await TrackPlayer.reset();
            await TrackPlayer.stop();
            setTracks([]);
            DeviceEventEmitter.emit('PLAYLIST_EMPTY');
            navigation.navigate('HOME_SCREEN');
        } catch (error) {
            console.error("Lỗi khi xóa tất cả bài hát:", error);
        }
    };

    const handleGoBack = () => {
        if (tracks.length === 0) {
            navigation.navigate('HOME_SCREEN');
        } else {
            navigation.goBack();
        }
    };
    const handlePlayTrack = async (track) => {
        try {
            const queue = await TrackPlayer.getQueue();
            const trackIndex = queue.findIndex(t => t.id === track.id);
            
            if (trackIndex !== -1) {
                await TrackPlayer.skip(trackIndex);
                await TrackPlayer.play();
            }
        } catch (error) {
            console.error("Lỗi khi phát nhạc:", error);
        }
    };
    const renderTrackItem = ({ item }) => {
        const isActiveTrack = item.id === activeTrack?.id;
        
        return (
            <TouchableOpacity onPress={() => !isActiveTrack && handlePlayTrack(item)}
                style={[
                    styles.trackItem, 
                    { 
                        backgroundColor: colors.itemSong,
                        opacity: isActiveTrack ? 1 : 0.7
                    }
                ]}
            >
                <Image 
                    source={{ uri: item.artwork }} 
                    style={styles.trackImage} 
                />
                <View style={styles.trackInfo}>
                    <Text 
                        style={[
                            styles.trackTitle, 
                            { 
                                color: isActiveTrack 
                                    ? colors.primary 
                                    : colors.textPrimary 
                            }
                        ]}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                    <Text 
                        style={[styles.trackArtist, { color: colors.textSecondary }]}
                        numberOfLines={1}
                    >
                        {item.artist}
                    </Text>
                </View>
                <View style={styles.trackActions}>
                    <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={() => handleRemoveTrack(item)}
                    >
                        <AntDesign
                            name="closecircle"
                            color={colors.iconSecondary}
                            size={iconSize.lg}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={handleGoBack}>
                    <AntDesign
                        name="arrowleft"
                        color={colors.iconPrimary}
                        size={iconSize.md}
                    />
                </TouchableOpacity>
                <Text style={[styles.headerText, { color: colors.textPrimary }]}>
                    Music List
                </Text>
                <TouchableOpacity onPress={handleClearAllTracks}>
                    <AntDesign
                        name="delete"
                        color={colors.iconPrimary}
                        size={iconSize.md}
                    />
                </TouchableOpacity>
            </View>
            
            <FlatList
                data={tracks}
                renderItem={renderTrackItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No tracks in the playlist
                        </Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.lg,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    headerText: {
        fontSize: fontSize.lg,
        fontFamily: fontFamilies.medium,
        flex: 1,
        textAlign: 'center',
    },
    listContainer: {
        paddingBottom: spacing.xl,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        padding: spacing.md,
        borderRadius: 10,
    },
    trackImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: spacing.md,
    },
    trackInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    trackTitle: {
        fontSize: fontSize.md,
        fontFamily: fontFamilies.medium,
    },
    trackArtist: {
        fontSize: fontSize.sm,
    },
    trackActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        marginLeft: spacing.sm,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    emptyText: {
        fontSize: fontSize.lg,
        fontFamily: fontFamilies.medium,
    }
});

export default MusicListScreen;