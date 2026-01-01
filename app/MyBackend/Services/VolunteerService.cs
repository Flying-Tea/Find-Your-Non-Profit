
namespace MyBackend.services
{
    public class VolunteerService
    {
        // Im using VolunteerConnector as my data source for volunteer opportunities, they dont have proper querying so I will filter manually

        private readonly HttpClient _httpClient; // To make API requests to connector

        // Cache to store all opportunities in memory
        private List<VolunteerOpportunity>? _cachedResults;
        private readonly TimeSpan _cacheDuration = TimeSpan.FromHours(3);
        private DateTime _lastCacheTime = DateTime.MinValue;
        public VolunteerService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // This method fetches all volunteer opportunities and stores them in the cache
        public async Task<List<VolunteerOpportunity>> GetVolunteerOpportunitiesAsync()
        {
            if (_cashedResults != null && (DateTime.UtcNow - _lastCacheTime) < _cacheDuration)
            {
                return _cachedResults;
            }

            _cachedResults = new List<VolunteerOpportunity>();
            _lastCacheTime = DateTime.UtcNow;

            var bag = new List<VolunteerOpportunity>();
            var tasks = new List<Task>(); // Speed up execution with parallel requests

            // Fetch data from VolunteerConnector API
            for (int page = 1; page <= 160; page++)
            {
                int currentPage = page;
                tasks.Add(Task.Run(async () =>
                {
                    try
                    {
                        string url = $"https://www.volunteerconnector.org/api/search/?page={currentPage}";
                        var response = await _httpClient.GetStringAsync(url);
                        dynamic jsonResponse = JsonConvert.DeserializeObject(response);

                        foreach (var item in jsonResponse.results)
                        {
                            var opportunity = new VolunteerOpportunity
                            {
                                Id = item.id,
                                Title = item.title,
                                Description = item.description,
                                Region = InferRegion(item),
                                DurationHours = item.duration != null ? (string)item.duration : "Unknown",
                                Organization = item.organization != null ? (string)item.organization.name : "Unknown",
                                OrganizationLogoUrl = item.logo != null ? (string)item.logo : null,
                                IsRemote = item.remote_or_online != null ? (bool)item.remote_or_online : false,
                                Interests = InferInterests(item),
                                Ages = InferAges(item)
                            };
                            bag.Add(opportunity);
                        }
                    } catch (Exception ex)
                    {
                        Console.WriteLine($"Error fetching page {currentPage}: {ex.Message}");
                    }

                }));
            }

            await Task.WhenAll(tasks);
            _cachedResults = bag.ToList();
            return _cachedResults;
        }

        private List<string> InferInterests(string item)
        {
            var interests = new List<string>();
        }

        private List<string> InferAges(string item)
        {
            var ages = new List<string>();
        }

        private string InferRegion(string item)
        {
            // Infer region from .audiance.scope if regional return .audiance.regions if not then return .audiance.scope
        }


    }
}