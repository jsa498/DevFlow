'use client';

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Service' | 'Article';
  data: Record<string, any>;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
} 