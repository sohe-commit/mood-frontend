import type { ReactNode } from 'react';

export const metadata = { title: '오늘 기분 기록기' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          maxWidth: 420,
          margin: '40px auto',
          padding: '0 16px',
        }}
      >
        {children}
      </body>
    </html>
  );
}
