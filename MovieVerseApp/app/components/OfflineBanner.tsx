import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { flushOutbox } from '../services/outbox';
import { refreshOfflineData } from '../services/movieData';
import { subscribeToReconnect, useOnline } from '../services/network';

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
        setTimeout(() => setSynced(false), 2500);
      }
    });
  }, []);

  if (online && !synced) return null;
  return (
    <View style={[styles.bar, online && styles.barSynced]}>
      <Feather name={online ? 'check' : 'wifi-off'} size={13} color={online ? '#000' : '#fff'} />
      <Text style={[styles.text, online && styles.textSynced]}>
        {online ? 'Back online. Your changes are saved.' : "You're offline. Changes will sync later."}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 6, backgroundColor: '#222' },
  barSynced: { backgroundColor: '#fff' },
  text: { color: '#fff', fontSize: 12, fontWeight: '500' },
  textSynced: { color: '#000' },
});

export default OfflineBanner;
