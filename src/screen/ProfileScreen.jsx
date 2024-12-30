import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { iconSize } from '../constants/dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign'

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Separate function to fetch user profile
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

  // Use useFocusEffect to refetch profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [])
  );


  const renderProfileDetails = () => (
    <View style={[styles.detailsContainer, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Personal Information
      </Text>
      {[
        { label: 'Date of Birth', value: profile?.dateOfBirth },
        { label: 'Phone', value: profile?.phone }
      ].map((detail, index) => (
        <View key={index} style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            {detail.label}
          </Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {detail.value}
          </Text>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Favorite Genres
      </Text>
      <View style={styles.genresContainer}>
        {profile?.favoriteGenres?.map((genre, index) => (
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
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Playlists
      </Text>
      <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
        {profile?.playlists?.length || 0} Playlists
      </Text>
    </View>
  );
  const renderProfileHeader = () => (
    <LinearGradient
      colors={[colors.background, colors.maximumTintColor]}
      style={[styles.headerContainer, { backgroundColor: colors.background }]}
    >
      {/* Existing header code */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.toggleDrawer()}
        >
          <FontAwesome5
            name="grip-lines"
            color={colors.textPrimary}
            size={iconSize.md}
          />
        </TouchableOpacity>
        <Image
          source={
            profile?.avatarUrl
              ? { uri: profile.avatarUrl }
              : require('../../assets/image/default-avatar.png')
          }
          style={[styles.avatar, { borderColor: colors.textSecondary }]}
        />
      </View>
      <Text style={[styles.username, { color: colors.textPrimary }]}>
        {profile?.username || 'User'}
      </Text>
      <Text style={[styles.email, { color: colors.textSecondary }]}>
        {profile?.email || 'user@example.com'}
      </Text>
    </LinearGradient>
  );

  // Add null check to prevent rendering issues
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollViewContent}
    >
      {renderProfileHeader()}
      {renderProfileDetails()}
      <TouchableOpacity
        style={[
          styles.editButton,
          {
            backgroundColor: colors.maximumTintColor,
            shadowColor: colors.textPrimary,
            marginBottom: 0  // Để tạo khoảng cách với nút Edit Profile
          }
        ]}
        onPress={() => navigation.navigate('CHANGE_PASSWORD_SCREEN')}
      >
        <Text style={[styles.editButtonText, { color: colors.textPrimary }]}>
          Change Password
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.editButton,
          {
            backgroundColor: colors.textPrimary,
            shadowColor: colors.textPrimary
          }
        ]}
        onPress={() => { navigation.navigate('EDIT_PROFILE_SCREEN') }}
      >
        <Text style={[styles.editButtonText, { color: colors.background }]}>
          Edit Profile
        </Text>
      </TouchableOpacity>
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    alignSelf: 'center',
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  detailsContainer: {
    padding: 20,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 14,
  },
  editButton: {
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});

export default ProfileScreen;