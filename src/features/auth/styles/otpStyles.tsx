// src/features/auth/styles/otpStyles.ts
import { StyleSheet } from 'react-native';
import { ThemeColors } from '@/constants/theme';

export const createOTPStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  
  // Header
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 4,
  },

  // Logo section
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Heading
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },

  // Description
  description: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 32,
  },

  // OTP Input
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.cardBackground,
  },

  // Input label
  inputLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 32,
  },

  // Confirm button
  confirmButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.invertedText,
  },
  confirmButtonTextDisabled: {
    color: colors.secondaryText,
  },

  // Resend link
  resendContainer: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  resendText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
});