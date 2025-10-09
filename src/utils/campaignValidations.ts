// src/utils/campaignValidations.ts

import { CreateCampaignFormData, ValidationError, ValidationResult } from "../types/campaign-create.types";

export class CampaignValidations {
  // Constantes de validación
  private static readonly MIN_GOAL_AMOUNT = 3_000_000; // 3 millones CLP
  private static readonly MAX_GOAL_AMOUNT = 50_000_000; // 50 millones CLP
  private static readonly MIN_TITLE_LENGTH = 12;
  private static readonly MIN_DESCRIPTION_LENGTH = 90;
  private static readonly MIN_CAMPAIGN_DAYS = 90; // 3 meses
  private static readonly MAX_CAMPAIGN_DAYS = 365; // 1 año
  private static readonly MAX_CAMPAIGN_IMAGES = 3;
  private static readonly MAX_DIAGNOSIS_IMAGES = 3;
  private static readonly MAX_BENEFICIARIES = 3;
  private static readonly MAX_BENEFICIARY_DOCS = 3;

  /**
   * Validar título
   */
  static validateTitle(title: string): ValidationError | null {
    if (!title || title.trim().length === 0) {
      return {
        field: 'title',
        message: 'El título es requerido',
      };
    }

    if (title.trim().length < this.MIN_TITLE_LENGTH) {
      return {
        field: 'title',
        message: `El título debe tener al menos ${this.MIN_TITLE_LENGTH} caracteres`,
      };
    }

    return null;
  }

  /**
   * Validar descripción
   */
  static validateDescription(description: string): ValidationError | null {
    if (!description || description.trim().length === 0) {
      return {
        field: 'description',
        message: 'La descripción es requerida',
      };
    }

    if (description.trim().length < this.MIN_DESCRIPTION_LENGTH) {
      return {
        field: 'description',
        message: `La descripción debe tener al menos ${this.MIN_DESCRIPTION_LENGTH} caracteres`,
      };
    }

    return null;
  }

  /**
   * Validar meta de recaudación
   */
  static validateGoalAmount(amount: string): ValidationError | null {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return {
        field: 'goalAmount',
        message: 'Ingresa un monto válido',
      };
    }

    if (numAmount < this.MIN_GOAL_AMOUNT) {
      return {
        field: 'goalAmount',
        message: `El monto mínimo es $${this.MIN_GOAL_AMOUNT.toLocaleString('es-CL')}`,
      };
    }

    if (numAmount > this.MAX_GOAL_AMOUNT) {
      return {
        field: 'goalAmount',
        message: `El monto máximo es $${this.MAX_GOAL_AMOUNT.toLocaleString('es-CL')}`,
      };
    }

    return null;
  }

  /**
   * Validar soft cap (meta mínima)
   */
  static validateSoftCap(softCap: string, goalAmount: string): ValidationError | null {
    const numSoftCap = parseFloat(softCap);
    const numGoalAmount = parseFloat(goalAmount);

    if (isNaN(numSoftCap) || numSoftCap <= 0) {
      return {
        field: 'softCap',
        message: 'La meta mínima es requerida',
      };
    }

    if (numSoftCap >= numGoalAmount) {
      return {
        field: 'softCap',
        message: 'La meta mínima debe ser menor que la meta total',
      };
    }

    return null;
  }

  /**
   * Validar hard cap (meta media)
   */
  static validateHardCap(hardCap: string, goalAmount: string): ValidationError | null {
    if (!hardCap || hardCap.trim().length === 0) {
      return null; // Hard cap es opcional
    }

    const numHardCap = parseFloat(hardCap);
    const numGoalAmount = parseFloat(goalAmount);

    if (isNaN(numHardCap) || numHardCap <= 0) {
      return {
        field: 'hardCap',
        message: 'Ingresa un monto válido',
      };
    }

    if (numHardCap <= numGoalAmount) {
      return {
        field: 'hardCap',
        message: 'La meta media debe ser mayor que la meta total',
      };
    }

    return null;
  }

  /**
   * Validar fechas
   */
  static validateDates(startDate: Date, endDate: Date): ValidationError | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validar que la fecha de inicio sea hoy o en el futuro
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    if (start < today) {
      return {
        field: 'startDate',
        message: 'La fecha de inicio debe ser hoy o posterior',
      };
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (endDate <= startDate) {
      return {
        field: 'endDate',
        message: 'La fecha de fin debe ser posterior a la de inicio',
      };
    }

    // Validar duración mínima
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationDays = durationMs / (1000 * 60 * 60 * 24);

    if (durationDays < this.MIN_CAMPAIGN_DAYS) {
      return {
        field: 'endDate',
        message: `La campaña debe durar al menos ${this.MIN_CAMPAIGN_DAYS} días (3 meses)`,
      };
    }

    // Validar duración máxima
    if (durationDays > this.MAX_CAMPAIGN_DAYS) {
      return {
        field: 'endDate',
        message: `La campaña no puede durar más de ${this.MAX_CAMPAIGN_DAYS} días (1 año)`,
      };
    }

    return null;
  }

  /**
   * Validar imágenes de campaña
   */
  static validateCampaignImages(images: any[]): ValidationError | null {
    if (images.length === 0) {
      return {
        field: 'campaignImages',
        message: 'Debes agregar al menos 1 imagen de la campaña',
      };
    }

    if (images.length > this.MAX_CAMPAIGN_IMAGES) {
      return {
        field: 'campaignImages',
        message: `Máximo ${this.MAX_CAMPAIGN_IMAGES} imágenes`,
      };
    }

    return null;
  }

  /**
   * Validar imágenes de diagnóstico
   */
  static validateDiagnosisImages(hasDiagnosis: boolean, images: any[]): ValidationError | null {
    if (!hasDiagnosis) {
      return null; // No se requieren si no hay diagnóstico
    }

    if (images.length === 0) {
      return {
        field: 'diagnosisImages',
        message: 'Debes agregar al menos 1 imagen del diagnóstico',
      };
    }

    if (images.length > this.MAX_DIAGNOSIS_IMAGES) {
      return {
        field: 'diagnosisImages',
        message: `Máximo ${this.MAX_DIAGNOSIS_IMAGES} imágenes`,
      };
    }

    return null;
  }

  /**
   * Validar beneficiarios
   */
  static validateBeneficiaries(beneficiaries: any[], distributionRule: string): ValidationError | null {
    if (beneficiaries.length === 0) {
      return {
        field: 'beneficiaries',
        message: 'Debes agregar al menos 1 beneficiario',
      };
    }

    if (beneficiaries.length > this.MAX_BENEFICIARIES) {
      return {
        field: 'beneficiaries',
        message: `Máximo ${this.MAX_BENEFICIARIES} beneficiarios`,
      };
    }

    // Si es porcentaje, validar que sume 100%
    if (distributionRule === 'percentage') {
      const totalPercentage = beneficiaries.reduce(
        (sum, b) => sum + (b.shareValue || 0),
        0
      );

      if (Math.abs(totalPercentage - 100) > 0.01) {
        return {
          field: 'beneficiaries',
          message: 'La suma de porcentajes debe ser 100%',
        };
      }
    }

    // Validar que cada beneficiario tenga documentos
    for (let i = 0; i < beneficiaries.length; i++) {
      const beneficiary = beneficiaries[i];
      
      if (!beneficiary.documents || beneficiary.documents.length === 0) {
        return {
          field: `beneficiaries[${i}].documents`,
          message: `El beneficiario ${beneficiary.user.display_name} debe tener al menos 1 documento`,
        };
      }

      if (beneficiary.documents.length > this.MAX_BENEFICIARY_DOCS) {
        return {
          field: `beneficiaries[${i}].documents`,
          message: `Máximo ${this.MAX_BENEFICIARY_DOCS} documentos por beneficiario`,
        };
      }
    }

    return null;
  }

  /**
   * Validar formulario completo
   */
  static validateForm(formData: CreateCampaignFormData): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar título
    const titleError = this.validateTitle(formData.title);
    if (titleError) errors.push(titleError);

    // Validar descripción
    const descError = this.validateDescription(formData.description);
    if (descError) errors.push(descError);

    // Validar meta total
    const goalError = this.validateGoalAmount(formData.goalAmount);
    if (goalError) errors.push(goalError);

    // Validar meta mínima
    const softCapError = this.validateSoftCap(formData.softCap, formData.goalAmount);
    if (softCapError) errors.push(softCapError);

    // Validar meta media (si existe)
    if (formData.hardCap && formData.hardCap.trim().length > 0) {
      const hardCapError = this.validateHardCap(formData.hardCap, formData.goalAmount);
      if (hardCapError) errors.push(hardCapError);
    }

    // Validar fechas
    const dateError = this.validateDates(formData.startDate, formData.endDate);
    if (dateError) errors.push(dateError);

    // Validar imágenes de campaña
    const imageError = this.validateCampaignImages(formData.campaignImages);
    if (imageError) errors.push(imageError);

    // Validar imágenes de diagnóstico
    const diagnosisError = this.validateDiagnosisImages(
      formData.hasDiagnosis,
      formData.diagnosisImages
    );
    if (diagnosisError) errors.push(diagnosisError);

    // Validar beneficiarios
    const beneficiaryError = this.validateBeneficiaries(
      formData.beneficiaries,
      formData.distributionRule
    );
    if (beneficiaryError) errors.push(beneficiaryError);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}