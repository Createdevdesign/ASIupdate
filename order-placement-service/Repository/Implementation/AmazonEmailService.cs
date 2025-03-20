using Microsoft.Extensions.Options;
using order_placement_service.Model.BusinessBase;
using order_placement_service.Model.NotificationFacade.Email;
using order_placement_service.Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Implementation
{
    public class AmazonEmailService : IEmailService
    {
        private readonly AppSettings _appSettings;
        public AmazonEmailService(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }
        public async Task<EmailResponseDto> SendEmail(EmailRequestDto request)
        {
            var smtpDetails = _appSettings.AWS.AWSSMTP;
            // Replace sender@example.com with your "From" address. 
            // This address must be verified with Amazon SES.
            String FROM = smtpDetails.FROM;
            String FROMNAME = smtpDetails.DisplayName;

            // Replace recipient@example.com with a "To" address. If your account 
            // is still in the sandbox, this address must be verified.
            //String TO = "skchauhan016@gmail.com";
            String TO = request.CustomerEmail;

            var ccList = _appSettings.AWS.AWSSMTP.CC.Split(',');

            // Replace smtp_username with your Amazon SES SMTP user name.
            String SMTP_USERNAME = smtpDetails.SMTPUsername;

            // Replace smtp_password with your Amazon SES SMTP user name.
            String SMTP_PASSWORD = smtpDetails.SMTPPassword;

            // (Optional) the name of a configuration set to use for this message.
            // If you comment out this line, you also need to remove or comment out
            // the "X-SES-CONFIGURATION-SET" header below.
            String CONFIGSET = "ConfigSet";

            // If you're using Amazon SES in a region other than US West (Oregon), 
            // replace email-smtp.us-west-2.amazonaws.com with the Amazon SES SMTP  
            // endpoint in the appropriate AWS Region.
            String HOST = smtpDetails.Host;

            // The port you will connect to on the Amazon SES SMTP endpoint. We
            // are choosing port 587 because we will use STARTTLS to encrypt
            // the connection.
            int PORT = smtpDetails.Port;

            // The subject line of the email
            String SUBJECT = request.Subject;


            // The body of the email
            String BODY = request.Body;

            // Create and build a new MailMessage object
            MailMessage message = new MailMessage();
            message.IsBodyHtml = true;
            message.From = new MailAddress(FROM, FROMNAME);
            message.To.Add(new MailAddress(TO));
            if (!string.IsNullOrEmpty(request.StoreEmail))
            {
                message.To.Add(new MailAddress(request.StoreEmail));
            }

            foreach (var cc in ccList)
            {
                if (!string.IsNullOrEmpty(cc))
                    message.CC.Add(new MailAddress(cc));
            }

            message.Subject = SUBJECT;
            message.Body = BODY;

            // Comment or delete the next line if you are not using a configuration set
            //message.Headers.Add("X-SES-CONFIGURATION-SET", CONFIGSET);

            using (var client = new System.Net.Mail.SmtpClient(HOST, PORT))
            {
                // Pass SMTP credentials
                client.Credentials =
                    new NetworkCredential(SMTP_USERNAME, SMTP_PASSWORD);

                // Enable SSL encryption
                client.EnableSsl = true;

                client.Send(message);

            }
            return new EmailResponseDto { IsEmailSent = true };
        }

        
    }
}
