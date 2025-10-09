import { create } from "zustand";
import { CampaignCreateService } from "../services/createCampaign.service";
import { CreateCampaignFormData, UploadProgress, ValidationError, LocalImage, CampaignBeneficiary } from "../types/campaign-create.types";
import { CampaignValidations } from "../utils/campaignValidations";


interface CreateCampaignStore {
  // State
  formData: CreateCampaignFormData;
  uploadProgress: Record<string, UploadProgress>;
  isSubmitting: boolean;
  errors: ValidationError[];
  currentStep: string;
  progress: number;

  // Actions - Form Data
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setHasDiagnosis: (hasDiagnosis: boolean) => void;
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
  removeBeneficiaryDocument: (beneficiaryId: string, documentId: string) => void;

  // Actions - Validation
  validateForm: () => boolean;
  clearErrors: () => void;

  // Actions - Submit
  submitCampaign: () => Promise<void>;
  reset: () => void;
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
  currency: 'CLP',
  startDate: new Date(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +3 meses
  visibility: 'public',
  distributionRule: 'percentage',
  beneficiaries: [],
};

export const useCreateCampaignStore = create<CreateCampaignStore>((set, get) => ({
  // Initial state
  formData: initialFormData,
  uploadProgress: {},
  isSubmitting: false,
  errors: [],
  currentStep: '',
  progress: 0,

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
    const { formData } = get();
    const result = CampaignValidations.validateForm(formData);
    
    set({ errors: result.errors });
    return result.isValid;
  },

  clearErrors: () => {
    set({ errors: [] });
  },

  // Submit
  submitCampaign: async () => {
    const { formData, validateForm } = get();

    // Validar formulario
    if (!validateForm()) {
      throw new Error('Formulario inválido');
    }

    set({ isSubmitting: true, currentStep: 'Iniciando', progress: 0 });

    try {
      await CampaignCreateService.createCampaign(
        formData,
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
}));