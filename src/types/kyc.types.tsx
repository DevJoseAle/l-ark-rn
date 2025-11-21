// src/types/kyc.types.ts
export type KYCDocumentType = 'id_front' | 'id_back' | 'selfie';

export interface KYCDocument {
  id: string;
  uri: string;
  type: KYCDocumentType;
  name: string;
  size: number;
}

export interface KYCSubmission {
  id_front: KYCDocument;
  id_back: KYCDocument;
  selfie: KYCDocument;
}

export type KYCStep = 'intro' | 'id_front' | 'id_back' | 'selfie' | 'review' | 'submitting';
export enum KYCUserStatus {
  PENDING = 'kyc_pending',
  REVIEW = 'kyc_review',
  VERIFIED = 'kyc_verified',
  REJECTED = 'kyc_rejected',
}
