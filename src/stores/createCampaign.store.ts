import { create } from "zustand";
import { CampaignCreateService } from "../services/createCampaign.service";
import { CreateCampaignFormData, UploadProgress, ValidationError, LocalImage, CampaignBeneficiary, CountryCode } from "../types/campaign-create.types";
import { CampaignValidations } from "../utils/campaignValidations";
import { MAX_AMOUNTS_BY_COUNTRY, MIN_AMOUNTS_BY_COUNTRY } from "../utils/campaingConstants";
import { useExchangeRatesStore } from "./exchangeRates.store";
import { fromCurrencyToUSDNumber } from "../utils/ratesUtils";
import { Formatters } from "../utils/formatters";


interface CreateCampaignStore {
  // State
  formData: CreateCampaignFormData;
  uploadProgress: Record<string, UploadProgress>;
  isSubmitting: boolean;
  errors: ValidationError[];
  currentStep: string;
  progress: number;
  country: CountryCode;
  maxGoalAmount: () => string;
  minGoalAmount: () => string;

  // Actions - Form Data
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setHasDiagnosis: (hasDiagnosis: boolean) => void;
  setCountry: (country: CountryCode) => void;
  setGoalAmount: (amount: string) => void;
  setSoftCap: (amount: string) => void;
  setHardCap: (amount: string) => void;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setVisibility: (visibility: CreateCampaignFormData['visibility']) => void;
  setDistributionRule: (rule: CreateCampaignFormData['distributionRule']) => void;

  // Actions - Images
  addCampaignImage: (image: LocalImage) => void;
  removeCampaignImage: (imageId: string) => void;
  addDiagnosisImage: (image: LocalImage) => void;
  removeDiagnosisImage: (imageId: string) => void;

  // Actions - Beneficiaries
  addBeneficiary: (beneficiary: CampaignBeneficiary) => void;
  removeBeneficiary: (beneficiaryId: string) => void;
  updateBeneficiaryShare: (beneficiaryId: string, shareValue: number) => void;
  addBeneficiaryDocument: (beneficiaryId: string, document: LocalImage) => void;
  updateBeneficiaryCountry: (beneficiaryId: string, country: CountryCode) => void; // 👈 NUEVO
  removeBeneficiaryDocument: (beneficiaryId: string, documentId: string) => void;

  // Actions - Validation
  validateForm: () => boolean;
  clearErrors: () => void;

  // Actions - Submit
  submitCampaign: () => Promise<void>;
  reset: () => void;
  resetAmounts: () => void
}

const initialFormData: CreateCampaignFormData = {
  title: '',
  description: '',
  hasDiagnosis: false,
  campaignImages: [],
  diagnosisImages: [],
  goalAmount: '',
  softCap: '',
  hardCap: '',
  currency: 'USD',
  startDate: new Date(),
  endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // +3 meses
  visibility: 'public',
  distributionRule: 'percentage',
  beneficiaries: [],
  country: 'US',
};

export const useCreateCampaignStore = create<CreateCampaignStore>((set, get) => ({
  // Initial state
  formData: initialFormData,
  uploadProgress: {},
  isSubmitting: false,
  errors: [],
  currentStep: '',
  progress: 0,
  country: 'US',

  // Form Data Actions
  setTitle: (title) => {
    set((state) => ({
      formData: { ...state.formData, title },
      errors: state.errors.filter((e) => e.field !== 'title'),
    }));
  },

  setDescription: (description) => {
    set((state) => ({
      formData: { ...state.formData, description },
      errors: state.errors.filter((e) => e.field !== 'description'),
    }));
  },

  setHasDiagnosis: (hasDiagnosis) => {
    set((state) => ({
      formData: {
        ...state.formData,
        hasDiagnosis,
        diagnosisImages: hasDiagnosis ? state.formData.diagnosisImages : [],
      },
    }));
  },

  setGoalAmount: (amount) => {
    set((state) => ({
      formData: { ...state.formData, goalAmount: amount },
      errors: state.errors.filter((e) => e.field !== 'goalAmount'),
    }));
  },

  setSoftCap: (amount) => {
    set((state) => ({
      formData: { ...state.formData, softCap: amount },
      errors: state.errors.filter((e) => e.field !== 'softCap'),
    }));
  },

  setHardCap: (amount) => {
    set((state) => ({
      formData: { ...state.formData, hardCap: amount },
      errors: state.errors.filter((e) => e.field !== 'hardCap'),
    }));
  },

  setStartDate: (date) => {
    set((state) => ({
      formData: { ...state.formData, startDate: date },
      errors: state.errors.filter((e) => e.field !== 'startDate'),
    }));
  },
    setCountry: (country) => {
    set((state) => ({
      formData: { ...state.formData, country },
      errors: state.errors.filter((e) => e.field !== 'country'),
    }));
  },

  setEndDate: (date) => {
    set((state) => ({
      formData: { ...state.formData, endDate: date },
      errors: state.errors.filter((e) => e.field !== 'endDate'),
    }));
  },

  setVisibility: (visibility) => {
    set((state) => ({
      formData: { ...state.formData, visibility },
    }));
  },

  setDistributionRule: (rule) => {
    set((state) => ({
      formData: { ...state.formData, distributionRule: rule },
    }));
  },

  // Image Actions
  addCampaignImage: (image) => {
    set((state) => {
      if (state.formData.campaignImages.length >= 3) {
        return state; // Máximo 3 imágenes
      }
      return {
        formData: {
          ...state.formData,
          campaignImages: [...state.formData.campaignImages, image],
        },
        errors: state.errors.filter((e) => e.field !== 'campaignImages'),
      };
    });
  },

  removeCampaignImage: (imageId) => {
    set((state) => ({
      formData: {
        ...state.formData,
        campaignImages: state.formData.campaignImages.filter((img) => img.id !== imageId),
      },
    }));
  },

  addDiagnosisImage: (image) => {
    set((state) => {
      if (state.formData.diagnosisImages.length >= 3) {
        return state; // Máximo 3 imágenes
      }
      return {
        formData: {
          ...state.formData,
          diagnosisImages: [...state.formData.diagnosisImages, image],
        },
        errors: state.errors.filter((e) => e.field !== 'diagnosisImages'),
      };
    });
  },

  removeDiagnosisImage: (imageId) => {
    set((state) => ({
      formData: {
        ...state.formData,
        diagnosisImages: state.formData.diagnosisImages.filter((img) => img.id !== imageId),
      },
    }));
  },

  // Beneficiary Actions
  addBeneficiary: (beneficiary) => {
    set((state) => {
      if (state.formData.beneficiaries.length >= 3) {
        return state; // Máximo 3 beneficiarios
      }
      return {
        formData: {
          ...state.formData,
          beneficiaries: [...state.formData.beneficiaries, beneficiary],
        },
        errors: state.errors.filter((e) => e.field !== 'beneficiaries'),
      };
    });
  },

  removeBeneficiary: (beneficiaryId) => {
    set((state) => ({
      formData: {
        ...state.formData,
        beneficiaries: state.formData.beneficiaries.filter((b) => b.id !== beneficiaryId),
      },
    }));
  },

  updateBeneficiaryShare: (beneficiaryId, shareValue) => {
    set((state) => ({
      formData: {
        ...state.formData,
        beneficiaries: state.formData.beneficiaries.map((b) =>
          b.id === beneficiaryId ? { ...b, shareValue } : b
        ),
      },
    }));
  },
  updateBeneficiaryCountry: (beneficiaryId, country) => {
    set((state) => ({
      formData: {
        ...state.formData,
        beneficiaries: state.formData.beneficiaries.map((b) =>
          b.id === beneficiaryId ? { ...b, country } : b
        ),
      },
      errors: state.errors.filter((e) => e.field !== `beneficiary-${beneficiaryId}-country`),
    }));
  },

  addBeneficiaryDocument: (beneficiaryId, document) => {
    set((state) => ({
      formData: {
        ...state.formData,
        beneficiaries: state.formData.beneficiaries.map((b) => {
          if (b.id === beneficiaryId && b.documents.length < 3) {
            return { ...b, documents: [...b.documents, document] };
          }
          return b;
        }),
      },
    }));
  },

  removeBeneficiaryDocument: (beneficiaryId, documentId) => {
    set((state) => ({
      formData: {
        ...state.formData,
        beneficiaries: state.formData.beneficiaries.map((b) => {
          if (b.id === beneficiaryId) {
            return {
              ...b,
              documents: b.documents.filter((doc) => doc.id !== documentId),
            };
          }
          return b;
        }),
      },
    }));
  },

  // Validation
  validateForm: () => {
    const { formData, } = get();
    const country = formData.country;
    const result = CampaignValidations.validateForm(formData, country);
    set({ errors: result.errors });
    return result.isValid;
  },

  clearErrors: () => {
    set({ errors: [] });
  },

  // Submit
  submitCampaign: async () => {
    let { formData, validateForm,  } = get();
    const actualAmount  = Number(Formatters.unformatCLP(formData.goalAmount))
    const actualSoftCap  = Number(Formatters.unformatCLP(formData.softCap))
    const actualHardCap  = Number(Formatters.unformatCLP(formData.hardCap))
    const amountInUsd = Math.trunc(fromCurrencyToUSDNumber(actualAmount, formData.country))
    const softCapInUsd = Math.trunc(fromCurrencyToUSDNumber(actualSoftCap, formData.country))
    const hardCapInUsd = Math.trunc(fromCurrencyToUSDNumber(actualHardCap, formData.country))
    let newformData = {...formData, softCap: softCapInUsd.toString(), hardCap: hardCapInUsd.toString(), goalAmount: amountInUsd.toString() }
    
    // Validar formulario
    if (!validateForm()) {
      throw new Error('Formulario inválido');
    }

    set({ isSubmitting: true, currentStep: 'Iniciando', progress: 0 });
    try {
       await CampaignCreateService.createCampaign(
         newformData,
         (step, progress) => {
           set({ currentStep: step, progress });
         }
       );

       // Reset form on success
       get().reset();
    } catch (error) {
      console.error('Error submitting campaign:', error);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },
  maxGoalAmount: () => {
    const country = get().formData.country;
    const mxnRate = useExchangeRatesStore.getState().mxnRate;
    const clpRate = useExchangeRatesStore.getState().clpRate;
    const copRate = useExchangeRatesStore.getState().copRate;
    switch (country) {
      case 'US': return `${MAX_AMOUNTS_BY_COUNTRY.US}`;
      case 'MX': return `${MAX_AMOUNTS_BY_COUNTRY.MX * mxnRate}`;
      case 'CL': return `${MAX_AMOUNTS_BY_COUNTRY.CL * clpRate}`;
      case 'CO': return `${MAX_AMOUNTS_BY_COUNTRY.CO * copRate}`;
    }
  },
  minGoalAmount: () => {
    const country = get().formData.country;
    const mxnRate = useExchangeRatesStore.getState().mxnRate;
    const clpRate = useExchangeRatesStore.getState().clpRate;
    const copRate = useExchangeRatesStore.getState().copRate;
    switch (country) {
      case 'US': return `${MIN_AMOUNTS_BY_COUNTRY.US}`;
      case 'MX': return `${MIN_AMOUNTS_BY_COUNTRY.MX * mxnRate}`;
      case 'CL': return `${MIN_AMOUNTS_BY_COUNTRY.CL * clpRate}`;
      case 'CO': return `${MIN_AMOUNTS_BY_COUNTRY.CO * copRate}`;
    }
  },


  // Reset
  reset: () => {
    set({
      formData: initialFormData,
      uploadProgress: {},
      isSubmitting: false,
      errors: [],
      currentStep: '',
      progress: 0,
    });
  },
  resetAmounts: () =>{
    set({
      formData: {
        ...get().formData,
        goalAmount: '',
        softCap: '',
        hardCap: '',
      }
    })
  }
}));