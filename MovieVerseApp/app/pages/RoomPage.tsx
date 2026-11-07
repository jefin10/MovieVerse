import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, AppState, Modal, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { API_BASE_URL } from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';
import Image from '../components/CachedImage';
import CustomSwiper from '../components/CustomSwiper';
import PageHeader from '../components/PageHeader';
import TinderMovieCard from '../components/tinderMovieCard';
import { s } from '../services/ui';

const socketUrl = () => `${API_BASE_URL.replace(/^http/, 'ws').replace(/\/$/, '')}/ws/rooms`;

export default function RoomPage() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const [room, setRoom] = useState<any>(null);
  const [cards, setCards] = useState<any[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [connected, setConnected] = useState(false);
  const [match, setMatch] = useState<any>(null);
  const [showMatches, setShowMatches] = useState(false);
  const pop = useRef(new Animated.Value(0.8)).current;
  const index = useRef(0);

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

  const celebrate = useCallback(
    (movie: any) => {
      setMatch(movie);
      pop.setValue(0.8);
      Animated.spring(pop, { toValue: 1, damping: 11, stiffness: 180, useNativeDriver: true }).start();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
    [pop],
  );

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
          refresh();
        } else if (message.type === 'match') {
          celebrate(message.movie);
          refresh();
        } else {
          refresh();
        }
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

  const onSwipe = (liked: boolean) => {
    const movie = cards?.[index.current];
    index.current += 1;
    if (!movie) return;
    api.post(`api/rooms/${code}/swipes/`, { movie_id: movie.id, liked }).catch(() => {});
  };

  const invite = () =>
    Share.share({ message: `Let's pick a movie together on MovieVerse. Open Watch Together and enter code ${code}` });

  const alone = (room?.members.length ?? 0) < 2;

  return (
    <ProtectedRoute>
      <SafeAreaView style={s.page}>
        <PageHeader
          title="Watch Together"
          right={
            <TouchableOpacity style={[s.pill, !room?.matches.length && s.pillOff]} onPress={() => setShowMatches(true)}>
              <Text style={[s.pillText, !room?.matches.length && s.pillOffText]}>♥ {room?.matches.length ?? 0}</Text>
            </TouchableOpacity>
          }
        />
        {!room ? (
          failed ? <Text style={s.empty}>This room couldn’t be loaded. It may have expired.</Text> : <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
        ) : (
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <TouchableOpacity style={[s.card, s.rowCard, { marginBottom: 8 }]} onPress={invite} accessibilityLabel={`Share room code ${code}`}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: 4 }}>{code}</Text>
                <Text style={s.meta} numberOfLines={1}>
                  {alone
                    ? 'Waiting for a friend. Tap to share the code.'
                    : room.members.map((m: any) => `${m.username} ${m.swiped}/${room.deck_size}`).join('  ·  ')}
                </Text>
              </View>
              <Feather name={connected ? 'share-2' : 'wifi-off'} size={20} color="#fff" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              {cards && cards.length > 0 ? (
                <CustomSwiper
                  cards={cards}
                  renderCard={(card: any) => (card ? <TinderMovieCard {...card} /> : null)}
                  onSwipedRight={() => onSwipe(true)}
                  onSwipedLeft={() => onSwipe(false)}
                  onSwipedAll={() => setCards([])}
                  cardIndex={0}
                  backgroundColor="transparent"
                  stackSize={3}
                  stackSeparation={15}
                  cardVerticalMargin={10}
                  animateCardOpacity
                  overlayLabels={{}}
                />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={[s.empty, { marginTop: 0 }]}>
                    You’ve swiped them all. {room.matches.length ? 'See your matches above.' : 'Matches appear here as your friends finish.'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <Modal visible={!!match} transparent animationType="fade" onRequestClose={() => setMatch(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
            <Animated.View style={{ alignItems: 'center', transform: [{ scale: pop }] }}>
              <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800', marginBottom: 18 }}>It’s a match!</Text>
              {match ? <Image source={{ uri: match.poster_url }} style={{ width: 210, height: 315, borderRadius: 20, backgroundColor: '#222' }} /> : null}
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>{match?.title}</Text>
              <Text style={[s.cardBody, { marginTop: 4, marginBottom: 22 }]}>You all liked this one.</Text>
              <TouchableOpacity style={s.button} onPress={() => setMatch(null)}><Text style={s.buttonText}>Keep swiping</Text></TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 14 }}
                onPress={() => {
                  const id = match?.id;
                  setMatch(null);
                  router.push({ pathname: '/pages/MovieDetailPage', params: { movieId: String(id) } } as any);
                }}
              >
                <Text style={s.link}>See details</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        <Modal visible={showMatches} animationType="slide" onRequestClose={() => setShowMatches(false)}>
          <SafeAreaView style={s.page}>
            <View style={s.header}>
              <Text style={s.headerTitle}>Your matches</Text>
              <TouchableOpacity onPress={() => setShowMatches(false)} accessibilityLabel="Close"><Feather name="x" size={26} color="#fff" /></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
              {!room?.matches.length ? <Text style={s.empty}>No matches yet. Keep swiping.</Text> : null}
              {room?.matches.map((m: any) => (
                <TouchableOpacity
                  key={m.id}
                  style={[s.card, s.rowCard]}
                  onPress={() => {
                    setShowMatches(false);
                    router.push({ pathname: '/pages/MovieDetailPage', params: { movieId: String(m.id) } } as any);
                  }}
                >
                  <Image source={{ uri: m.poster_url }} style={s.thumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>{m.title}</Text>
                    <Text style={s.cardBody} numberOfLines={2}>{m.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </ProtectedRoute>
  );
}
