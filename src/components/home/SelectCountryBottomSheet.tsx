// src/components/home/SelectCountryBottomSheet.tsx
import React, { act, forwardRef, useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { FlatList } from 'react-native-gesture-handler';
import {
  COUNTRIES,
  CountryCode,
  getCountryFlag,
  getCountryName,
} from '@/src/types/campaign-create.types';
import { useExchangeRatesStore } from '@/src/stores/exchangeRates.store';
import { Colors } from '@/constants/theme';

type SelectCountryBottomSheetProps = {};

const SelectCountryBottomSheet = forwardRef<BottomSheetModal, SelectCountryBottomSheetProps>(
  (props, ref) => {
    const snapPoints = useMemo(() => ['90%'], []);
    const actualCountry = useExchangeRatesStore((state) => state.country);
    const countryList = (actualCountry: string) => {
      return COUNTRIES.filter((country) => country.code != actualCountry);
    };
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const setCountry = useExchangeRatesStore((state) => state.setCountry);

    const disabledBtn = selectedCountry === null;
    const renderBackdrop = useCallback(
      (backdropProps: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={0} // aparece cuando el sheet está abierto
          disappearsOnIndex={-1} // desaparece cuando está cerrado
          pressBehavior="close" // tap fuera => cierra
          opacity={0.6} // nivel de oscurecido
        />
      ),
      []
    );
    const handleSubmit = (country: CountryCode) => {
      if (!selectedCountry) return;
      setCountry(country ?? 'US');
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
    };
    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onDismiss={() => setSelectedCountry(null)}
      >
        <BottomSheetView style={styles.content}>
          <FlatList
            ListHeaderComponent={<ListHeaderComponent />}
            style={{ flex: 1, width: '100%' }}
            data={countryList(actualCountry)}
            renderItem={({ item }) => (
              <BottomListItem
                country={item.code}
                setCty={setSelectedCountry}
                isSelected={selectedCountry === item.code}
              />
            )}
            keyExtractor={(item) => item.code}
            ListFooterComponent={
              <SelectButton
                disabled={disabledBtn}
                setCountry={handleSubmit}
                country={selectedCountry}
                ref={ref}
              />
            }
            ListFooterComponentStyle={{ marginTop: 70 }}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '70%',
  },
});

export default SelectCountryBottomSheet;

interface ListItemProps {
  country: any;
  setCty: any;
  isSelected?: boolean;
}

const ListHeaderComponent = () => {
  return (
    <>
      <Text style={{ fontSize: 30, fontWeight: 'bold', marginVertical: 10, marginLeft: 25 }}>
        Select Country
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontWeight: 'light',
          fontStyle: 'italic',
          marginVertical: 3,
          marginLeft: 15,
          color: Colors.light.secondaryText,
        }}
      >
        Al cambiar de pais, verás los montos en moneda local de ese país,
      </Text>
    </>
  );
};

const BottomListItem = ({ country, setCty, isSelected }: ListItemProps) => {
  const code = country;
  const flag = getCountryFlag(code);
  const name = getCountryName(code);

  return (
    <TouchableOpacity
      style={{
        paddingVertical: 20,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',

        backgroundColor: isSelected ? Colors.light.info : 'white',
      }}
      activeOpacity={0.6}
      onPress={() => {
        setCty(code);
      }}
    >
      <View>
        <Text style={{ fontSize: 30, marginLeft: 10 }}>{flag}</Text>
      </View>
      <Text style={{ fontSize: 18, marginLeft: 10, color: isSelected ? 'white' : 'black' }}>
        {name} ({code})
      </Text>
    </TouchableOpacity>
  );
};

const SelectButton = ({
  disabled,
  setCountry,
  country,
  ref,
}: {
  disabled: boolean;
  setCountry: (country: CountryCode) => void;
  country: any;
  ref: React.ForwardedRef<BottomSheetModal>;
}) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: disabled ? Colors.light.disabled : Colors.light.info,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        margin: 20,
      }}
      onPress={() => setCountry(country)}
    >
      <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Select</Text>
    </TouchableOpacity>
  );
};
