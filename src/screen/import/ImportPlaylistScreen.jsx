import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, FlatList, Text, TouchableOpacity, Alert, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import predefinedPlaylists from '../../data/playlists';

const ImportPlaylistScreen = () => {
    const [playlistName, setPlaylistName] = useState('');
    const [playlists, setPlaylists] = useState([]);
    const [currentPlaylist, setCurrentPlaylist] = useState(null);

    const createPlaylist = async () => {
        if (playlistName.trim() !== '') {
            try {
                await firestore().collection('playlists').add({
                    title: playlistName,
                    description: '',
                    imageUrl: '',
                    isPublic: true,
                    isSystemGenerated: false,
                    likes: 0,
                    tags: [],
                    songs: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    userId: '' // You might want to add the current user's ID
                });
                setPlaylistName('');
                await fetchPlaylists();
            } catch (error) {
                console.log('Error creating playlist:', error);
                Alert.alert('Error', 'Failed to create playlist');
            }
        }
    };

    const addPredefinedPlaylists = async () => {
        try {
            // Batch write to improve performance
            const batch = firestore().batch();

            predefinedPlaylists.forEach((playlist) => {
                const playlistRef = firestore().collection('playlists').doc();
                batch.set(playlistRef, {
                    ...playlist
                });
            });

            await batch.commit();

            // Fetch playlists after adding
            await fetchPlaylists();

            Alert.alert(
                'Success',
                `${predefinedPlaylists.length} predefined playlists added successfully!`
            );
        } catch (error) {
            console.log('Error adding predefined playlists:', error);
            Alert.alert('Error', 'Failed to add predefined playlists');
        }
    };

    const fetchPlaylists = async () => {
        try {
            const snapshot = await firestore().collection('playlists').get();
            const playlistData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPlaylists(playlistData);
        } catch (error) {
            console.log('Error fetching playlists:', error);
            Alert.alert('Error', 'Failed to fetch playlists');
        }
    };

    const loadPlaylist = (playlist) => {
        setCurrentPlaylist(playlist);
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter playlist name"
                    value={playlistName}
                    onChangeText={setPlaylistName}
                />
                <Button title="Create Playlist" onPress={createPlaylist} />
            </View>

            <Button
                title="Add Predefined Playlists"
                onPress={addPredefinedPlaylists}
            />

            <FlatList
                data={playlists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => loadPlaylist(item)}>
                        <View style={styles.playlistItem}>
                            <Image 
                                source={{ uri: item.imageUrl }} 
                                style={styles.playlistImage} 
                            />
                            <View style={styles.playlistTextContainer}>
                                <Text style={styles.playlistTitle}>{item.title}</Text>
                                <Text style={styles.playlistDetails}>
                                    {item.songs.length} songs | {item.likes} likes
                                </Text>
                                <Text style={styles.playlistDescription} numberOfLines={2}>
                                    {item.description}
                                </Text>
                                <View style={styles.tagContainer}>
                                    {item.tags.map((tag, index) => (
                                        <Text key={index} style={styles.tag}>
                                            {tag}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
            {currentPlaylist && (
                <View style={styles.playlistDetailsModal}>
                    <Text style={styles.playlistTitle}>{currentPlaylist.title}</Text>
                    <Image 
                        source={{ uri: currentPlaylist.imageUrl }} 
                        style={styles.fullPlaylistImage}
                    />
                    <Text style={styles.playlistDescription}>
                        {currentPlaylist.description}
                    </Text>
                    <View style={styles.playlistMetaContainer}>
                        <Text>Likes: {currentPlaylist.likes}</Text>
                        <Text>System Generated: {currentPlaylist.isSystemGenerated ? 'Yes' : 'No'}</Text>
                    </View>
                    <Text style={styles.songsTitle}>Songs:</Text>
                    <FlatList
                        data={currentPlaylist.songs}
                        keyExtractor={(item, index) => item + index}
                        renderItem={({ item }) => (
                            <View style={styles.songItem}>
                                <Text style={styles.songTitle}>{item}</Text>
                            </View>
                        )}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginRight: 10,
    },
    playlistItem: {
        flexDirection: 'row',
        backgroundColor: '#f2f2f2',
        padding: 15,
        marginVertical: 5,
        borderRadius: 10,
        alignItems: 'center',
    },
    playlistImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
    },
    playlistTextContainer: {
        flex: 1,
    },
    playlistTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    playlistDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    playlistDescription: {
        fontSize: 14,
        color: '#888',
        marginBottom: 5,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 5,
        marginBottom: 5,
        fontSize: 12,
    },
    playlistDetailsModal: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
    },
    fullPlaylistImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginVertical: 10,
    },
    playlistMetaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    songsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    songItem: {
        backgroundColor: '#f2f2f2',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
    },
    songTitle: {
        fontSize: 16,
    },
});

export default ImportPlaylistScreen;