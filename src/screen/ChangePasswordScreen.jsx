import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Feather';

const ChangePasswordScreen = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigation = useNavigation();
  const { colors } = useTheme();

  const validatePasswords = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      const user = auth().currentUser;
      
      const credential = auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await user.reauthenticateWithCredential(credential);
      
      await user.updatePassword(newPassword);
      
      Alert.alert(
        'Success',
        'Password changed successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      let errorMessage = 'An error occurred while changing password';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    value,
    setValue,
    placeholder,
    showPassword,
    setShowPassword
  ) => (
    <View style={[styles.inputContainer, { borderColor: colors.textSecondary }]}>
      <TextInput
        style={[
          styles.input,
          { 
            color: colors.textPrimary,
            backgroundColor: colors.maximumTintColor,
            borderColor: colors.textSecondary,
          }
        ]}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity
        style={styles.eyeIcon}
        onPress={() => setShowPassword(!showPassword)}
      >
        <Icon
          name={showPassword ? 'eye-off' : 'eye'}
          size={24}
          color={colors.iconSecondary}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.iconPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Change Password
        </Text>
      </View>
      
      {renderPasswordInput(
        currentPassword,
        setCurrentPassword,
        'Current Password',
        showCurrentPassword,
        setShowCurrentPassword
      )}
      
      {renderPasswordInput(
        newPassword,
        setNewPassword,
        'New Password',
        showNewPassword,
        setShowNewPassword
      )}
      
      {renderPasswordInput(
        confirmPassword,
        setConfirmPassword,
        'Confirm New Password',
        showConfirmPassword,
        setShowConfirmPassword
      )}

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.textPrimary,
            opacity: loading ? 0.7 : 1
          }
        ]}
        onPress={handleChangePassword}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          {loading ? 'Changing Password...' : 'Change Password'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 44, // To center the title accounting for back button
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingRight: 50,
    fontSize: 16,
    borderWidth: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 13,
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;