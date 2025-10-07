// src/constants/Colors.ts

const tintColorLight = '#4BA3D9';
const tintColorDark = '#89C9F0';

export const Colors = {
  light: {
    // Texto
    text: '#0A1521',              // Texto principal oscuro
    invertedText: '#FBFCFB',      // Texto invertido (para fondos oscuros)
    secondaryText: '#687076',     // Texto secundario
    customWhite: '#FBFCFB',
    customGray: '#515151',
    customBlack: '#0A1521',
    // Gradiente de fondo
    gradientTop: '#F8FBFF',
    gradientMiddle: '#D6E4F5',
    gradientBottom: '#ACCAE7',
    
    // Backgrounds
    background: '#FBFCFB',
    cardBackground: '#FBFCFB',
    surfaceBackground: '#FBFCFB',
    
    // Tint y accent
    tint: tintColorLight,
    primary: '#4BA3D9',
    secondary: '#ACCAE7',
    
    // Iconos
    icon: '#687076',
    iconActive: tintColorLight,
    
    // Tabs
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    tabBackground: '#FFFFFF',
    
    // UI Elements
    border: '#E0E0E0',
    separator: '#D6E4F5',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Status
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },
  
  dark: {
    // Texto
    text: '#FBFCFB',              // Texto principal claro
    invertedText: '#0A1521',      // Texto invertido (para fondos claros)
    secondaryText: '#9BA1A6',     // Texto secundario
    customWhite: '#FBFCFB',
    customGray: '#515151',
    customBlack: '#0A1521',
    
    // Gradiente de fondo
    gradientTop: '#1E2A36',
    gradientMiddle: '#223344',
    gradientBottom: '#0D1B2A',
    
    // Backgrounds
    background: '#0D1B2A',
    cardBackground: '#1E2A36',
    surfaceBackground: '#223344',
    
    // Tint y accent
    tint: tintColorDark,
    primary: '#89C9F0',
    secondary: '#4BA3D9',
    
    // Iconos
    icon: '#9BA1A6',
    iconActive: tintColorDark,
    
    // Tabs
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    tabBackground: '#1E2A36',
    
    // UI Elements
    border: '#2A3F54',
    separator: '#223344',
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // Status
    success: '#66BB6A',
    error: '#EF5350',
    warning: '#FFA726',
    info: '#42A5F5',
  },
};

// Tipo TypeScript para autocomplete
export type ThemeColors = typeof Colors.light;