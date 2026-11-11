import { Tabs } from 'expo-router';
import React from 'react';
import { Feather } from '@expo/vector-icons';

import DockTabBar from '@/components/DockTabBar';
import ScreenWrapper from '@/components/ScreenWrapper';
import { enableScreens } from 'react-native-screens';


enableScreens();

export default function TabLayout() {
  return (

       <Tabs
      // Floating frosted-glass dock (components/DockTabBar.tsx). Screens run
      // underneath it and pad their content with useDockSpace().
      tabBar={(props) => <DockTabBar {...props} />}
      // Back from a hidden screen (settings, friends...) returns to where you were.
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#000' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
        }}
      />
      
      <Tabs.Screen
        name="watchlist"
        options={{
          title: 'Watchlist',
          tabBarIcon: ({ color, size }) => <Feather name="bookmark" color={color} size={size} />,
        }}
      />

      {/* SHORTS TAB - COMMENTED OUT - NOT NEEDED CURRENTLY */}
      {/* <Tabs.Screen
        name="shorts"
        options={{
          title: 'Shorts',
          tabBarIcon: ({ color, size }) => <Feather name="play-circle" color={color} size={size} />,
        }}
      /> */}
      
      <Tabs.Screen
        name="tinder"
        options={{
          title: 'Tinder',
          tabBarIcon: ({ color, size }) => <Feather name="search" color={color} size={size} />,
        }}
      />
      
      <Tabs.Screen
        name="mood"
        options={{
          title: 'Mood',
          tabBarIcon: ({ color, size }) => <Feather name="smile" color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} />,
        }}
      />

      {/* Opened from Profile and Home. No dock button of their own, but the dock stays visible. */}
      <Tabs.Screen name="settings" options={{ href: null, title: 'Settings' }} />
      <Tabs.Screen name="friends" options={{ href: null, title: 'Friends' }} />
      <Tabs.Screen name="notifications" options={{ href: null, title: 'Notifications' }} />
     </Tabs>

   
  );
}