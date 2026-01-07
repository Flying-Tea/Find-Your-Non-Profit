import { useEffect, useState } from "react";
import type { SearchParams } from "../api/VolunteerAPI";

const INTERESTS = [
    "Environment",
    "Education",
    "Tutor",
    "Healthcare",
    "Animal Welfare",
    "Community Development",
    "Arts & Culture",
    "Sports & Recreation",
    "Fundraising/Accounting",
    "Event Support",
    "Programming",
];

const AGES = ["13+", "18+"];

type Props = {
    onSearch: (params: SearchParams) => void;
};

export function UserFilters({ onSearch }: Props) {
    const [searchText, setSearchText] = useState("");
    const [region, setRegion] = useState("");
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedAge, setSelectedAge] = useState<string | null>(null);
    const [remoteOnly, setRemoteOnly] = useState(false);

    // Toggle interest pills
    function toggleInterest(interest: string) {
        setSelectedInterests(prev =>
            prev.includes(interest)
            ? prev.filter(i => i !== interest)
            : [...prev, interest]
    );
    }

    // Debounced backend call
    useEffect(() => {
        const timeout = setTimeout(() => {
        onSearch({
            interests: selectedInterests,
            region,
            age: selectedAge,
            isRemote: remoteOnly,
            q: searchText,
        });
        }, 300);

        return () => clearTimeout(timeout);
    }, [selectedInterests, selectedAge, remoteOnly, searchText, region, onSearch]);

    return (
        <div className="flex flex-col items-center gap-4 mt-8">

        {/* Search + Province */}
        <div className="flex w-full max-w-6xl gap-4">
            <div className="flex-1 p-2 border rounded-lg shadow bg-white">
            <input
                className="text-lg p-3 w-full outline-none"
                type="text"
                placeholder="Search for non-profits or roles..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
            />
            </div>

            <div className="w-1/3 p-2 border rounded-lg shadow bg-white">
            <select
                className="text-lg p-3 w-full outline-none"
                value={region}
                onChange={e => setRegion(e.target.value)}
            >
                <option value="">Canadian Province</option>
                <option>Alberta</option>
                <option>British Columbia</option>
                <option>Manitoba</option>
                <option>New Brunswick</option>
                <option>Newfoundland and Labrador</option>
                <option>Nova Scotia</option>
                <option>Northwest Territories</option>
                <option>Nunavut</option>
                <option>Ontario</option>
                <option>Prince Edward Island</option>
                <option>Quebec</option>
                <option>Saskatchewan</option>
                <option>Yukon</option>
            </select>
            </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 max-w-6xl w-full">

            {/* Interests */}
            {INTERESTS.map(i => (
            <button
                key={i}
                onClick={() => toggleInterest(i)}
                className={`px-4 py-1 rounded-full border text-sm transition
                ${
                    selectedInterests.includes(i)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-gray-100"
                }`}
            >
                {i}
            </button>
            ))}

            {/* Age */}
            {AGES.map(age => (
            <button
                key={age}
                onClick={() =>
                setSelectedAge(prev => (prev === age ? null : age))
                }
                className={`px-4 py-1 rounded-full border text-sm transition
                ${
                    selectedAge === age
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-gray-100"
                }`}
            >
                {age}
            </button>
            ))}

            {/* Remote */}
            <button
            onClick={() => setRemoteOnly(prev => !prev)}
            className={`px-4 py-1 rounded-full border text-sm transition
                ${
                remoteOnly
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-gray-100"
                }`}
            >
            Remote
            </button>
        </div>
        </div>
    );
}
