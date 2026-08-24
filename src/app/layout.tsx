import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import ClientLayout from '@/components/layout/ClientLayout';

export const metadata: Metadata = {
  title: '통합 견적 관리 시스템 | Estimate Management System',
  description: '물품, SW개발비, 직접비, 제경비율, 기술료율, 이윤율 산출 및 프로젝트/고객사별 견적 이력 관리',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased font-sans">
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
