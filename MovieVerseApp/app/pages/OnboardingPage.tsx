import {
  BottomBar,
  Button,
  Card,
  Chip,
  IconBadge,
  ListRow,
  PosterGrid,
  PosterGridSkeleton,
  ProgressBar,
  Screen,
  Text,
  Touchable,
  color,
  gutter,
  icon,
  radius,
  space,
  usePosterColumnWidth,
  Icon,
} from '@/ui';
import { distance, duration, easing, exitDuration } from '@/ui/motion';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import api from '../auth/api';
import Image from '../components/CachedImage';
import { prefetchTabData } from '../services/movieData';
import { ONBOARDING_KEY, registerForPush } from '../services/push';

const MIN_PICKS = 3;
type Step = 'taste' | 'services' | 'alerts' | 'done';

const PickPoster = ({ movie, selected, onPress, width }: { movie: any; selected: boolean; onPress: () => void; width: number }) => {
  const on = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    on.value = withTiming(selected ? 1 : 0, { duration: duration.fast, easing: easing.enter });
  }, [selected, on]);
  const mark = useAnimatedStyle(() => ({ opacity: on.value }));
  return (
    <Touchable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} accessibilityLabel={movie.title}>
      <View style={[styles.pick, { width, height: width * 1.5 }]}>
        <Image source={{ uri: movie.poster_url }} style={StyleSheet.absoluteFill} />
        <Animated.View style={[StyleSheet.absoluteFill, styles.pickOn, mark]}>
          <View style={styles.check}>
            <Icon name="check" size={icon.inline} color={color.inverse} />
          </View>
        </Animated.View>
      </View>
    </Touchable>
  );
};

export default function OnboardingPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const columnWidth = usePosterColumnWidth();
  const [step, setStep] = useState<Step>('taste');
  const [name, setName] = useState('');
  const [movies, setMovies] = useState<any[] | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [mine, setMine] = useState<number[]>([]);
  const [picks, setPicks] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const shown = useSharedValue(1);

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

  // Old step leaves (fast, ease-in), new step fades and rises 8px (base, ease-out).
  const goTo = (next: Step) => {
    shown.value = withTiming(0, { duration: exitDuration.base, easing: easing.exit }, (done) => {
      if (!done) return;
      runOnJS(setStep)(next);
      shown.value = withTiming(1, { duration: duration.base, easing: easing.enter });
    });
  };
  const body = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: reduceMotion ? [] : [{ translateY: (1 - shown.value) * distance.rise }],
  }));

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

  const saveServices = () => {
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

  const remaining = MIN_PICKS - picked.length;
  const title = {
    taste: 'Pick films you love',
    services: 'Your streaming services',
    alerts: 'One pick each evening',
    done: name ? `You’re in, ${name}` : 'You’re in',
  }[step];

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.bars} accessibilityLabel={`Step ${progress} of ${steps.length}`}>
        {steps.map((_, i) => (
          <ProgressBar key={i} value={i < progress ? 1 : 0} style={styles.bar} />
        ))}
      </View>

      <Animated.View style={[styles.fill, body]}>
        <Text variant="title" style={styles.title}>
          {title}
        </Text>

        <ScrollView style={styles.fill} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {step === 'taste' ? (
            !movies ? (
              <PosterGridSkeleton />
            ) : (
              <View style={styles.grid}>
                {movies.map((m) => (
                  <PickPoster key={m.id} movie={m} width={columnWidth} selected={picked.includes(m.id)} onPress={() => togglePick(m.id)} />
                ))}
              </View>
            )
          ) : null}

          {step === 'services' ? (
            <View style={styles.chips}>
              {providers.map((p) => {
                const on = mine.includes(p.id);
                return (
                  <Chip
                    key={p.id}
                    label={p.name}
                    imageUri={p.logo_url}
                    selected={on}
                    onPress={() => setMine((m) => (on ? m.filter((x) => x !== p.id) : [...m, p.id]))}
                  />
                );
              })}
            </View>
          ) : null}

          {step === 'alerts' ? (
            <Card>
              <ListRow leading={<IconBadge name="moon" />} title="Tonight’s pick: Interstellar" subtitle="Picked for your taste" style={styles.preview} />
            </Card>
          ) : null}

          {step === 'done' && picks.length ? <PosterGrid movies={picks} showTitle={false} /> : null}
        </ScrollView>

        <BottomBar>
          {step === 'taste' ? (
            <>
              <Button
                title={remaining > 0 ? `Pick ${remaining} more` : 'Continue'}
                onPress={saveTaste}
                loading={busy}
                disabled={remaining > 0}
              />
              <Button variant="text" title="Skip" onPress={() => goTo(providers.length ? 'services' : 'alerts')} />
            </>
          ) : null}
          {step === 'services' ? (
            <>
              <Button title="Continue" onPress={saveServices} disabled={!mine.length} />
              <Button variant="text" title="Skip" onPress={() => goTo('alerts')} />
            </>
          ) : null}
          {step === 'alerts' ? (
            <>
              <Button title="Turn on notifications" onPress={() => finishSetup(true)} loading={busy} />
              <Button variant="text" title="Not now" onPress={() => finishSetup(false)} disabled={busy} />
            </>
          ) : null}
          {step === 'done' ? <Button title="Start watching" onPress={enterApp} /> : null}
        </BottomBar>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bars: { flexDirection: 'row', gap: space.sm, paddingHorizontal: gutter, paddingTop: space.lg },
  bar: { flex: 1 },
  title: { paddingHorizontal: gutter, paddingTop: space.xl, paddingBottom: space.xl },
  scroll: { paddingHorizontal: gutter, paddingBottom: space.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.md, rowGap: space.md },
  pick: { borderRadius: radius.container, overflow: 'hidden', backgroundColor: color.surface },
  pickOn: { borderWidth: 2, borderColor: color.text, borderRadius: radius.container, alignItems: 'flex-end', padding: space.sm },
  check: {
    width: space.xl,
    height: space.xl,
    borderRadius: radius.control,
    backgroundColor: color.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  preview: { paddingVertical: 0 },
});
