import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Switch,
    Image,
    Alert
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import ImagePicker from 'react-native-image-crop-picker';

const EditPlaylistModal = ({
    isVisible,
    onClose,
    onEditPlaylist,
    playlist,  // Provide default empty object
    colors
}) => {
    const [playlistTitle, setPlaylistTitle] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [tags, setTags] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    // Initialize form data when playlist changes
    useEffect(() => {
        if (playlist) {
            setPlaylistTitle(playlist.title || '');
            setPlaylistDescription(playlist.description || '');
            setIsPublic(playlist.isPublic || false);
            setTags(playlist.tags?.join(', ') || '');
            setSelectedImage(playlist.imageUrl || null);
        }
    }, [playlist]);

    const handleClose = () => {
        setPlaylistTitle('');
        setPlaylistDescription('');
        setIsPublic(false);
        setTags('');
        setSelectedImage(null);
        onClose();
    };

    const handleEditPlaylist = async () => {
        try {
            const currentUser = auth().currentUser;
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const playlistRef = firestore().collection('playlists').doc(playlist.id);

            const playlistTags = tags
                ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                : [];

            const updateData = {
                title: playlistTitle || 'New Playlist',
                description: playlistDescription || '',
                isPublic: isPublic,
                updatedAt: firestore.FieldValue.serverTimestamp(),
                tags: playlistTags,
                imageUrl: selectedImage || '',
                updatedBy: currentUser.uid
            };

            await playlistRef.update(updateData);

            const updatedPlaylist = {
                ...playlist,
                ...updateData,
                updatedAt: null, // Will be set by server
                formattedUpdatedAt: 'Just updated'
            };

            // Clear form
            setSelectedImage(null);
            setPlaylistTitle('');
            setPlaylistDescription('');
            setIsPublic(false);
            setTags('');

            onEditPlaylist(updatedPlaylist);
        } catch (error) {
            console.error('Error editing playlist:', error);
            Alert.alert(
                'Error',
                'Failed to update playlist. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleImagePick = async () => {
        try {
            const image = await ImagePicker.openPicker({
                width: 300,
                height: 300,
                cropping: true,
                includeBase64: true
            });
            
            // Create complete base64 string with data URI scheme
            const base64Image = `data:${image.mime};base64,${image.data}`;
            setSelectedImage(base64Image);
            
        } catch (error) {
            if (error.code !== 'E_PICKER_CANCELLED') { // Don't show alert if user just cancelled
                console.log('Image picker error:', error);
                Alert.alert(
                    'Error',
                    'Failed to select image. Please try again.',
                    [{ text: 'OK' }]
                );
            }
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={handleClose}
        >
            <View style={styles.modalContainer}>
                <View style={[
                    styles.modalContent,
                    {
                        backgroundColor: colors.background === '#091227'
                            ? '#1A2240'
                            : 'white'
                    }
                ]}>
                    <Text style={[
                        styles.modalTitle,
                        { color: colors.textPrimary }
                    ]}>
                        Edit Playlist
                    </Text>

                    {selectedImage && (
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.previewImage}
                        />
                    )}

                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: colors.textPrimary,
                                backgroundColor: colors.background === '#091227'
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'rgba(0,0,0,0.05)'
                            }
                        ]}
                        placeholderTextColor={colors.textSecondary}
                        placeholder="Playlist name"
                        value={playlistTitle}
                        onChangeText={setPlaylistTitle}
                    />

                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: colors.textPrimary,
                                backgroundColor: colors.background === '#091227'
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'rgba(0,0,0,0.05)'
                            }
                        ]}
                        placeholderTextColor={colors.textSecondary}
                        placeholder="Description (optional)"
                        value={playlistDescription}
                        onChangeText={setPlaylistDescription}
                        multiline
                    />

                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: colors.textPrimary,
                                backgroundColor: colors.background === '#091227'
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'rgba(0,0,0,0.05)'
                            }
                        ]}
                        placeholderTextColor={colors.textSecondary}
                        placeholder="Tags (separated by commas)"
                        value={tags}
                        onChangeText={setTags}
                    />

                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity
                            style={[
                                styles.imagePickerButton,
                                {
                                    backgroundColor: colors.background === '#091227'
                                        ? 'rgba(255,255,255,0.1)'
                                        : 'rgba(0,0,0,0.05)'
                                }
                            ]}
                            onPress={handleImagePick}
                        >
                            <Text style={{ color: colors.textPrimary }}>
                                {selectedImage ? 'Change Image' : 'Add Playlist Image'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.switchContainer}>
                        <Text style={{ color: colors.textPrimary }}>Public</Text>
                        <Switch
                            value={isPublic}
                            onValueChange={setIsPublic}
                            trackColor={{
                                false: colors.background === '#091227' ? '#2C3352' : '#E0E0E0',
                                true: '#1DB954'
                            }}
                            thumbColor={isPublic ? '#FFFFFF' : '#FFFFFF'}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={handleEditPlaylist}
                        >
                            <Text style={styles.createButtonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    input: {
        borderRadius: 10,
        padding: 10,
        marginBottom: 15
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    imagePickerContainer: {
        marginBottom: 15,
    },
    imagePickerButton: {
        padding: 10,
        borderRadius: 10,
        alignItems: 'center'
    },
    previewImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 15,
        resizeMode: 'cover',
        alignSelf: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cancelButton: {
        flex: 1,
        marginRight: 10,
        padding: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 10
    },
    cancelButtonText: {
        textAlign: 'center',
        color: '#333'
    },
    createButton: {
        flex: 1,
        padding: 10,
        backgroundColor: '#1DB954',
        borderRadius: 10
    },
    createButtonText: {
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold'
    }
});

export default EditPlaylistModal;