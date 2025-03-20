using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using order_placement_service.Common;
using order_placement_service.Configurations;
using order_placement_service.Middleware;
using order_placement_service.Model.BusinessBase;
using order_placement_service.Model.CustomerFacade.Orders;
using order_placement_service.Model.OrderFacade.Validators;
using order_placement_service.Repository.Implementation;
using order_placement_service.Repository.Implementation.CustomerService;
using order_placement_service.Repository.Implementation.Framewrokservice;
using order_placement_service.Repository.Interfaces;
using order_placement_service.Repository.Interfaces.CustomerService;
using order_placement_service.Repository.Interfaces.FrameworkService;
using order_placement_service.Settings;
using order_placement_service.Validators;
using Stripe;
 
 
var builder = WebApplication.CreateBuilder(args);
 builder.Services.AddCors(
               options =>
               {
                   options.AddPolicy("CorsPolicy",
                       builder => builder
                           .WithOrigins("https://dev.swiftserve.us",
                           "https://api.dev.swiftserve.us",
                           "http://localhost:3000",
                           "http://localhost:3001")
                           .WithMethods()
                           .AllowAnyHeader()
                           .AllowCredentials());
               });

// Add services to the container.

 builder.Services.AddControllers(opt =>
            {
                opt.Filters.Add(typeof(ValidatorActionFilter));
            })
           .AddFluentValidation(fv =>
           {
               fv.RegisterValidatorsFromAssemblyContaining<PlaceOrderRequestDtoValidator>();
           });
            builder.Services.AddControllers();

            builder.Services.AddHealthChecks();
           //.AddCheck("Health Check API's", () => HealthCheckResult.Healthy("Server is healthy"));

          //  builder.Services.AddHealthChecks().AddCheck("Health Check API's", () => HealthCheckResult.Healthy("Server is healthy"));


            // configure strongly typed settings objects
            var appSettingsSection = builder.Configuration.GetSection("AppSettings");
            builder.Services.Configure<AppSettings>(appSettingsSection);

            builder.Services.AddApiVersioning();

            builder.Services.AddAutoMapper(typeof(Program));

            builder.Services.AddSwaggerGen(c =>
            { 
                c.SwaggerDoc("v1", new OpenApiInfo()
                {
                    Version = "v1",
                    Title = "SwiftServe Order Service API",
                    Description = "SwiftServe Order Service API Description"
                });
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please insert JWT with Bearer into field",
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement());
            });
            // Add S3 to the ASP.NET Core dependency injection framework.
            //services.AddAWSService<Amazon.S3.IAmazonS3>();

            builder.Services.AddScoped(typeof(WebHelper));
            builder.Services.AddScoped(typeof(IRepository<>), typeof(order_placement_service.Repository.Implementation.MongoDBRepository<>));
            builder.Services.AddTransient<ISMSService, AmazonSMSService>();
            builder.Services.AddTransient<IEmailService, AmazonEmailService>();
            builder.Services.AddTransient<ICustomerService, order_placement_service.Repository.Implementation.CustomerService.CustomerService>();
            builder.Services.AddTransient<INotificationService, NotificationService>();
            builder.Services.AddTransient<order_placement_service.Repository.Interfaces.IOrderService, order_placement_service.Repository.Implementation.OrderService>();
            builder.Services.AddTransient<IConsumerPaymentProvider, StripeConsumerPaymentProvider>();
            builder.Services.AddTransient<OrderSettings>();
            builder.Services.AddTransient<SecuritySettings>();
            var mapperConfig = new MapperConfiguration(mc =>
            {
                mc.AddProfile(new OrderServiceMapperConfiguration());
            });

            IMapper mapper = mapperConfig.CreateMapper();
            builder.Services.AddSingleton(mapper);

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
});

            
//>>>>>>> 9ff5f56c3e66a3568251a1e60fdfd40e7339028e
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
 app.UseMiddleware<ExceptionHandlerMiddleware>();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
   
}

app.UseHttpsRedirection();

            app.UseRouting();
              app.UseCors("CorsPolicy");

            app.UseSwagger();

            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("../swagger/v1/swagger.json", "SwiftServe Order Service Api v1");
            });

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                // endpoints.MapHealthChecks("/api/cart/v1/health");
                endpoints.MapHealthChecks("/health", new HealthCheckOptions { AllowCachingResponses = false });
                endpoints.MapControllers();
            });
            // stripe configuration
            StripeConfiguration.ApiKey = builder.Configuration["AppSettings:Stripe:SecretKey"];

app.Run();