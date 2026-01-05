import type { VolunteerOpportunity } from "../api/VolunteerAPI";

type Props = {
    selected: VolunteerOpportunity | null;
    loading: boolean;
};

export default function DetailsPanel({ selected, loading }: Props) {
    if (loading) {
        return (
        <div className="bg-white border rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
        </div>
        );
    }

    if (!selected) {
        return (
        <div className="bg-white border rounded-lg p-6 text-gray-500">
            Select an opportunity to view details
        </div>
        );
    }

    return (
        <div className="bg-white border rounded-lg p-6 sticky top-4">
        <h2 className="text-xl font-bold">{selected.title}</h2>
        <p className="text-gray-600">{selected.organization}</p>
        <p className="mt-4 text-sm">{selected.description}</p>
        </div>
    );
}
