using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MyBackend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddHttpClient<VolunteerService>(); // register VolunteerService with HttpClient
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); // Added Swagger generation

builder.Services.AddHttpClient<VolunteerService>();
builder.Services.AddSingleton<VolunteerService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

var volunteerService = app.Services.GetRequiredService<VolunteerService>();
_ = Task.Run(async () => await volunteerService.GetVolunteerOpportunitiesAsync(true));; // Preload cache on startup

if (app.Environment.IsDevelopment())
{
    app.UseSwagger(); // Enable Swagger middleware
    app.UseSwaggerUI(); // Enable Swagger UI
}

app.UseCors("FrontendPolicy");

app.UseHttpsRedirection();
app.MapControllers();
app.Run();