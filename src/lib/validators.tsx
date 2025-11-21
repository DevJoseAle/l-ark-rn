export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export const isValidOTPArray = (otp: string[]): boolean => {
  return otp.length === 6 && otp.every((digit) => /^\d$/.test(digit));
};
