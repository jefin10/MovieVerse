import {
  BottomBar,
  Button,
  Chip,
  EmptyState,
  Field,
  Header,
  PosterGrid,
  PosterGridSkeleton,
  Screen,
  SectionHeader,
  gutter,
  space,
  type PosterMovie,
} from '@/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';

// Each label sends the same phrase to the mood model as before the redesign.
const QUICK_MOODS = [
  { label: 'Happy', query: 'dramatic movie' },
  { label: 'Sad', query: 'comedy' },
  { label: 'Romantic', query: 'Romantic' },
  { label: 'Lonely', query: 'fantasy' },
  { label: 'Adventurous', query: 'Adventurous' },
  { label: 'Frustrated', query: 'Action' },
];
const RESULT_COUNT = 12;

type State = 'pick' | 'loading' | 'results' | 'error';

const Mood = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [state, setState] = useState<State>('pick');
  const [text, setText] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [movies, setMovies] = useState<PosterMovie[]>([]);
  const [offline, setOffline] = useState(false);

  const find = async (query: string) => {
    if (!query.trim()) return;
    setLastQuery(query);
    setState('loading');
    try {
      const { data } = await api.post('ai/recommend/', { mood: query });
      setGenre(data.genre || '');
      setMovies((data.recommendations ?? []).slice(0, RESULT_COUNT));
      setState('results');
    } catch (err: any) {
      setOffline(!err?.response);
      setState('error');
    }
  };

  useEffect(() => {
    if (params.selectedMood) find(String(params.selectedMood));
  }, [params.selectedMood]);

  const open = (movie: PosterMovie) => router.push({ pathname: '/pages/MovieDetailPage', params: { movieId: movie.id } });

  return (
    <ProtectedRoute>
      <Screen>
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Header title="Mood" />

          {state === 'pick' ? (
            <>
              <ScrollView style={styles.fill} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
                <Field
                  label="How do you feel?"
                  placeholder="Describe your mood"
                  value={text}
                  onChangeText={setText}
                  returnKeyType="search"
                  onSubmitEditing={() => find(text)}
                />
                <View style={styles.chips}>
                  {QUICK_MOODS.map((m) => (
                    <Chip key={m.label} role="button" label={m.label} onPress={() => find(m.query)} />
                  ))}
                </View>
              </ScrollView>
              <BottomBar>
                <Button title="Find films" onPress={() => find(text)} disabled={!text.trim()} />
              </BottomBar>
            </>
          ) : null}

          {state === 'loading' ? (
            <View style={styles.body}>
              <PosterGridSkeleton />
            </View>
          ) : null}

          {state === 'results' ? (
            <>
              <ScrollView style={styles.fill} contentContainerStyle={styles.body}>
                {movies.length ? (
                  <View>
                    <SectionHeader title={genre || 'Your picks'} />
                    <PosterGrid movies={movies} onOpen={open} />
                  </View>
                ) : (
                  <EmptyState message="No films match that mood." />
                )}
              </ScrollView>
              <BottomBar>
                <Button variant="secondary" title="Change mood" onPress={() => setState('pick')} />
              </BottomBar>
            </>
          ) : null}

          {state === 'error' ? (
            <EmptyState
              message={offline ? 'Mood picks need a connection.' : 'Couldn’t find films for that mood.'}
              action={{ label: 'Try again', onPress: () => find(lastQuery) }}
            />
          ) : null}
        </KeyboardAvoidingView>
      </Screen>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: { paddingHorizontal: gutter, paddingBottom: space.xl, gap: space.xl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});

export default Mood;
