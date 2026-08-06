import { AuthProvider } from '@/components/auth-provider';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { Metadata, Viewport } from 'next';
import './globals.css';

const getSiteUrl = (): URL | undefined => {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!value) return undefined;

  try {
    return new URL(value);
  } catch {
    return undefined;
  }
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    default: 'EstateMint — Find a place worth moving for',
    template: '%s · EstateMint',
  },
  description:
    'Discover thoughtfully presented homes, save favorites, and request a tour with EstateMint.',
  applicationName: 'EstateMint',
  keywords: ['real estate', 'property marketplace', 'homes for sale'],
  ...(siteUrl
    ? {
        metadataBase: siteUrl,
        openGraph: {
          title: 'EstateMint — Find a place worth moving for',
          description:
            'Discover thoughtfully presented homes, save favorites, and request a tour.',
          type: 'website',
          images: [{ url: '/og.png', width: 1200, height: 630 }],
        },
        twitter: {
          card: 'summary_large_image' as const,
          title: 'EstateMint — Find a place worth moving for',
          description:
            'Discover thoughtfully presented homes, save favorites, and request a tour.',
          images: ['/og.png'],
        },
      }
    : {}),
};

export const viewport: Viewport = {
  themeColor: '#173d34',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
