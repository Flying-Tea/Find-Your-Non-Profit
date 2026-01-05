function LoadingSkeleton() {
    return (
        <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
            <div
            key={i}
            className="bg-white border rounded-lg p-4 animate-pulse"
            >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
        ))}
        </div>
    );
}
export { LoadingSkeleton };