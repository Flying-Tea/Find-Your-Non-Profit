namespace MyBackend.Models
{
    public class VolunteerOpportunity
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Region { get; set; }
        public int DurationHours { get; set; }

        public string Organization { get; set; }
        public string OrganizationLogoUrl { get; set; }

        public bool IsRemote { get; set; }
        public List<string> Interests { get; set; }
        public List<string> Ages { get; set; }
    }
}