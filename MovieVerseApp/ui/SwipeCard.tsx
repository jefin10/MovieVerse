import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Image from '@/app/components/CachedImage';
import { ensureCompleteImageUrl } from '@/app/utils/imageUtils';
import { Score } from './ListRow';
import { Text } from './Text';
import { color, radius, space } from './tokens';

type Movie = { title?: string; description?: string; poster_url?: string; genres?: string[] | string; imdb_rating?: number };

/** A full-bleed poster with the essentials on a scrim. Tap to read the full overview. */
export const SwipeCard = (movie: Movie) => {
  const [expanded, setExpanded] = useState(false);
  const genres = Array.isArray(movie.genres) ? movie.genres.slice(0, 2).join(', ') : movie.genres;
  const uri = ensureCompleteImageUrl(movie.poster_url);

  return (
    <View style={styles.card}>
      {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} /> : null}
      <LinearGradient colors={['transparent', color.mediaScrim, color.bg]} locations={[0.4, 0.65, 1]} style={StyleSheet.absoluteFill} />
      <Pressable
        style={styles.info}
        onPress={() => setExpanded((e) => !e)}
        disabled={!movie.description}
        accessibilityRole="button"
        accessibilityHint={expanded ? 'Shows less' : 'Shows the full overview'}
      >
        <Text variant="section" numberOfLines={2}>
          {movie.title}
        </Text>
        <View style={styles.meta}>
          {genres ? (
            <Text variant="label" tone="secondary" numberOfLines={1} style={styles.genres}>
              {genres}
            </Text>
          ) : null}
          <Score value={movie.imdb_rating} />
        </View>
        {movie.description ? (
          <Text variant="label" numberOfLines={expanded ? 12 : 2}>
            {movie.description}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.container, overflow: 'hidden', backgroundColor: color.surface, justifyContent: 'flex-end' },
  info: { padding: space.lg, gap: space.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  genres: { flexShrink: 1 },
});
