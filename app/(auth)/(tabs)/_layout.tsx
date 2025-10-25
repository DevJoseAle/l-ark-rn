// app/(tabs)/_layout.tsx
import CustomTabBar from '@/src/components/common/CustomTabBar';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 90 : 80,
        },
      }}
    >
      <Tabs.Screen
        name="arkHome"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="vaultHome"
        options={{
          title: 'Vault',
        }}
      />
       <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
        }}
      /> 
       <Tabs.Screen
        name="favorites"
        options={{
          title: 'Search',
        }}
      /> 
      <Tabs.Screen
        name="profileHome"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
}