export interface VolunteerOpportunity {
    id: number;
    title: string;
    organization: string;
    description: string;
    region: string;
    isRemote: boolean;
    durationHours: number;
    interests: string[];
    ages: string[];
    organizationWebUrl: string;
}

export type SearchParams = {
    interests: string[];
    region: string;
    age: string | null;
    isRemote: boolean;
    q: string;
};

export async function searchVolunteers(params: SearchParams) {
    const query = new URLSearchParams();

    if (params.interests?.length)
        query.append("interests", params.interests.join(","));

    if (params.region) query.append("region", params.region);
    if (params.age) query.append("age", params.age);
    if (params.isRemote) query.append("isRemote", "true");
    if (params.q) query.append("q", params.q);

    const res = await fetch(`http://localhost:5062/api/Volunteer/search?${query.toString()}`);

    if (!res.ok) {
        throw new Error("Failed to fetch opportunities");
    }

    return res.json() as Promise<VolunteerOpportunity[]>;
}
