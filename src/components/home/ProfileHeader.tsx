// src/components/profile/ProfileHeader.tsx
// VERSIÓN CORREGIDA - Sin avatar

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  displayName: string;
  email: string;
  country: string | null;
  onEdit: () => void;
}



export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  displayName,
  email,
  country,
  onEdit,
}) => {
  const {t:translate} = useTranslation("common")


  const getCountryFlag = (country: string | null): string => {
    const flags: Record<string, string> = {
      US: '🇺🇸',
      MX: '🇲🇽',
      CO: '🇨🇴',
      CL: '🇨🇱',
      ES: '🇪🇸',
    };
    return country ? flags[country] || '🌎' : '🌎';
  };

  const getCountryName = (country: string | null): string => {
    const names: Record<string, string> = {
      US: translate("countries.US"),
      MX: translate("countries.MX"),
      CO: translate("countries.CO"),
      CL: translate("countries.CL"),
      ES: translate("countries.ES"),
    };
    return country ? names[country] || 'No especificado' : 'No especificado';
  };
  // Generar iniciales del nombre
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A2B4A', '#2A3F5F']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Avatar con iniciales */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{email}</Text>

            <View style={styles.countryBadge}>
              <Text style={styles.countryFlag}>{getCountryFlag(country)}</Text>
              <Text style={styles.countryName}>{getCountryName(country)}</Text>
            </View>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEdit}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 8,
  },
  gradient: {
    padding: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  countryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});