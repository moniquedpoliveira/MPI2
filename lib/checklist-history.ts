export interface ChecklistHistoryEntry {
  id: string;
  contratoId: string;
  fiscalEmail: string;
  fiscalRole: string;
  action: 'created' | 'updated' | 'completed';
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  timestamp: Date;
  metadata: {
    diaVerificacao?: string;
    identificacaoFiscal?: string;
    progressPercentage: number;
  };
}

export class ChecklistHistory {
  private static instance: ChecklistHistory;
  private history: ChecklistHistoryEntry[] = [];

  private constructor() { }

  static getInstance(): ChecklistHistory {
    if (!ChecklistHistory.instance) {
      ChecklistHistory.instance = new ChecklistHistory();
    }
    return ChecklistHistory.instance;
  }

  addEntry(entry: Omit<ChecklistHistoryEntry, 'id' | 'timestamp'>): void {
    const newEntry: ChecklistHistoryEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.history.push(newEntry);

    // Manter apenas os últimos 100 registros
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }

    // Salvar no localStorage para persistência
    this.saveToStorage();
  }

  getHistoryForContrato(contratoId: string): ChecklistHistoryEntry[] {
    return this.history
      .filter(entry => entry.contratoId === contratoId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getHistoryForFiscal(fiscalEmail: string): ChecklistHistoryEntry[] {
    return this.history
      .filter(entry => entry.fiscalEmail === fiscalEmail)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getRecentHistory(limit = 10): ChecklistHistoryEntry[] {
    return this.history
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  private generateId() {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('checklist_history', JSON.stringify(this.history));
      } catch (error) {
        console.warn('Failed to save history to localStorage:', error);
      }
    }
  }

  loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('checklist_history');
        if (stored) {
          const parsed = JSON.parse(stored);
          this.history = parsed.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }));
        }
      } catch (error) {
        console.warn('Failed to load history from localStorage:', error);
      }
    }
  }

  clearHistory(): void {
    this.history = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('checklist_history');
    }
  }

  exportHistory(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV();
    }
    return JSON.stringify(this.history, null, 2);
  }

  private exportToCSV(): string {
    const headers = ['ID', 'Contrato ID', 'Fiscal Email', 'Fiscal Role', 'Action', 'Timestamp', 'Progress %'];
    const rows = this.history.map(entry => [
      entry.id,
      entry.contratoId,
      entry.fiscalEmail,
      entry.fiscalRole,
      entry.action,
      entry.timestamp.toISOString(),
      entry.metadata.progressPercentage
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }
}

// Funções utilitárias para facilitar o uso
export function trackChecklistChange(
  contratoId: string,
  fiscalEmail: string,
  fiscalRole: string,
  action: 'created' | 'updated' | 'completed',
  changes: { field: string; oldValue: any; newValue: any }[],
  metadata: { diaVerificacao?: string; identificacaoFiscal?: string; progressPercentage: number }
): void {
  const history = ChecklistHistory.getInstance();
  history.addEntry({
    contratoId,
    fiscalEmail,
    fiscalRole,
    action,
    changes,
    metadata,
  });
}

export function getChecklistHistory(contratoId: string): ChecklistHistoryEntry[] {
  const history = ChecklistHistory.getInstance();
  return history.getHistoryForContrato(contratoId);
}

export function getFiscalHistory(fiscalEmail: string): ChecklistHistoryEntry[] {
  const history = ChecklistHistory.getInstance();
  return history.getHistoryForFiscal(fiscalEmail);
} 