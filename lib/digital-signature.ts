export interface DigitalSignature {
  id: string;
  contratoId: string;
  fiscalEmail: string;
  fiscalName: string;
  fiscalRole: string;
  signatureData: string;
  timestamp: Date;
  certificateInfo: {
    issuer: string;
    validFrom: Date;
    validTo: Date;
    serialNumber: string;
  };
  documentHash: string;
  signatureAlgorithm: string;
  isValid: boolean;
}

export interface SignatureRequest {
  contratoId: string;
  fiscalEmail: string;
  fiscalName: string;
  fiscalRole: string;
  documentContent: string;
  checklistData: Record<string, any>;
}

export class DigitalSignatureManager {
  private static instance: DigitalSignatureManager;
  private signatures: DigitalSignature[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): DigitalSignatureManager {
    if (!DigitalSignatureManager.instance) {
      DigitalSignatureManager.instance = new DigitalSignatureManager();
    }
    return DigitalSignatureManager.instance;
  }

  async createSignature(request: SignatureRequest): Promise<DigitalSignature> {
    const documentHash = await this.generateDocumentHash(request.documentContent);
    const certificateInfo = this.generateMockCertificate();

    const signature: DigitalSignature = {
      id: this.generateId(),
      contratoId: request.contratoId,
      fiscalEmail: request.fiscalEmail,
      fiscalName: request.fiscalName,
      fiscalRole: request.fiscalRole,
      signatureData: await this.generateSignatureHash(documentHash, request.fiscalEmail),
      timestamp: new Date(),
      certificateInfo,
      documentHash,
      signatureAlgorithm: 'SHA-256',
      isValid: true,
    };

    this.signatures.push(signature);
    this.saveToStorage();

    return signature;
  }

  verifySignature(signatureId: string): boolean {
    const signature = this.signatures.find(s => s.id === signatureId);
    if (!signature) return false;

    const now = new Date();
    if (now < signature.certificateInfo.validFrom || now > signature.certificateInfo.validTo) {
      signature.isValid = false;
      this.saveToStorage();
      return false;
    }

    return signature.isValid;
  }

  getSignaturesForContrato(contratoId: string): DigitalSignature[] {
    return this.signatures
      .filter(s => s.contratoId === contratoId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getSignaturesForFiscal(fiscalEmail: string): DigitalSignature[] {
    return this.signatures
      .filter(s => s.fiscalEmail === fiscalEmail)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  revokeSignature(signatureId: string, reason: string): boolean {
    const signature = this.signatures.find(s => s.id === signatureId);
    if (signature) {
      signature.isValid = false;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  private async generateDocumentHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async generateSignatureHash(documentHash: string, fiscalEmail: string): Promise<string> {
    const signatureContent = `${documentHash}:${fiscalEmail}:${Date.now()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureContent);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateMockCertificate() {
    const now = new Date();
    return {
      issuer: 'Autoridade Certificadora do Sistema',
      validFrom: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      validTo: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      serialNumber: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  private generateId(): string {
    return `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('digital_signatures', JSON.stringify(this.signatures));
      } catch (error) {
        console.warn('Failed to save signatures to localStorage:', error);
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('digital_signatures');
        if (stored) {
          const parsed = JSON.parse(stored);
          this.signatures = parsed.map((signature: any) => ({
            ...signature,
            timestamp: new Date(signature.timestamp),
            certificateInfo: {
              ...signature.certificateInfo,
              validFrom: new Date(signature.certificateInfo.validFrom),
              validTo: new Date(signature.certificateInfo.validTo),
            },
          }));
        }
      } catch (error) {
        console.warn('Failed to load signatures from localStorage:', error);
      }
    }
  }
}

export async function signChecklist(
  contratoId: string,
  fiscalEmail: string,
  fiscalName: string,
  fiscalRole: string,
  checklistData: Record<string, any>
): Promise<DigitalSignature> {
  const signatureManager = DigitalSignatureManager.getInstance();

  const documentContent = JSON.stringify({
    contratoId,
    fiscalEmail,
    fiscalRole,
    checklistData,
    timestamp: new Date().toISOString(),
  });

  return signatureManager.createSignature({
    contratoId,
    fiscalEmail,
    fiscalName,
    fiscalRole,
    documentContent,
    checklistData,
  });
}

export function verifyChecklistSignature(signatureId: string): boolean {
  const signatureManager = DigitalSignatureManager.getInstance();
  return signatureManager.verifySignature(signatureId);
}

export function getChecklistSignatures(contratoId: string): DigitalSignature[] {
  const signatureManager = DigitalSignatureManager.getInstance();
  return signatureManager.getSignaturesForContrato(contratoId);
}

export function useDigitalSignatures(contratoId: string) {
  const signatureManager = DigitalSignatureManager.getInstance();

  return {
    signatures: signatureManager.getSignaturesForContrato(contratoId),
    signChecklist: (fiscalEmail: string, fiscalName: string, fiscalRole: string, checklistData: Record<string, any>) =>
      signChecklist(contratoId, fiscalEmail, fiscalName, fiscalRole, checklistData),
    verifySignature: (signatureId: string) => signatureManager.verifySignature(signatureId),
    revokeSignature: (signatureId: string, reason: string) => signatureManager.revokeSignature(signatureId, reason),
  };
} 