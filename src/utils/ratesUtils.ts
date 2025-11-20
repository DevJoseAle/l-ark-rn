import { useExchangeRatesStore } from "../stores/exchangeRates.store";
import { CountryCode } from "../types/campaign-create.types";
import { Formatters } from "./formatters";


export const fromUSDtoCurrencyString = (amount: number, country: CountryCode): string => {
    const {mxnRate, clpRate, copRate} = useExchangeRatesStore.getState()
    switch (country) {
        case 'CL':
            return Formatters.formatCLPInput(`${amount * clpRate}`);
        case 'MX':
            return Formatters.formatCLPInput(`${amount * mxnRate}`);
        case 'CO':
            return Formatters.formatCLPInput(`${amount * copRate}`);
        case 'US':
            return Formatters.formatCLPInput(`${amount}`);
    }
}
export const fromUSDNumberToCurrencyString = (amount: string, country: CountryCode): string => {
    const {mxnRate, clpRate, copRate} = useExchangeRatesStore.getState()
    const newAmount = Number(Formatters.unformatCLP(amount))
    switch (country) {
        case 'CL':
            return Formatters.formatCLPInput(`${newAmount * clpRate}`);
        case 'MX':
            return Formatters.formatCLPInput(`${newAmount * mxnRate}`);
        case 'CO':
            return Formatters.formatCLPInput(`${newAmount * copRate}`);
        case 'US':
            return Formatters.formatCLPInput(`${newAmount}`);
    }
}
export const fromUSDtoCurrencyNumber = (amount: number, country: CountryCode): number => {
    const {mxnRate, clpRate, copRate} = useExchangeRatesStore.getState()
    switch (country) {
        case 'CL':
            return amount * clpRate;
        case 'MX':
            return amount * mxnRate;
        case 'CO':
            return amount * copRate;
        case 'US':
            return amount;
    }
}

export const fromCurrencyToUSDNumber = (amount: number, country: CountryCode): number => {
    const {mxnRate, clpRate, copRate} = useExchangeRatesStore.getState()
    switch (country) {
        case 'CL':
            return amount / clpRate;
        case 'MX':
            return amount / mxnRate;
        case 'CO':
            return amount / copRate;
        case 'US':
            return amount;
    }
}