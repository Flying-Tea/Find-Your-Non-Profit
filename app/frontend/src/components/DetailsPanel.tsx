import type { VolunteerOpportunity } from "../api/VolunteerAPI";

type Props = {
    selected: VolunteerOpportunity | null;
    loading: boolean;
};

export default function DetailsPanel({ selected }: Props) {
    if (!selected) {
        return (
        <div className="bg-white border rounded-lg p-6 text-gray-500">
            Select an opportunity to view details
        </div>
        );
    }
    const reasons = Array.isArray(selected.whyMatched)
        ? selected.whyMatched
        : selected.whyMatched
        ? [selected.whyMatched]
        : [];

    const hasRecommendation = selected.whyMatched != "";
    const url = selected.organizationWebUrl.startsWith("http")
        ? selected.organizationWebUrl
        : `https://${selected.organizationWebUrl}`;

    return (
        <div className="flex-col md:flex-row gap-4 sticky top-4 md:items-start">
        {/* Details box */}
        <div className=" bg-white border rounded-lg p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="">
                    <h2 className="text-xl font-bold">{selected.title}</h2>
                    <p className="text-gray-600">{selected.organization}</p>
                </div>
                <img src={selected.organizationLogoUrl} className="max-h-15 ml-auto"></img>
            </div>
            <p className="mt-4 text-sm">{selected.description}</p>
            <div className="p-2 flex ml-auto">
                <a href={url} 
                className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600 text-sm ml-auto" target="_blank">
                    View Opportunity
                </a>
            </div>
        </div>
        {/* Recommendation box */}
        {hasRecommendation && (
            <>
            <br></br>
            <div className="bg-white border rounded-lg p-6 max-w-md self-start flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Why this was recommended</h3>
            </div>
            {reasons.map((reason, idx) => ( 
                <p key={idx} className="text-gray-600">
                    {reason}{/* Recommendation text */}
                </p>
            ))}
            </div>
            </>
        )}
        </div>
    );
}
