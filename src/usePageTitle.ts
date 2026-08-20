import { useEffect } from 'react';

const BASE_TITLE = 'Nexus — Team Task Manager';

// Sets the browser tab title for the current page.
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Nexus` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
