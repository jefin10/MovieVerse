import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import Image from '@/app/components/CachedImage';
import { ensureCompleteImageUrl } from '@/app/utils/imageUtils';
import { Reveal } from './Motion';
import { Text } from './Text';
import { Touchable } from './Touchable';
import { color, gutter, radius, size, space } from './tokens';

export type PosterMovie = { id: number; title: string; poster_url?: string | null };

type PosterProps = {
  movie: PosterMovie;
  width: number;
  onPress?: () => void;
  showTitle?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** A 2:3 poster card, optionally with its title underneath. */
export const Poster = ({ movie, width, onPress, showTitle = true, style }: PosterProps) => {
  const uri = ensureCompleteImageUrl(movie.poster_url ?? '');
  return (
    <Touchable onPress={onPress} disabled={!onPress} accessibilityRole="button" accessibilityLabel={movie.title} style={[{ width }, style]}>
      <View style={[styles.image, { width, height: width * 1.5 }]}>
        {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} /> : null}
      </View>
      {showTitle ? (
        <Text variant="label" numberOfLines={1} style={styles.title}>
          {movie.title}
        </Text>
      ) : null}
    </Touchable>
  );
};

type ListProps = { movies: PosterMovie[]; onOpen?: (movie: PosterMovie) => void; animate?: boolean };

/** A horizontal row of posters that scrolls edge to edge but starts on the shared left edge. */
export const PosterRow = ({ movies, onOpen, animate = true }: ListProps) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={styles.bleed}>
    {movies.map((m, i) => (
      <Reveal key={`${m.id}-${i}`} index={i} animate={animate}>
        <Poster movie={m} width={size.posterWidth} onPress={onOpen ? () => onOpen(m) : undefined} />
      </Reveal>
    ))}
  </ScrollView>
);

/** Three columns on the shared grid. */
export const usePosterColumnWidth = () => {
  const { width } = useWindowDimensions();
  return Math.floor((width - gutter * 2 - space.md * 2) / 3);
};

export const PosterGrid = ({ movies, onOpen, animate = true, showTitle = true }: ListProps & { showTitle?: boolean }) => {
  const columnWidth = usePosterColumnWidth();
  return (
    <View style={styles.grid}>
      {movies.map((m, i) => (
        <Reveal key={`${m.id}-${i}`} index={i} animate={animate}>
          <Poster movie={m} width={columnWidth} onPress={onOpen ? () => onOpen(m) : undefined} showTitle={showTitle} />
        </Reveal>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  image: { borderRadius: radius.container, backgroundColor: color.surface, overflow: 'hidden' },
  title: { marginTop: space.sm },
  // Rows bleed to the screen edge so posters scroll off it, but begin on the gutter.
  bleed: { marginHorizontal: -gutter },
  row: { paddingHorizontal: gutter, gap: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.md, rowGap: space.lg },
});
