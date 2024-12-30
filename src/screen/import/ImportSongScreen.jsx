import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { songs } from '../../data/songs'; // Import dữ liệu từ file songs.js

const ImportSongScreen = () => {
  const { colors } = useTheme();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addNCSongs = async () => {
    setIsLoading(true);
    try {
      // Thêm từng bài hát vào Firestore
      for (const song of songs) {
        await firestore()
          .collection('songs')
          .add({
            ...song,
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
      }
      console.log('Successfully added all songs!');
    } catch (error) {
      console.error('Error adding songs: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('songs')
      .onSnapshot(querySnapshot => {
        console.log('Total songs: ', querySnapshot.size);

        const songsData = [];
        querySnapshot.forEach(documentSnapshot => {
          songsData.push({
            id: documentSnapshot.id,
            ...documentSnapshot.data(),
          });
        });

        setData(songsData);
        console.log('Updated songs: ', songsData);
      });

    return () => unsubscribe();
  }, []);

  const renderSong = ({ item }) => (
    <View style={styles.songItem}>
      <Text style={[styles.songTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.songArtist, { color: colors.text }]}>{item.artist}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={addNCSongs}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Adding Songs...' : 'Add Sample Songs'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={data}
        renderItem={renderSong}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    padding: 10,
  },
  songItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  songArtist: {
    fontSize: 14,
  },
});

export default ImportSongScreen;
