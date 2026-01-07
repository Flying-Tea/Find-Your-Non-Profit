using System;
using System.ComponentModel;
using System.Net.Http;
using System.Text.Json;
using MyBackend.Models;

namespace MyBackend.Services
{
    public class VolunteerService
    {
        // Im using VolunteerConnector as my data source for volunteer opportunities, they don't have proper querying so I will filter manually
        private readonly HttpClient _httpClient; // To make API requests to connector
        private readonly SemaphoreSlim _refreshLock = new SemaphoreSlim(1, 1); // To protect cache access

        // Store all opportunities in memory
        private List<VolunteerOpportunity>? _cachedResults;
        private readonly TimeSpan _cacheDuration = TimeSpan.FromHours(3);
        private DateTime _lastCacheTime = DateTime.MinValue;

        public VolunteerService(HttpClient httpClient)
        {
            _httpClient = httpClient;

            // Preload cache in the background
            Task.Run(async () => await GetVolunteerOpportunitiesAsync());
        }

        // This method fetches all volunteer opportunities and stores them in the cache
        public async Task<List<VolunteerOpportunity>> GetVolunteerOpportunitiesAsync(bool showProgress = false)
        {
            int page = 1;

            // If cache is still valid, return it
            if (_cachedResults != null && (DateTime.UtcNow - _lastCacheTime) < _cacheDuration)
            {
                return _cachedResults;
            }

            await _refreshLock.WaitAsync(); // This ensures only one refresh at a time
            try
            {
                // Double-check locking
                if (_cachedResults != null && (DateTime.UtcNow - _lastCacheTime) < _cacheDuration)
                {
                    return _cachedResults;
                }

                var bag = new List<VolunteerOpportunity>();

                int totalPages = 160;
                int completedPages = 0;

                var tasks = new List<Task>();
                var semaphore = new SemaphoreSlim(10); // limit to 10 concurrent requests
                var consoleLock = new object();        // ensure clean console output

                // Fetches data from VolunteerConnector API in parallel with limited concurrency
                for (; page <= totalPages; page++)
                {
                    int currentPage = page;

                    tasks.Add(Task.Run(async () =>
                    {
                        await semaphore.WaitAsync(); // acquire slot
                        try
                        {
                            string url = $"https://www.volunteerconnector.org/api/search/?page={currentPage}";
                            var response = await _httpClient.GetStringAsync(url);

                            // Parse JSON response
                            var doc = JsonDocument.Parse(response);
                            var results = doc.RootElement.GetProperty("results");

                            // Iterate over each volunteer opportunity in the page
                            foreach (var item in results.EnumerateArray())
                            {
                                var opportunity = new VolunteerOpportunity
                                {
                                    Id = item.GetProperty("id").GetInt32(), // Unique ID
                                    Title = item.GetProperty("title").GetString() ?? "",
                                    Description = item.GetProperty("description").GetString() ?? "",
                                    Region = InferRegion(item),
                                    DurationHours = InferDurationHours(item.GetProperty("duration").GetString() ?? ""),
                                    Organization = item.GetProperty("organization").GetProperty("name").GetString() ?? "Unknown",
                                    OrganizationWebUrl = item.GetProperty("organization").GetProperty("url").GetString() ?? "",
                                    OrganizationLogoUrl = item.GetProperty("organization").GetProperty("logo").GetString() ?? "N/A",
                                    IsRemote = item.GetProperty("remote_or_online").GetBoolean(),
                                    Interests = InferInterests(item.GetProperty("description").GetString() ?? ""), // Extract keywords
                                    Ages = InferAges(item.GetProperty("description").GetString() ?? "") // Infer ages from description
                                };

                                lock (bag) // make thread-safe
                                {
                                    bag.Add(opportunity);
                                }
                            }

                            // Print progress ONCE per page
                            if (showProgress)
                            {
                                int progress = Interlocked.Increment(ref completedPages);

                                lock (consoleLock)
                                {
                                    Console.WriteLine($"Fetching page {currentPage} ({progress * 100 / totalPages}%)...");
                                    Console.Out.Flush();
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            lock (consoleLock)
                            {
                                Console.WriteLine($"Error fetching page {currentPage}: {ex.Message}");
                            }
                        }
                        finally
                        {
                            semaphore.Release(); // release slot
                        }
                    }));
                }

                await Task.WhenAll(tasks);

                // Update cache
                _cachedResults = bag;
                _lastCacheTime = DateTime.UtcNow;

                if (showProgress)
                {
                    Console.WriteLine($"Preloading complete. Total opportunities loaded: {_cachedResults.Count}");
                }

                return _cachedResults;
            }
            finally
            {
                _refreshLock.Release();
            }
        }


        // Converts duration strings like "10-20 hours / weekly" into a single int (minimum hours)
        private int InferDurationHours(string duration)
        {
            if (string.IsNullOrWhiteSpace(duration)) 
            {
                return 0;
            }

            var digits = new string(duration.TakeWhile(c => char.IsDigit(c) || c == '-').ToArray());
            if (digits.Contains('-'))
            {
                return int.Parse(digits.Split('-')[0]); // Take minimum hours
            }
            return int.TryParse(digits, out int h) ? h : 0;
        }

        // Infers interest categories from the description text
        private List<string> InferInterests(string text)
        {
            var interests = new List<string>();

            if (string.IsNullOrEmpty(text))
            {
                return interests;
            }

            text = text.ToLower();

            // Keyword mapping
            var keywords = new Dictionary<string, string[]>
            {
                { "Environment", new[] { "garbage", "conservation", "sustainability", "clean-up", "recycling", "outdoor" } },
                { "Education", new[] { "education", "consultant", "reading", "literacy volunteers" } },
                { "Tutor", new[] { "tutor", "mentoring", "teaching" } },
                { "Healthcare", new[] { "healthcare", "medical", "nursing", "wellness", "mental health", "therapy" } },
                { "Animal Welfare", new[] { "animal", "puppy", "wildlife", "rescue", "animal shelter", "pet therapy" } },
                { "Community Development", new[] { "community", "development", "housing", "food bank", "soup kitchen", "archives" } },
                { "Arts & Culture", new[] { "arts", "culture", "museum", "theater", "music" } },
                { "Sports & Recreation", new[] { "sports", "fitness", "coaching", "outdoor" } },
                { "Fundraising/Accounting", new[] { "fundraising", "donor", "accountant", "accounting", "bookkeeping", "treasurer", "secretary" } },
                { "Event Support", new[] { "event", "festival", "fair", "conference", "setup", "casino", "secretary" } },
                { "Programming & Tech", new[] { "programming", "developer", "software", "coding", "technology", "c#", "python", "web dev", "html", "graphics" } },
            };

            // Check each keyword
            foreach (var pair in keywords)
            {
                if (pair.Value.Any(k => text.Contains(k)))
                {
                    interests.Add(pair.Key);
                }
            }

            return interests;
        }

        // Infers suitable ages
        private List<string> InferAges(string text)
        {
            var ages = new List<string>();

            if (string.IsNullOrEmpty(text)) 
            {
                return ages;
            }

            text = text.ToLower();

            if (text.Contains("teen") || text.Contains("adolescent") || text.Contains("13+") || text.Contains("13-19") || text.Contains("teenager") || text.Contains("+13"))
            {
                ages.Add("13+");
            }
            if (text.Contains("adult") || text.Contains("18+") || text.Contains("18-24") || text.Contains("grown-up") ||
                text.Contains("mature") || text.Contains("+18"))
            {
                ages.Add("18+");
            }
            if (text.Contains("all ages") || text.Contains("everyone") || text.Contains("any age"))
            {
                ages.Add("All Ages");
            }

            // Default to "All" if nothing matched
            if (ages.Count == 0)
                ages.Add("All");

            return ages;
        }

        // Infers the region from the audience object in JSON
        private string InferRegion(JsonElement item)
        {
            if (item.TryGetProperty("audience", out var audience))
            {
                var scope = audience.GetProperty("scope").GetString() ?? "";

                // If regional pick the first listed region
                if (scope.ToLower() == "regional" &&
                    audience.TryGetProperty("regions", out var regions) &&
                    regions.GetArrayLength() > 0)
                {
                    return regions[0].GetString() ?? "Regional";
                }

                return scope;
            }

            // Default to national if no audience info
            return "National";
        }
    }
}
