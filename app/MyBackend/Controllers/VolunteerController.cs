using Microsoft.AspNetCore.Mvc;
using MyBackend.Services;
using MyBackend.Models;

namespace MyBackend.Controllers
{
    [ApiController]
    [Route("api/Volunteer")] // This will be a custom api endpoint to makeup for lack of querying in VolunteerConnector
    public class VolunteerController : ControllerBase
    {
        private readonly VolunteerService _volunteerService;

        public VolunteerController(VolunteerService volunteerService)
        {
            _volunteerService = volunteerService;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] string? interests,
            [FromQuery] string? region,
            [FromQuery] string? age,
            [FromQuery] bool? isRemote,
            [FromQuery] int? maxDurationHours,
            [FromQuery] string? q // Search query
        )
        {
            var opportunities = await _volunteerService.GetVolunteerOpportunitiesAsync();
            var interestFilters = interests?.Split(',').Select(i => i.Trim().ToLower()).Where(i => !string.IsNullOrEmpty(i)).ToList() ?? new List<string>();
            var filtered = new List<VolunteerOpportunity>();

            foreach (var o in opportunities)
            {
                var reasons = new List<string>(); // This will hold reasons why each volunteer opportunity matched

                // Interests filter
                if (interestFilters.Count > 0)
                {
                    var matchedInterests = o.Interests
                        .Where(i => interestFilters.Contains(i.ToLower()))
                        .ToList();

                    if (matchedInterests.Count == 0)
                    {
                        continue;
                    } 
                    if (matchedInterests.Count <= 1)
                    {
                        reasons.Add($"Matches your interest in {string.Join(" and ", matchedInterests)}");
                    } else
                    {
                        reasons.Add($"Matches your interest in {string.Join(", ", matchedInterests.Take(matchedInterests.Count - 1))} and {matchedInterests.Last()}");
                    }
                    
                }

                // Region filter
                if (!string.IsNullOrEmpty(region))
                {
                    if (!o.Region.Equals(region, StringComparison.OrdinalIgnoreCase))
                        continue;

                    reasons.Add($"Located in {o.Region}");
                }

                // Age filter
                if (!string.IsNullOrEmpty(age))
                {
                    if (!age.Equals("All", StringComparison.OrdinalIgnoreCase))
                    {
                        if (age == "13+" && !o.Ages.Contains("13+")) continue;
                        if (age == "18+" && !o.Ages.Contains("18+")) continue;
                    }
                    reasons.Add($"Available to ages {age}");
                }

                // Remote filter
                if (isRemote.HasValue)
                {
                    if (o.IsRemote != isRemote.Value) continue;
                    reasons.Add(isRemote.Value ? "Remote opportunity" : "In-person opportunity");
                }

                // Duration filter
                if (maxDurationHours.HasValue)
                {
                    if (o.DurationHours > maxDurationHours.Value) continue;
                    reasons.Add($"Matches your shortest duration of {maxDurationHours} hours");
                }

                // Search query filter
                if (!string.IsNullOrEmpty(q))
                {
                    var lowerQ = q.ToLower();
                    if (!o.Title.ToLower().Contains(lowerQ) && !o.Organization.ToLower().Contains(lowerQ))
                        continue;

                    reasons.Add($"Matches your search query '{q}'");
                }

                o.WhyMatched = reasons;
                filtered.Add(o);
            }

            // Rank by interest matches first, then take top 15
            var ranked = filtered
                .OrderByDescending(o => o.Interests.Count(i => interestFilters.Contains(i.ToLower())))
                .Take(15)
                .ToList();

            return Ok(ranked);
        }

    }
}