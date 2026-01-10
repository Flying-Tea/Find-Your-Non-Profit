# Main Backend Code Features

1. Abstraction/Aggregation Layer (VolunteerConnector)

I used an API that has poor filitering support as I found that it had the most comprehensive free database I could easily access.
It does the following:

- Fetches all pages
- Converted raw JSON API data into a useable and readable internal API model

2. In-Memory Caching + Rate Limiting

- Preloads ~160 pages of data
- Stored the result in the memory
- 3-hr cache duration
- Avoided repeated API calls
- Preloads in the background on service startup
- Cache invalidation logic
- Parallel API requests
- Concurrency capped with SemaphoreSlim(10)
- Thread-safe Aggregation with lock

3. Custom Search Engine Ranking

It filters based off:

- Interests
- Region (FUTURE ADD)
- Age Eligibility
- Remote vs In-person
- Duration

Using this it ranks based off of interest overlap and I limit the resulting data with Take(15)

4. Semantic Inference (Light NLP)

- Used unstructured text to infer:
    - interests via keyword mapping
    - age Eligibility
    - duration

This is a very light proto-AI (I use the term AI very loosely here)

5. Clean API

- Single responsiblity endpoints
- Query based filitering
- very easy to test via Insomnia (<3 Insomnia for testing)

The frontend communicated exclusively with a single well-defined API endpoint (/api/Volunteer/search).
All filtering happens in the backend with the VolunteerConnector only acting as a data source.
This ensures a maintainable API and scale ready or to swap data sources if needed.

Note: I decided not to use input validation as all inputs will be handled via a controlled frontend UI
