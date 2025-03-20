using AutoMapper;
using clover_webhook.Entities;
using clover_webhook.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
namespace clover_webhook.Controllers;

[ApiController]
[Route("authservice/[controller]")]
public class AppController : ControllerBase
{
    private readonly AppSettings _appSettings;
     private readonly IMapper _mapper;
    private readonly clover_webhook.Repository.Services.IRepository<CloverWebhook> _cloverWebhookRepository;
    
    public AppController(IOptions<AppSettings> appSettings,IMapper mapper,
     clover_webhook.Repository.Services.IRepository<CloverWebhook> cloverWebhookRepository){
        
_appSettings = appSettings.Value;
 _mapper = mapper;
  _cloverWebhookRepository = cloverWebhookRepository;

    }

    [HttpPost, Route("cloverWebHook")]
        public async Task<IActionResult> FromCloverWebHook([FromBody] dynamic data)
        {
            CloverWebhookDto webhookDto = new CloverWebhookDto();
             string jsonStr = data.ToString();
            var json = JObject.Parse(jsonStr);

            foreach (var item in json)
            {
                if (item.Key == "verificationCode")
                {
                    webhookDto.VerificationCode = item.Key;
                    break;
                }
                else
                    break;
            }
             if (!string.IsNullOrWhiteSpace(webhookDto.VerificationCode))
            {
                var verifyWebHook = _mapper.Map<CloverWebhookDto, CloverWebhook>(webhookDto);
                await _cloverWebhookRepository.InsertAsync(verifyWebHook);
                return Ok(webhookDto.VerificationCode);
            }
             return Ok("WebHook notification from Clover processed.");
        }
   }
