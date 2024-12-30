import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    Text,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SongCard from '../components/SongCard';
import { spacing } from '../constants/dimensions';

const SearchScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allSongs, setAllSongs] = useState([]);
    const [allPlaylists, setAllPlaylists] = useState([]);
    const [searchType, setSearchType] = useState('songs');
    const [isSearchPerformed, setIsSearchPerformed] = useState(false);

    // Load initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Get songs
                const songsSnapshot = await firestore().collection('songs').get();
                const songs = songsSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                }));
                setAllSongs(songs);

                // Get playlists
                const playlistsSnapshot = await firestore().collection('playlists').get();
                const playlists = playlistsSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                }));
                setAllPlaylists(playlists);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        fetchInitialData();
    }, []);

    // Search function
    const performSearch = () => {
        const lowercaseQuery = searchQuery.toLowerCase();
        let results = [];
    
        if (searchType === 'songs') {
            results = allSongs.filter(item => 
                item.title.toLowerCase().includes(lowercaseQuery) ||
                item.artist.toLowerCase().includes(lowercaseQuery)
            );
        } else {
            // Search playlists with condition isPublic = true or isSystemGenerated = true
            results = allPlaylists.filter(item => 
                item.title.toLowerCase().includes(lowercaseQuery) &&
                [item.isPublic === true || item.isSystemGenerated === true]
            );
        }
    
        setSearchResults(results);
        setIsSearchPerformed(true);
    };

    const handleSearchChange = (text) => {
        setSearchQuery(text);
        if (text === '') {
            setSearchResults([]);
            setIsSearchPerformed(false);
        }
    };

    const handleSearchTypeChange = (type) => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchPerformed(false);
        setSearchType(type);
    };

    const renderSearchResult = ({ item }) => {
        if (searchType === 'songs') {
            return (
                <TouchableOpacity onPress={() => navigation.navigate('SONG_DETAIL_SCREEN', { song: item })}>
                    <SongCard item={item} />
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={[styles.playlistItem, { backgroundColor: colors.itemSong }]}
                onPress={() => navigation.navigate('PLAYLIST_DETAIL_SCREEN', { playlist: item })}
            >
                <View style={styles.playlistContent}>
                    <Text style={[styles.playlistTitle, { color: colors.textPrimary }]}>
                        {item.title}
                    </Text>
                    <View style={styles.playlistDetails}>
                        <Text style={{ color: colors.textSecondary }}>
                            {item.songs?.length || 0} songs
                        </Text>
                        <Text style={[styles.playlistStatus, { color: '#4CAF50' }]}>
                            {item.isSystemGenerated ? 'System Playlist' : 'Public'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border, }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={colors.iconPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    Search
                </Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={[
                    styles.searchInputContainer,
                    { backgroundColor: colors.background === '#091227' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}>
                    <Icon name="search" size={20} color={colors.iconSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        placeholder="Search songs, playlists..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                    />
                </View>
                <TouchableOpacity
                    style={[
                        styles.searchButton,
                        {
                            backgroundColor: searchQuery ? '#1DB954' :
                                (colors.background === '#091227' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                        }
                    ]}
                    onPress={performSearch}
                    disabled={!searchQuery}
                >
                    <Icon
                        name="search"
                        size={24}
                        color={searchQuery ? 'white' : colors.iconSecondary}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.searchTypeContainer}>
                <TouchableOpacity
                    style={[
                        styles.searchTypeButton,
                        searchType === 'songs' && styles.activeSearchType
                    ]}
                    onPress={() => handleSearchTypeChange('songs')}
                >
                    <Text style={[
                        styles.searchTypeText,
                        searchType === 'songs' && styles.activeSearchTypeText
                    ]}>
                        Songs
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.searchTypeButton,
                        searchType === 'playlists' && styles.activeSearchType
                    ]}
                    onPress={() => handleSearchTypeChange('playlists')}
                >
                    <Text style={[
                        styles.searchTypeText,
                        searchType === 'playlists' && styles.activeSearchTypeText
                    ]}>
                        Playlists
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: colors.textSecondary }}>
                            {isSearchPerformed
                                ? 'No results found'
                                : 'Enter text and press search'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        position: 'relative',
        borderBottomWidth: 0.5,
    },
    backButton: {
        position: 'absolute',
        left: 16,
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginVertical: 16,
    },
    searchButton: {
        marginRight: 12,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 10,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginRight: 12,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
    },
    searchTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    searchTypeButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 10,
        borderRadius: 20,
    },
    activeSearchType: {
        backgroundColor: '#1DB954',
    },
    searchTypeText: {
        color: '#666',
    },
    activeSearchTypeText: {
        color: 'white',
        fontWeight: 'bold',
    },
    listContainer: {
        paddingHorizontal: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    playlistItem: {
        marginBottom: 12,
        borderRadius: 10,
        padding: 15,
    },
    playlistContent: {
        flexDirection: 'column',
    },
    playlistTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    playlistDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    playlistStatus: {
        fontSize: 12,
    }
});

export default SearchScreen;