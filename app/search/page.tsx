import { Suspense } from 'react';
import { GlobalSearchResults } from '@/components/search/GlobalSearchResults';

export default function SearchPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Suspense fallback={<div className="flex justify-center py-12">Loading search...</div>}>
        <GlobalSearchResults />
      </Suspense>
    </div>
  );
}
