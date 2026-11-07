import { HapticTab } from '@/components/HapticTab';
import { TabIcon, TabLabel, color, hairline, motion } from '@/ui';
import { type IconName } from '@/ui';
import { Tabs } from 'expo-router';
import React from 'react';

type TabSpec = { name: string; title: string; icon: IconName };

const TABS: TabSpec[] = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'tinder', title: 'Swipe', icon: 'layers' },
  { name: 'mood', title: 'Mood', icon: 'smile' },
  { name: 'watchlist', title: 'Watchlist', icon: 'bookmark' },
  { name: 'profile', title: 'Profile', icon: 'user' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { backgroundColor: color.bg, borderTopColor: color.divider, borderTopWidth: hairline },
        sceneStyle: { backgroundColor: color.bg },
        // Tabs crossfade in 150ms so switching feels instant.
        animation: 'fade',
        transitionSpec: { animation: 'timing', config: { duration: motion.duration.fast, easing: motion.easingRN.enter } },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => <TabIcon name={tab.icon} focused={focused} />,
            tabBarLabel: ({ focused }) => <TabLabel label={tab.title} focused={focused} />,
          }}
        />
      ))}
    </Tabs>
  );
}
