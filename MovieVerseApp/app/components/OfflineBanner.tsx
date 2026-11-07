import { Text, color, icon, space , Icon } from '@/ui';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { refreshOfflineData } from '../services/movieData';
import { subscribeToReconnect, useOnline } from '../services/network';
import { flushOutbox } from '../services/outbox';

const SYNCED_MS = 2500;

/** A quiet strip while offline; reconnecting sends anything that was waiting. */
const OfflineBanner = () => {
  const online = useOnline();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    flushOutbox().catch(() => {});
    return subscribeToReconnect(async () => {
      const sent = await flushOutbox().catch(() => 0);
      await refreshOfflineData().catch(() => {});
      if (sent > 0) {
        setSynced(true);
        setTimeout(() => setSynced(false), SYNCED_MS);
      }
    });
  }, []);

  if (online && !synced) return null;
  return (
    <View style={[styles.bar, online && styles.synced]} accessibilityLiveRegion="polite">
      <Icon name={online ? 'check' : 'wifi-off'} size={icon.inline} color={online ? color.inverse : color.text} />
      <Text variant="caption" tone={online ? 'inverse' : 'primary'}>
        {online ? 'Back online. Changes saved.' : 'Offline. Changes will sync later.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingVertical: space.sm, backgroundColor: color.raised },
  synced: { backgroundColor: color.text },
});

export default OfflineBanner;
