import type { VolunteerOpportunity } from "../api/VolunteerAPI";
import { LoadingSkeleton } from "./Skeleton";

type ResultsListProps = {
    results: VolunteerOpportunity[];
    loading: boolean;
    onSelect: (opportunity: VolunteerOpportunity) => void;
};

function ResultsList({ results, loading, onSelect }: ResultsListProps) {
    if (loading) return <LoadingSkeleton />;

    if (!results.length) {
        return (
        <div className="text-gray-500 text-center mt-8">
            No opportunities match your filters.
        </div>
        );
    }

    return (
        <div className="space-y-3">
        {results.map(r => (
            <div
            key={r.id}
            onClick={() => onSelect(r)}
            className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow"
            >
            <h3 className="font-semibold">{r.title}</h3>
            <p className="text-sm text-gray-600">{r.organization}</p>
            <p className="text-sm text-gray-500">{r.region}</p>
            </div>
        ))}
        </div>
    );
}
export { ResultsList };