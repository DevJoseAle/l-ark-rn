

import { ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ButtonXLProps {
    title: string;
    mode?: 'void' | 'warning' | 'danger' | 'default';
    icon?: any;
    action: VoidFunction;
    size?: number;
}

export default function ButtonXL({
    title,
    mode = 'default',
    icon,
    action,
    size = 20
}: ButtonXLProps) {
    const colors = useThemeColors();
    const styles = newStyles(colors, mode)
    return (
        <TouchableOpacity
            style={styles.button}
            onPress={action}
            activeOpacity={0.8}
        >
            <Text style={styles.buttonText}>{title}</Text>
           {
            icon &&  <Ionicons name={icon} size={size} color={colors.invertedText} />
           }
        </TouchableOpacity>
    )
}

const newStyles = (colors: ThemeColors, mode: 'void' | 'warning' | 'danger' | 'default') => {

    let background;
    let borderColor;
    let textColor = 'white';
    switch (mode) {
        case 'danger':
            background = colors.error
            break;
        case 'warning':
            background = colors.warning
            break;
        case 'void':
            background = colors.customWhite
            borderColor = colors.error
            textColor = colors.customBlack
            break;
        default:
            background = colors.info
            break;
    }
    return StyleSheet.create({
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: background,
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 12,
            borderColor: borderColor,
            borderWidth: borderColor != undefined ? 0.4 : 0,
            marginBottom: 16,
            width: '100%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
            color: textColor,
            marginRight: 8,
        },
    });
}