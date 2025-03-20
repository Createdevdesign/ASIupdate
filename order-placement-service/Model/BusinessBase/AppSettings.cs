using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Model.BusinessBase
{
    public class AppSettings
    {
        public TwilioSettings Twilio { get; set; }
        public StripeSettings Stripe { get; set; }
        public AWS AWS { get; set; }
        public TomTom TomTom { get; set; }
        public string MongoDbConnectionString { get; set; }
        public string ClientId { get; set; }
        public string Secret { get; set; }
        public string TokenSecret { get; set; }
        public int TokenTimeout { get; set; }
        public string CountryCode { get; set; }
        public string VerifyEmailUrl { get; set; }
        public string AWSBucketForImages { get; set; }
        public string AndroidAppUrl { get; set; }
        public string IosAppUrl { get; set; }
        public string FeedbackEmail { get; set; }
        public TaxJar TaxJar { get; set; }
    }
    public class AWS
    {
        public string AWSKey { get; set; }
        public string AWSSecret { get; set; }
        public SMTPDetails AWSSMTP { get; set; }

    }
    public class SMTPDetails
    {
        public string SMTPUsername { get; set; }
        public string SMTPPassword { get; set; }
        public string FROM { get; set; }
        public string CC { get; set; }
        public string DisplayName { get; set; }
        public string Host { get; set; }
        public int Port { get; set; }
    }
    public class TwilioSettings
    {
        public string AuthApiKey { get; set; }
        public string VerificationCodeUrl { get; set; }
        public string Via { get; set; }
        public string CountryCode { get; set; }
        public int CodeLength { get; set; }
        public string Locale { get; set; }
        public string VerifyPhoneUrl { get; set; }
    }
    public class StripeSettings
    {
        public string SecretKey { get; set; }
        public string PublishableKey { get; set; }
    }

    public class TomTom
    {
        public string Key { get; set; }
        public string Version { get; set; }
        public string RoutingURL { get; set; }
    }

    public class TaxJar
    {
        public string TaxJarAppname { get; set; }
        public string TaxJarVersionNumber { get; set; }
        public string TaxJarAccountID { get; set; }
        public string TaxJarLicensekey { get; set; }
        public string TaxJarCompanyCode { get; set; }
        public string TaxJarSupportEmail { get; set; }
    }
}
