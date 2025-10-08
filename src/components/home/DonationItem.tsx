// src/components/home/DonationItem.tsx
import { ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DonationItemProps {
  donorName: string;
  date: string;
  amount: string;
  isAnonymous?: boolean;
}

export default function DonationItem({ 
  donorName, 
  date, 
  amount,
  isAnonymous = false 
}: DonationItemProps) {
    const colors = useThemeColors();
    const styles = donationItemStyles(colors)
  const initials = donorName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{donorName}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      
      <Text style={styles.amount}>{amount}</Text>
    </View>
  );
}

const donationItemStyles = (color: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E5DB5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  info: {
    flex: 1,
  },
  name: {
    color: color.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    color: color.text,
    opacity: 0.75,
    fontSize: 13,
  },
  amount: {
    color: color.text,
    opacity: 0.75,
    fontSize: 16,
    fontWeight: '700',
  },
});