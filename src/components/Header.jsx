import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { iconSize, spacing } from '../constants/dimensions'
import { useNavigation, useTheme } from '@react-navigation/native'

const Header = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.header, {
      backgroundColor: colors.surface,
      borderBottomColor: colors.border,
    }]}>
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
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Home</Text>
      <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('SEARCH_SCREEN')}>
        <AntDesign
          name="search1"
          color={colors.textPrimary}
          size={iconSize.md}
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
  },
  iconButton: {
    padding: spacing.xs,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10
  },
});

export default Header;