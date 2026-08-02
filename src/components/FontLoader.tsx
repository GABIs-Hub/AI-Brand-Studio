import { useEffect } from 'react';

interface FontLoaderProps {
  url?: string;
}

export function FontLoader({ url }: FontLoaderProps) {
  useEffect(() => {
    if (!url) return;

    // Check if link tag already exists
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (existingLink) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);

    return () => {
      // Keep fonts loaded for session smooth transitions
    };
  }, [url]);

  return null;
}
