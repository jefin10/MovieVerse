import { Divider, EmptyState, Field, Header, ListRow, ListSkeleton, Reveal, Score, Screen, Text, Thumb, gutter, space } from '@/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';

interface Movie {
  id: number;
  title: string;
  poster_url: string;
  imdb_rating?: number;
  genres?: string[];
  release_date?: string;
}

export default function SearchResults() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const router = useRouter();
  const [text, setText] = useState(String(query ?? ''));
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const search = async (q: string) => {
    setLoading(true);
    setFailed(false);
    try {
      const { data } = await api.get(`api/searchMovie/${encodeURIComponent(q)}`);
      setResults(data);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) search(String(query));
  }, [query]);

  const submit = () => text.trim() && router.setParams({ query: text.trim() });

  return (
    <ProtectedRoute>
      <Screen edges={['top', 'bottom']}>
        <Header back title="Search" />
        <View style={styles.field}>
          <Field leadingIcon="search" placeholder="Search movies" accessibilityLabel="Search movies" value={text} onChangeText={setText} returnKeyType="search" onSubmitEditing={submit} />
        </View>
        {loading ? (
          <View style={styles.pad}>
            <ListSkeleton />
          </View>
        ) : failed ? (
          <EmptyState message="Search needs a connection." action={{ label: 'Try again', onPress: () => search(String(query)) }} />
        ) : !results.length ? (
          <EmptyState message={`No results for “${query}”.`} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(m) => String(m.id)}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={Divider}
            renderItem={({ item, index }) => (
              <Reveal index={index}>
                <ListRow
                  leading={<Thumb uri={item.poster_url} />}
                  title={item.title}
                  subtitle={
                    <View style={styles.meta}>
                      {item.release_date ? (
                        <Text variant="label" tone="secondary">
                          {item.release_date.split('-')[0]}
                        </Text>
                      ) : null}
                      <Score value={item.imdb_rating} />
                    </View>
                  }
                  meta={item.genres?.slice(0, 2).join(', ')}
                  chevron
                  onPress={() => router.push({ pathname: '/pages/MovieDetailPage', params: { movieId: item.id } })}
                />
              </Reveal>
            )}
          />
        )}
      </Screen>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  field: { paddingHorizontal: gutter, paddingBottom: space.lg },
  pad: { paddingHorizontal: gutter },
  list: { paddingHorizontal: gutter, paddingBottom: space.xxl },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
