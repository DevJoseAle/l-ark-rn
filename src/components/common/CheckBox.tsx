import { ThemeColors } from "@/constants/theme";
import { useThemeColors } from "@/hooks/use-theme-color";
import { createLoginStyles } from "@/src/features/auth/styles/loginStyles";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";

interface CheckboxProps {
  setFn: (...args: any[]) => void;
  isValid?: boolean;
  text?: string;
  size?: number;
}

const CheckBox = ({ 
  setFn, 
  isValid, 
  text,
  size = 16
}: CheckboxProps) => {
  const colors = useThemeColors();
  const {checkboxText: checkboxStyle, checkboxChecked, checkboxContainer, checkbox} = checkboxText(colors);
  return (
    <TouchableOpacity
      style={checkboxContainer}
      onPress={() => setFn()}
      activeOpacity={0.7}
    >
      <View style={[
        checkbox,
        isValid && checkboxChecked
      ]}>
        {isValid && (
          <Ionicons name="checkmark" size={size} color={colors.invertedText} />
        )}
      </View>
      <Text style={checkboxStyle}>
      {text}
      </Text>
    </TouchableOpacity> 
  )
}

export default CheckBox

const checkboxText = (colors: ThemeColors, isCentered?: boolean ) => StyleSheet.create({
  checkboxText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 20,
  },
   checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent:'center',
    alignSelf:'center',
    marginBottom: 10,
    paddingHorizontal: 4,
    
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.secondaryText,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

}) 