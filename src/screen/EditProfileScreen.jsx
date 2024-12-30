import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ImagePicker from 'react-native-image-crop-picker';
import { iconSize } from '../constants/dimensions';

const EditProfileScreen = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    avatarUrl: '',
    favoriteGenres: [],
  });
  const [loading, setLoading] = useState(true);
  const [newAvatar, setNewAvatar] = useState(null);
  const [newGenre, setNewGenre] = useState('');

  const { colors } = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const currentUser = auth().currentUser;
        if (currentUser) {
          const userDoc = await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .get();

          if (userDoc.exists) {
            setProfile(userDoc.data());
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSelectAvatar = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        includeBase64: true, // Thêm option này để lấy base64 string
      });
  
      // Tạo chuỗi base64 hoàn chỉnh với data URI scheme
      const base64Image = `data:${image.mime};base64,${image.data}`;
      setNewAvatar(base64Image);
      
      // Cập nhật profile trực tiếp với base64 string
      setProfile(prev => ({
        ...prev,
        avatarUrl: base64Image
      }));
  
    } catch (error) {
      console.log('Image picker error:', error);
    }
  };


  const handleSaveProfile = async () => {
    try {
      const currentUser = auth().currentUser;
  
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          ...profile,
          // avatarUrl đã là base64 string nên không cần xử lý gì thêm
        });
  
      Alert.alert('Success', 'Profile updated successfully');
      navigation.navigate('PROFILE_SCREEN');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const addGenre = () => {
    if (newGenre.trim() && !profile.favoriteGenres.includes(newGenre.trim())) {
      setProfile(prev => ({
        ...prev,
        favoriteGenres: [...prev.favoriteGenres, newGenre.trim()]
      }));
      setNewGenre('');
    }
  };

  const removeGenre = (genreToRemove) => {
    setProfile(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.filter(genre => genre !== genreToRemove)
    }));
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[colors.background, colors.maximumTintColor]}
      style={[styles.headerContainer, { backgroundColor: colors.background }]}
    >
      <View style={styles.headerTopRow}>
        <TouchableOpacity onPress={handleGoBack}>
          <AntDesign
            name="arrowleft"
            color={colors.iconPrimary}
            size={iconSize.md}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSaveProfile}>
          <Text style={[styles.saveText, { color: colors.textPrimary }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarContainer}>
        <Image
          source={
            profile?.avatarUrl
              ? { uri: profile.avatarUrl }
              : require('../../assets/image/default-avatar.png')
          }
          style={[styles.avatar, { borderColor: colors.textSecondary }]}
        />
        <TouchableOpacity 
          style={styles.editAvatarIcon} 
          onPress={handleSelectAvatar}
        >
          <Icon name="edit-2" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollViewContent}
    >
      {renderHeader()}
      
      <View style={[styles.formContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Personal Information
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Username
          </Text>
          <TextInput
            value={profile.username}
            onChangeText={(text) => setProfile(prev => ({ ...prev, username: text }))}
            style={[
              styles.input, 
              { 
                backgroundColor: colors.maximumTintColor, 
                color: colors.textPrimary 
              }
            ]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Email
          </Text>
          <TextInput
            value={profile.email}
            onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
            style={[
              styles.input, 
              { 
                backgroundColor: colors.maximumTintColor, 
                color: colors.textPrimary 
              }
            ]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Date of Birth
          </Text>
          <TextInput
            value={profile.dateOfBirth}
            onChangeText={(text) => setProfile(prev => ({ ...prev, dateOfBirth: text }))}
            style={[
              styles.input, 
              { 
                backgroundColor: colors.maximumTintColor, 
                color: colors.textPrimary 
              }
            ]}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Phone
          </Text>
          <TextInput
            value={profile.phone}
            onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
            style={[
              styles.input, 
              { 
                backgroundColor: colors.maximumTintColor, 
                color: colors.textPrimary 
              }
            ]}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>
          Favorite Genres
        </Text>
        
        <View style={styles.genreInputContainer}>
          <TextInput
            value={newGenre}
            onChangeText={setNewGenre}
            placeholder="Add a genre"
            style={[
              styles.genreInput, 
              { 
                backgroundColor: colors.maximumTintColor, 
                color: colors.textPrimary 
              }
            ]}
          />
          <TouchableOpacity 
            style={styles.addGenreButton} 
            onPress={addGenre}
          >
            <Icon name="plus" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.genresContainer}>
          {profile.favoriteGenres?.map((genre, index) => (
            <View
              key={index}
              style={[
                styles.genreTag,
                {
                  backgroundColor: colors.maximumTintColor,
                  borderColor: colors.textSecondary
                }
              ]}
            >
              <Text style={[styles.genreText, { color: colors.textPrimary }]}>
                {genre}
              </Text>
              <TouchableOpacity 
                onPress={() => removeGenre(genre)}
                style={styles.removeGenreButton}
              >
                <Icon name="x" size={14} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  genreInputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  genreInput: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  addGenreButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 14,
    marginRight: 5,
  },
  removeGenreButton: {
    marginLeft: 5,
  },
});

export default EditProfileScreen;