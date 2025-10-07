import { Image } from "expo-image";
import { StyleProp, ImageStyle } from "react-native";

interface LarkLogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}
export function LarkLogo({ size = 120, style }: LarkLogoProps) {
  return (
    <Image
      source={require('../../../assets/images/Logo_lark.png')}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
    />
  );
}