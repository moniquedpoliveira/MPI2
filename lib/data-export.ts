import type { Contrato } from "@prisma/client";

interface ChecklistData {
  [key: string]: { checked: boolean; observacoes: string };
}

interface ExportData {
  contrato: Contrato;
  checklistData: ChecklistData;
  fiscalInfo: {
    email: string;
    role: string;
    diaVerificacao: string;
    identificacaoFiscal: string;
  };
}

export function exportToCSV(data: ExportData[], filename = 'fiscalizacao_contratos.csv'): void {
  const headers = [
    'Número do Contrato',
    'Objeto',
    'Órgão Contratante',
    'Valor Total',
    'Vigência Início',
    'Vigência Término',
    'Contratada',
    'CNPJ Contratada',
    'Fiscal Email',
    'Fiscal Role',
    'Data Verificação',
    'Identificação Fiscal',
    'Status Contrato',
    'Progresso Checklist',
    'Itens Completos',
    'Itens Pendentes',
    'Observações Gerais'
  ];

  const rows = data.map(item => {
    const contrato = item.contrato;
    const checklistItems = Object.keys(item.checklistData);
    const completedItems = checklistItems.filter(key => item.checklistData[key]?.checked).length;
    const totalItems = checklistItems.length;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Determinar status do contrato
    const now = new Date();
    const vigenciaTermino = new Date(contrato.vigenciaTermino);
    let statusContrato = 'Ativo';
    if (vigenciaTermino < now) {
      statusContrato = 'Vencido';
    } else if (vigenciaTermino <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
      statusContrato = 'Vencendo';
    }

    // Observações gerais
    const observacoes = checklistItems
      .map(key => item.checklistData[key]?.observacoes)
      .filter(obs => obs?.trim())
      .join('; ');

    return [
      contrato.numeroContrato,
      contrato.objeto,
      contrato.orgaoContratante,
      formatCurrency(contrato.valorTotal),
      formatDate(contrato.vigenciaInicio),
      formatDate(contrato.vigenciaTermino),
      contrato.nomeContratada,
      contrato.cnpjContratada,
      item.fiscalInfo.email,
      item.fiscalInfo.role,
      item.fiscalInfo.diaVerificacao,
      item.fiscalInfo.identificacaoFiscal,
      statusContrato,
      `${progressPercentage}%`,
      completedItems,
      totalItems - completedItems,
      observacoes || 'N/A'
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

export function exportToJSON(data: ExportData[], filename = 'fiscalizacao_contratos.json'): void {
  const jsonData = data.map(item => ({
    contrato: {
      numeroContrato: item.contrato.numeroContrato,
      objeto: item.contrato.objeto,
      orgaoContratante: item.contrato.orgaoContratante,
      valorTotal: item.contrato.valorTotal,
      vigenciaInicio: item.contrato.vigenciaInicio,
      vigenciaTermino: item.contrato.vigenciaTermino,
      nomeContratada: item.contrato.nomeContratada,
      cnpjContratada: item.contrato.cnpjContratada,
    },
    fiscal: {
      email: item.fiscalInfo.email,
      role: item.fiscalInfo.role,
      diaVerificacao: item.fiscalInfo.diaVerificacao,
      identificacaoFiscal: item.fiscalInfo.identificacaoFiscal,
    },
    checklist: {
      data: item.checklistData,
      progresso: calculateProgress(item.checklistData),
      estatisticas: calculateStatistics(item.checklistData),
    },
    metadata: {
      exportadoEm: new Date().toISOString(),
      versao: '1.0',
    }
  }));

  const jsonContent = JSON.stringify(jsonData, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

export function exportChecklistDetailed(data: ExportData[], filename = 'checklist_detalhado.csv'): void {
  const headers = [
    'Contrato',
    'Item Checklist',
    'Status',
    'Observações',
    'Fiscal',
    'Data Verificação'
  ];

  const rows: string[][] = [];

  for (const item of data) {
    const contrato = item.contrato;
    const checklistItems = Object.keys(item.checklistData);

    for (const checklistItem of checklistItems) {
      const checklistData = item.checklistData[checklistItem];
      rows.push([
        contrato.numeroContrato,
        checklistItem,
        checklistData?.checked ? 'Concluído' : 'Pendente',
        checklistData?.observacoes || 'N/A',
        item.fiscalInfo.identificacaoFiscal,
        item.fiscalInfo.diaVerificacao || 'N/A'
      ]);
    }
  }

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

export function exportSummaryReport(data: ExportData[], filename = 'relatorio_resumo.csv'): void {
  const headers = [
    'Fiscal',
    'Total Contratos',
    'Contratos Ativos',
    'Contratos Vencendo',
    'Contratos Vencidos',
    'Valor Total',
    'Checklists Completos',
    'Checklists Em Progresso',
    'Checklists Não Iniciados',
    'Progresso Médio (%)'
  ];

  // Agrupar por fiscal
  const fiscalGroups = new Map<string, ExportData[]>();

  for (const item of data) {
    const fiscalKey = item.fiscalInfo.email;
    if (!fiscalGroups.has(fiscalKey)) {
      fiscalGroups.set(fiscalKey, []);
    }
    const fiscalGroup = fiscalGroups.get(fiscalKey);
    if (fiscalGroup) {
      fiscalGroup.push(item);
    }
  }

  const rows: string[][] = [];

  for (const [fiscalEmail, fiscalData] of fiscalGroups) {
    const totalContratos = fiscalData.length;
    let contratosAtivos = 0;
    let contratosVencendo = 0;
    let contratosVencidos = 0;
    let valorTotal = 0;
    let checklistsCompletos = 0;
    let checklistsEmProgresso = 0;
    let checklistsNaoIniciados = 0;
    let totalProgress = 0;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    for (const item of fiscalData) {
      const contrato = item.contrato;
      valorTotal += contrato.valorTotal;

      // Status do contrato
      const vigenciaTermino = new Date(contrato.vigenciaTermino);
      if (vigenciaTermino < now) {
        contratosVencidos++;
      } else if (vigenciaTermino <= thirtyDaysFromNow) {
        contratosVencendo++;
      } else {
        contratosAtivos++;
      }

      // Status do checklist
      const checklistItems = Object.keys(item.checklistData);
      const completedItems = checklistItems.filter(key => item.checklistData[key]?.checked).length;
      const progressPercentage = checklistItems.length > 0 ? Math.round((completedItems / checklistItems.length) * 100) : 0;

      if (progressPercentage === 100) {
        checklistsCompletos++;
      } else if (progressPercentage > 0) {
        checklistsEmProgresso++;
      } else {
        checklistsNaoIniciados++;
      }

      totalProgress += progressPercentage;
    }

    const progressoMedio = totalContratos > 0 ? Math.round(totalProgress / totalContratos) : 0;

    rows.push([
      fiscalEmail,
      totalContratos.toString(),
      contratosAtivos.toString(),
      contratosVencendo.toString(),
      contratosVencidos.toString(),
      formatCurrency(valorTotal),
      checklistsCompletos.toString(),
      checklistsEmProgresso.toString(),
      checklistsNaoIniciados.toString(),
      progressoMedio.toString()
    ]);
  }

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

function calculateProgress(checklistData: ChecklistData): number {
  const items = Object.keys(checklistData);
  if (items.length === 0) return 0;

  const completedItems = items.filter(key => checklistData[key]?.checked).length;
  return Math.round((completedItems / items.length) * 100);
}

function calculateStatistics(checklistData: ChecklistData): {
  total: number;
  completed: number;
  pending: number;
  withObservations: number;
} {
  const items = Object.keys(checklistData);
  const completed = items.filter(key => checklistData[key]?.checked).length;
  const withObservations = items.filter(key =>
    checklistData[key]?.observacoes?.trim()
  ).length;

  return {
    total: items.length,
    completed,
    pending: items.length - completed,
    withObservations,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("pt-BR");
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Função para exportar dados de um único contrato
export function exportSingleContract(data: ExportData, format: 'csv' | 'json' = 'csv'): void {
  const contrato = data.contrato;
  const filename = `contrato_${contrato.numeroContrato.replace(/[^a-zA-Z0-9]/g, '_')}`;

  if (format === 'json') {
    exportToJSON([data], `${filename}.json`);
  } else {
    exportToCSV([data], `${filename}.csv`);
  }
}

// Função para exportar relatório de auditoria
export function exportAuditReport(data: ExportData[], filename = 'relatorio_auditoria.csv'): void {
  const headers = [
    'Data/Hora',
    'Contrato',
    'Fiscal',
    'Ação',
    'Item Modificado',
    'Valor Anterior',
    'Valor Novo',
    'IP (simulado)',
    'Sessão'
  ];

  // Simular dados de auditoria
  const auditRows: string[][] = [];
  const now = new Date();

  for (const item of data) {
    const contrato = item.contrato;
    const checklistItems = Object.keys(item.checklistData);

    // Simular algumas entradas de auditoria
    auditRows.push([
      now.toISOString(),
      contrato.numeroContrato,
      item.fiscalInfo.email,
      'CHECKLIST_ATUALIZADO',
      'Progresso Geral',
      '0%',
      `${calculateProgress(item.checklistData)}%`,
      '192.168.1.100',
      'session_123'
    ]);

    for (const checklistItem of checklistItems) {
      const checklistData = item.checklistData[checklistItem];
      if (checklistData?.checked) {
        auditRows.push([
          now.toISOString(),
          contrato.numeroContrato,
          item.fiscalInfo.email,
          'ITEM_CONCLUIDO',
          checklistItem,
          'Pendente',
          'Concluído',
          '192.168.1.100',
          'session_123'
        ]);
      }
    }
  }

  const csvContent = [headers, ...auditRows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  downloadFile(csvContent, filename, 'text/csv');
} 