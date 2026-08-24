import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return d.toISOString().split('T')[0];
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'DRAFT':
      return { label: '작성중', bg: 'bg-gray-100 text-gray-700 border-gray-300' };
    case 'REVIEW':
      return { label: '내부검토', bg: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    case 'SENT':
      return { label: '제출완료', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
    case 'WON':
      return { label: '수주성공', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'LOST':
      return { label: '실주', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
    case 'CANCELED':
      return { label: '취소/보류', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
    default:
      return { label: status, bg: 'bg-gray-100 text-gray-700 border-gray-300' };
  }
}
