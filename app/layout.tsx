import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Microsoft Entra ID SSO & MFA Diagram',
  description: 'All-in-one visualization of SSO and MFA scenarios with Microsoft Entra ID',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
