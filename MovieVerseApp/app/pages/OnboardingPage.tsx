import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../auth/api';
import Image from '../components/CachedImage';
import { prefetchTabData } from '../services/movieData';
import { ONBOARDING_KEY, registerForPush } from '../services/push';

const MIN_PICKS = 3;
type Step = 'taste' | 'services' | 'alerts' | 'done';

const Poster = ({ movie, selected, onPress }: { movie: any; selected: boolean; onPress: () => void }) => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: selected ? 0.93 : 1, damping: 12, stiffness: 260, useNativeDriver: true }).start();
  }, [selected, scale]);
  return (
    <Pressable style={styles.posterCell} onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} accessibilityLabel={movie.title}>
      <Animated.View style={[styles.poster, selected && styles.posterOn, { transform: [{ scale }] }]}>
        <Image source={{ uri: movie.poster_url }} style={StyleSheet.absoluteFill} />
        {selected ? (
          <View style={styles.check}><Feather name="check" size={14} color="#000" /></View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('taste');
  const [name, setName] = useState('');
  const [movies, setMovies] = useState<any[] | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [mine, setMine] = useState<number[]>([]);
  const [picks, setPicks] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AsyncStorage.getItem('username').then((u) => setName(u ?? ''));
    api.get('api/onboarding/movies/').then((r) => setMovies(r.data)).catch(() => setMovies([]));
    api.get('api/providers/').then((r) => setProviders(r.data)).catch(() => {});
  }, []);

  // Without any starter movies there's nothing to choose from, so don't get stuck here.
  useEffect(() => {
    if (movies?.length === 0 && step === 'taste') goTo(providers.length ? 'services' : 'alerts');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movies, step]);

  const steps: Step[] = providers.length ? ['taste', 'services', 'alerts'] : ['taste', 'alerts'];
  const progress = step === 'done' ? steps.length : steps.indexOf(step) + 1;

  const goTo = (next: Step) => {
    Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      setStep(next);
      Animated.timing(fade, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
  };

  const togglePick = (id: number) => {
    Haptics.selectionAsync().catch(() => {});
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const saveTaste = async () => {
    setBusy(true);
    await api.post('api/onboarding/favorites/', { movie_ids: picked }).catch(() => {});
    setBusy(false);
    goTo(providers.length ? 'services' : 'alerts');
  };

  const saveServices = async () => {
    if (mine.length) api.patch('api/preferences/', { providers: mine }).catch(() => {});
    goTo('alerts');
  };

  const finishSetup = async (allowAlerts: boolean) => {
    setBusy(true);
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    await registerForPush({ ask: allowAlerts, remember: true });
    try {
      const { data } = await api.get('api/recommendations/from-ratings/');
      setPicks(data.info ? [] : (data.recommendations ?? []).slice(0, 6));
    } catch {
      setPicks([]);
    }
    setBusy(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    goTo('done');
  };

  const enterApp = () => {
    AsyncStorage.getItem('username').then((u) => u && prefetchTabData(u));
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.bars} accessibilityLabel={`Step ${progress} of ${steps.length}`}>
        {steps.map((_, i) => (
          <View key={i} style={[styles.bar, i < progress && styles.barOn]} />
        ))}
      </View>

      <Animated.View style={[styles.body, { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
        {step === 'taste' ? (
          <>
            <Text style={styles.title}>What do you love?</Text>
            <Text style={styles.sub}>Tap at least {MIN_PICKS} films, and we’ll learn your taste from them.</Text>
            {!movies ? (
              <ActivityIndicator color="#fff" style={{ marginTop: 50 }} />
            ) : (
              <ScrollView style={{ flex: 1, marginTop: 14 }} contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
                {movies.map((m) => (
                  <Poster key={m.id} movie={m} selected={picked.includes(m.id)} onPress={() => togglePick(m.id)} />
                ))}
              </ScrollView>
            )}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.primary, picked.length < MIN_PICKS && styles.primaryOff]}
                disabled={picked.length < MIN_PICKS || busy}
                onPress={saveTaste}
              >
                {busy ? <ActivityIndicator color="#000" /> : (
                  <Text style={[styles.primaryText, picked.length < MIN_PICKS && styles.primaryTextOff]}>
                    {picked.length < MIN_PICKS ? `${MIN_PICKS - picked.length} more to go` : 'Continue'}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.skip} onPress={() => goTo(providers.length ? 'services' : 'alerts')}>
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {step === 'services' ? (
          <>
            <Text style={styles.title}>What do you pay for?</Text>
            <Text style={styles.sub}>We’ll show where each film is streaming, and tell you when your watchlist arrives.</Text>
            <ScrollView style={{ flex: 1, marginTop: 16 }} showsVerticalScrollIndicator={false}>
              <View style={styles.providerWrap}>
                {providers.map((p) => {
                  const on = mine.includes(p.id);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.provider, on && styles.providerOn]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setMine((m) => (on ? m.filter((x) => x !== p.id) : [...m, p.id]));
                      }}
                    >
                      {p.logo_url ? <Image source={{ uri: p.logo_url }} style={styles.providerLogo} /> : null}
                      <Text style={[styles.providerName, on && { color: '#000' }]} numberOfLines={1}>{p.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <View style={styles.footer}>
              <TouchableOpacity style={styles.primary} onPress={saveServices}>
                <Text style={styles.primaryText}>{mine.length ? 'Continue' : 'I’ll choose later'}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {step === 'alerts' ? (
          <>
            <Text style={styles.title}>One good pick a night</Text>
            <Text style={styles.sub}>No spam. Just tonight’s film, and a heads-up when your watchlist reaches your services.</Text>
            <View style={styles.preview}>
              <View style={styles.previewIcon}><Feather name="moon" size={18} color="#000" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewTitle}>Tonight’s pick: Interstellar</Text>
                <Text style={styles.previewBody}>Picked for your taste.</Text>
              </View>
            </View>
            <View style={{ flex: 1 }} />
            <View style={styles.footer}>
              <TouchableOpacity style={styles.primary} disabled={busy} onPress={() => finishSetup(true)}>
                {busy ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryText}>Turn on notifications</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.skip} disabled={busy} onPress={() => finishSetup(false)}>
                <Text style={styles.skipText}>Not now</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {step === 'done' ? (
          <>
            <Text style={styles.title}>You’re in{name ? `, ${name}` : ''}.</Text>
            <Text style={styles.sub}>{picks.length ? 'We already have a few films for you.' : 'Start swiping and your picks will show up here.'}</Text>
            <View style={styles.grid}>
              {picks.map((m) => (
                <View key={m.id} style={styles.posterCell}>
                  <View style={styles.poster}><Image source={{ uri: m.poster_url }} style={StyleSheet.absoluteFill} /></View>
                </View>
              ))}
            </View>
            <View style={{ flex: 1 }} />
            <View style={styles.footer}>
              <TouchableOpacity style={styles.primary} onPress={enterApp}>
                <Text style={styles.primaryText}>Start exploring</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  bars: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingTop: 12 },
  bar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: '#2a2a2a' },
  barOn: { backgroundColor: '#fff' },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  title: { color: '#fff', fontSize: 30, fontWeight: '700', letterSpacing: -0.6, lineHeight: 36 },
  sub: { color: '#a3a3a3', fontSize: 15, lineHeight: 22, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, paddingBottom: 12, marginTop: 10 },
  posterCell: { width: '33.33%', padding: 5 },
  poster: { aspectRatio: 2 / 3, borderRadius: 12, overflow: 'hidden', backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: 'transparent' },
  posterOn: { borderColor: '#fff' },
  check: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  footer: { paddingTop: 10, paddingBottom: 14 },
  primary: { minHeight: 54, borderRadius: 27, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  primaryOff: { backgroundColor: '#222' },
  primaryText: { color: '#000', fontSize: 16, fontWeight: '700' },
  primaryTextOff: { color: '#8a8a8a' },
  skip: { alignItems: 'center', padding: 14 },
  skipText: { color: '#a3a3a3', fontSize: 14 },
  providerWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  provider: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 8, paddingRight: 14, borderRadius: 14, backgroundColor: '#1a1a1a' },
  providerOn: { backgroundColor: '#fff' },
  providerLogo: { width: 32, height: 32, borderRadius: 8 },
  providerName: { color: '#fff', fontSize: 14, fontWeight: '500', maxWidth: 170 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 28, padding: 14, borderRadius: 20, backgroundColor: '#1c1c1c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  previewIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  previewTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  previewBody: { color: '#aaa', fontSize: 13, marginTop: 2 },
});
