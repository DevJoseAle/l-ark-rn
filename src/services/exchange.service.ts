import { Tables } from "@/supabaseTypes/supabase";
import { supabase } from "../lib/supabaseClient";
import { ExchangeRates } from "../types/exchange.types";

interface ExchangeServiceResponse {
    success: boolean;
    data?: ExchangeRates;
    error?: string;
}

export class ExchangeService {

    static async getExchangeRates(): Promise<ExchangeServiceResponse> {
        try {
            let { data: exchange_rates, error } = await supabase
                .from('exchange_rates')
                .select('*')
                .order('date', { ascending: false })
                .limit(1)
                .single()
            if (error) {
                throw new Error('Error al consultar Tasa de cambio')
            }
            return {
                success: true, 
                data: exchange_rates 
            }
        } catch (error) {
            return {
                success: false, 
                error: error instanceof Error ? error.message : 'Error desconocido'
            }
        }
    }

}