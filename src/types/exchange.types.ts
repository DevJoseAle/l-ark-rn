export interface ExchangeRates {
  id: string;
  date: Date;
  mxn_rate: number;
  cop_rate: number;
  clp_rate: number;
  source: string;
  created_at: Date;
  updated_at: Date;
}
