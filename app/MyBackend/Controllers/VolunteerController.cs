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
            [FromQuery] int? maxDurationHours
        )
        {
            List<VolunteerOpportunity> opportunities = await _volunteerService.GetVolunteerOpportunitiesAsync();

            List<string> interestFilters = interests?.Split(',').Select(i => i.Trim().ToLower()).ToList() ?? new List<string>();
            
            var filitered = opportunities.Where(o =>
                (interestFilters.Count == 0 || o.Interests.Any(i => interestFilters.Contains(i.ToLower()))) &&
                (string.IsNullOrEmpty(region) || o.Region.Equals(region, StringComparison.OrdinalIgnoreCase)) &&
                (string.IsNullOrEmpty(age) || o.Ages.Contains(age)) &&
                (!isRemote.HasValue || o.IsRemote == isRemote.Value) &&
                (!maxDurationHours.HasValue || o.DurationHours <= maxDurationHours.Value)
            ).ToList();

            var ranked = filitered.OrderByDescending(o =>
                o.Interests.Count(i => interestFilters.Contains(i.ToLower()))
            )
            .Take(15)
            .ToList();

            return Ok(ranked);
        }
    }
}