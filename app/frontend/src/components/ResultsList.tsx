
import type { VolunteerOpportunity } from "../api/VolunteerAPI";
import { LoadingSkeleton } from "./Skeleton";
import { SkeletonWrapper } from "./SkeletonWrapper";

type ResultsListProps = {
    results: VolunteerOpportunity[];
    loading: boolean;
    onSelect: (opportunity: VolunteerOpportunity) => void;
};

function ResultsList({ results, loading, onSelect }: ResultsListProps) {
    if (!results.length) {
        return (
        <div className="text-gray-500 text-center mt-8">
            No opportunities match your filters.
        </div>
        );
    }

    return (
        <div>
            <div>
                <SkeletonWrapper loading={loading}>
                    <LoadingSkeleton/>
                </SkeletonWrapper>
            </div>
            <div className="space-y-3">
            {results.map(r => (
                <div
                key={r.id}
                onClick={() => onSelect(r)}
                className="flex bg-white border rounded-lg p-4 transition cursor-pointer hover:shadow hover:bg-teal-100 group"
                >
                    <div className="flex-1">
                        <h3 className="font-semibold">{r.title}</h3>
                        <p className="text-sm text-gray-600">{r.organization}</p>
                        <p className="text-sm text-gray-500 flex">{r.region}</p>
                    </div>
                    <img src={r.organizationLogoUrl} className="max-h-10 ml-auto group-hover:brightness-90 group-hover:hue-rotate-120 transition"></img>
                </div>
            ))}
            </div>
        </div>
    );
}
export { ResultsList };