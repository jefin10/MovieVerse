import {
  BottomBar,
  Block,
  Button,
  Card,
  Chip,
  Divider,
  EmptyState,
  Header,
  ListRow,
  Poster,
  Screen,
  Sheet,
  SwipeCard,
  Swiper,
  Text,
  Thumb,
  color,
  gutter,
  icon,
  size,
  space,
  type SwiperHandle,
  Icon,
} from '@/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, ScrollView, Share, StyleSheet, View } from 'react-native';
import api, { API_BASE_URL } from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';

const socketUrl = () => `${API_BASE_URL.replace(/^http/, 'ws').replace(/\/$/, '')}/ws/rooms`;

export default function RoomPage() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const deck = useRef<SwiperHandle>(null);
  const [room, setRoom] = useState<any>(null);
  const [cards, setCards] = useState<any[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [connected, setConnected] = useState(false);
  const [match, setMatch] = useState<any>(null);
  const [showMatches, setShowMatches] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get(`api/rooms/${code}/`);
      setRoom(data);
      setFailed(false);
      // The deck is set once: reloading it mid-swipe would make the cards jump.
      setCards((current) => current ?? data.deck.filter((m: any) => !data.my_swipes.includes(m.id)));
    } catch {
      setFailed(true);
    }
  }, [code]);

  const celebrate = useCallback((movie: any) => {
    setMatch(movie);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  // Live updates. After any drop it reconnects and re-reads the room to catch up.
  useEffect(() => {
    let socket: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let closed = false;
    let attempts = 0;

    const connect = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (closed) return;
      socket = new WebSocket(socketUrl());
      socket.onopen = () => socket?.send(JSON.stringify({ token, code }));
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'ready') {
          attempts = 0;
          setConnected(true);
        } else if (message.type === 'match') {
          celebrate(message.movie);
        }
        refresh();
      };
      socket.onclose = () => {
        setConnected(false);
        if (closed) return;
        attempts += 1;
        retry = setTimeout(connect, Math.min(1000 * 2 ** attempts, 30_000));
      };
    };

    refresh();
    connect();
    const appState = AppState.addEventListener('change', (state) => state === 'active' && refresh());
    return () => {
      closed = true;
      clearTimeout(retry);
      socket?.close();
      appState.remove();
    };
  }, [code, refresh, celebrate]);

  const onSwiped = (movie: any, direction: 'left' | 'right') =>
    api.post(`api/rooms/${code}/swipes/`, { movie_id: movie.id, liked: direction === 'right' }).catch(() => {});

  const invite = () => Share.share({ message: `Pick a film with me on MovieVerse. Open Watch together and enter ${code}` });
  const openMovie = (id: number) => router.push({ pathname: '/pages/MovieDetailPage', params: { movieId: String(id) } } as any);

  const matches = room?.matches ?? [];
  const alone = (room?.members.length ?? 0) < 2;
  const done = cards !== null && cards.length === 0;

  return (
    <ProtectedRoute>
      <Screen edges={['top', 'bottom']}>
        <Header
          back
          title="Room"
          actions={<Chip role="button" label={`Matches ${matches.length}`} selected={matches.length > 0} onPress={() => setShowMatches(true)} />}
        />
        {!room ? (
          failed ? (
            <EmptyState message="This room has expired." action={{ label: 'Back', onPress: () => router.back() }} />
          ) : (
            <View style={styles.deck}>
              <Block width="100%" height={0} style={styles.fill} />
            </View>
          )
        ) : (
          <>
            <Card onPress={invite} accessibilityLabel={`Share room code ${code}`} style={styles.code}>
              <View style={styles.fill}>
                <Text variant="section">{code}</Text>
                <Text variant="label" tone="secondary" numberOfLines={1}>
                  {alone ? 'Share the code with a friend' : room.members.map((m: any) => `${m.username} ${m.swiped}/${room.deck_size}`).join(' · ')}
                </Text>
              </View>
              <Icon name={connected ? 'share-2' : 'wifi-off'} size={icon.action} color={color.text} />
            </Card>

            <View style={styles.deck}>
              {done ? (
                <EmptyState
                  message={matches.length ? 'You’ve swiped them all.' : 'You’ve swiped them all. Matches show up as friends finish.'}
                  action={matches.length ? { label: 'See matches', onPress: () => setShowMatches(true) } : undefined}
                />
              ) : cards ? (
                <Swiper
                  ref={deck}
                  cards={cards}
                  keyFor={(m) => String(m.id)}
                  renderCard={(m) => <SwipeCard {...m} />}
                  onSwiped={onSwiped}
                  onSwipedAll={() => setCards([])}
                  leftLabel="Skip"
                  rightLabel="Like"
                />
              ) : null}
            </View>

            <BottomBar style={styles.actions}>
              <Button variant="secondary" title="Skip" icon="x" onPress={() => deck.current?.swipe('left')} disabled={done} style={styles.fill} />
              <Button title="Like" icon="heart" onPress={() => deck.current?.swipe('right')} disabled={done} style={styles.fill} />
            </BottomBar>
          </>
        )}

        <Sheet visible={!!match} onClose={() => setMatch(null)} title="It’s a match">
          {match ? (
            <View style={styles.match}>
              <Poster movie={match} width={size.posterWidth * 1.5} showTitle={false} />
              <Text variant="section" center>
                {match.title}
              </Text>
              <View style={styles.matchActions}>
                <Button title="Keep swiping" onPress={() => setMatch(null)} />
                <Button
                  variant="text"
                  title="See details"
                  onPress={() => {
                    const id = match.id;
                    setMatch(null);
                    openMovie(id);
                  }}
                />
              </View>
            </View>
          ) : null}
        </Sheet>

        <Sheet visible={showMatches} onClose={() => setShowMatches(false)} title="Matches">
          {matches.length ? (
            <ScrollView>
              {matches.map((m: any, i: number) => (
                <View key={m.id}>
                  {i > 0 ? <Divider /> : null}
                  <ListRow
                    leading={<Thumb uri={m.poster_url} />}
                    title={m.title}
                    subtitle={m.description}
                    chevron
                    onPress={() => {
                      setShowMatches(false);
                      openMovie(m.id);
                    }}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text tone="secondary" style={styles.sheetEmpty}>
              No matches yet.
            </Text>
          )}
        </Sheet>
      </Screen>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  code: { marginHorizontal: gutter, marginBottom: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md },
  deck: { flex: 1, paddingHorizontal: gutter, paddingBottom: space.xl },
  actions: { flexDirection: 'row' },
  match: { alignItems: 'center', gap: space.lg },
  matchActions: { alignSelf: 'stretch', gap: space.sm },
  sheetEmpty: { paddingBottom: space.lg },
});
