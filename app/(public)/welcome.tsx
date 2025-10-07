
import React from 'react'
import { GradientBackground } from '@/src/components/common/GradiendBackground'
import { LarkLogo } from '@/src/components/common/LarkLogo';
import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
export default function WelcomeScreen() {

  const router = useRouter()
  const colors = useThemeColors()


  return (
    <GradientBackground >
      <SafeAreaView>
        <View style={{ alignItems: 'center', justifyContent: 'center', height: '80%' }}>
          <LarkLogo size={250} />
          <Text style={{ color: colors.text, fontSize: 60, fontWeight: '500' }}>L-Ark</Text>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '500', fontStyle: 'italic' }}>Digital Heritage</Text>
        </View>
        <View style={{paddingHorizontal: 15}}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.customWhite,
              padding: 15,
              borderRadius: 20,
              alignItems: 'center',
              marginBottom: 20,
            }}
            onPress={() => router.push('/(public)/login')}>
            <Text style={{ color: colors.customGray, fontSize: 20, fontWeight: '400', }}>Iniciar Sesion</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(public)/login')}>
            <Text style={{ color: colors.customGray, fontSize: 20, fontWeight: '400' }}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GradientBackground>
  )
}
