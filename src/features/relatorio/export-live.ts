"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { apiDownload, apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";

import { monthOf, periodStart, type ReportPeriodId } from "./live";

/** Exportação do relatório pela API (`/v1/reports/exports`): gera em segundo plano e baixa. */

export type LiveExportFormat = "pdf" | "csv";

export const ReportExportSchema = z
  .object({
    id: z.string(),
    status: z.enum(["queued", "processing", "ready", "failed", "expired"]),
    format: z.string(),
    fileName: z.string().nullable(),
    error: z.string().nullable(),
  })
  .loose();
export type ReportExport = z.infer<typeof ReportExportSchema>;

/** O pedido de cada formato: PDF = gastos do mês atual; CSV = lançamentos do período aberto. */
export function exportRequest(format: LiveExportFormat, period: ReportPeriodId, now: Date) {
  if (format === "pdf") return { type: "monthly_spending", format: "pdf", month: monthOf(now, 0) };
  return {
    type: "transactions",
    format: "csv",
    from: periodStart(now, period),
    to: formatDate(now, "yyyy-MM-dd"),
  };
}

export const LIVE_EXPORT_FORMATS = [
  { id: "pdf", icon: "file", label: "PDF", detail: "Os gastos deste mês, com gráficos" },
  { id: "csv", icon: "bar-chart", label: "CSV", detail: "Os lançamentos do período, em texto" },
] as const;

/** Pede o arquivo; o andamento vem de `useReportExport`. */
export function requestExport(format: LiveExportFormat, period: ReportPeriodId) {
  return apiRequest("/v1/reports/exports", ReportExportSchema, {
    method: "POST",
    body: exportRequest(format, period, new Date()),
  });
}

/** O pedido de exportação, consultado a cada 2 s enquanto gera. */
export function useReportExport(id: string | null) {
  return useQuery({
    queryKey: ["relatorio", "exportacao", id],
    queryFn: ({ signal }) =>
      apiRequest(`/v1/reports/exports/${id}`, ReportExportSchema, { signal }),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "queued" || status === "processing" ? 2000 : false;
    },
  });
}

/** Baixa o arquivo pronto (o navegador salva com o nome que a API deu). */
export async function downloadExport(item: ReportExport) {
  const { blob, fileName } = await apiDownload(`/v1/reports/exports/${item.id}/download`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName ?? item.fileName ?? `guara-relatorio.${item.format}`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
