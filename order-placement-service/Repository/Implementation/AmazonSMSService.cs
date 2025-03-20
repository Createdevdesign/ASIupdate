using Amazon.Runtime;
using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;
using Amazon.SQS.Model;
using Microsoft.Extensions.Options;
using order_placement_service.Model.BusinessBase;
using order_placement_service.Model.NotificationFacade.Sms;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Implementation
{
    public class AmazonSMSService : Interfaces.ISMSService
    {
        private readonly AppSettings _appSettings;

        public AmazonSMSService(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }

        public async Task<SMSResponseDto> SendSMS(SMSRequestDto request)
        {
            string awsKey = _appSettings.AWS.AWSKey;
            string awsSecrete = _appSettings.AWS.AWSSecret;

            var awsCred = new BasicAWSCredentials(awsKey, awsSecrete);

            var smsResponse = new SMSResponseDto { };

            using (AmazonSimpleNotificationServiceClient client = new AmazonSimpleNotificationServiceClient(awsCred, Amazon.RegionEndpoint.USWest2))
            {
                PublishRequest publishRequest = new PublishRequest();
                publishRequest.PhoneNumber = $"{request.CountryCode}{request.Mobile}";
                //publishRequest.Message = request.Message;
                publishRequest.Message = request.Message;
                publishRequest.MessageAttributes.Add("AWS.SNS.SMS.SMSType", new Amazon.SimpleNotificationService.Model.MessageAttributeValue { StringValue = "Transactional", DataType = "String" });
                var response = await client.PublishAsync(publishRequest);
                smsResponse.MessageId = response.MessageId;
            }

            return smsResponse;
        }


    }
}
