export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden flex flex-col animate-pulse">
      <div className="relative h-48 sm:h-56 md:h-64 bg-gray-700"></div>
      <div className="p-4 md:p-6 flex-1 flex flex-col space-y-3">
        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="mt-auto space-y-3">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-12 bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="card p-5 sm:p-6 md:p-8 animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-2/3 mb-3"></div>
      <div className="h-4 bg-gray-700 rounded w-full"></div>
    </div>
  );
}
