import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SongCard from './SongCard'
import { fontSize, spacing } from '../constants/dimensions'
import { fontFamilies } from '../constants/fonts'
import { useTheme } from '@react-navigation/native'

const SongCardWithCategory = ({ item }) => {
  const {colors} = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.headingText, {color: colors.textPrimary }]}>
        {item.title}
      </Text>
      <FlatList
        data={item.songs}
        renderItem={({ item }) => (
          <SongCard item={item} />
        )}
        horizontal={true}
        ItemSeparatorComponent={() => (
          <View style={{ width: spacing.md }} />
        )}
        contentContainerStyle={styles.listContent}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  headingText: {
    fontSize: fontSize.xl,
    fontFamily: fontFamilies.bold,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
});

export default SongCardWithCategory;