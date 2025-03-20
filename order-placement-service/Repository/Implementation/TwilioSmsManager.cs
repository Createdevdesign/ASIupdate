using Microsoft.Extensions.Options;

using System;

using System.Threading.Tasks;
using System.Net;
using System.IO;
using Newtonsoft.Json;
using order_placement_service.Repository.Interfaces;
using order_placement_service.Model.BusinessBase;
using order_placement_service.Model;

namespace order_placement_service.Repository.Implementation
{
    public class TwilioSmsManager : ISmsManager
    {
        AppSettings _appSettings;
        public TwilioSmsManager(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }
        public async Task<VerificationCodeResponseDto> SendVerificationCode(VerificationCodeRequestDto verificationCodeRequestDto)
        {
            var httpWebRequest = (HttpWebRequest)WebRequest.Create(_appSettings.Twilio.VerificationCodeUrl);
            httpWebRequest.ContentType = "application/json";
            httpWebRequest.Method = "POST";
            httpWebRequest.Headers["X-Authy-API-Key"] = _appSettings.Twilio.AuthApiKey;
            using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
            {
                string json = JsonConvert.SerializeObject(new
                {
                    via = _appSettings.Twilio.Via,
                    phone_number = verificationCodeRequestDto.PhoneNumber,
                    country_code = (string.IsNullOrWhiteSpace(verificationCodeRequestDto.CountryCode)) ? _appSettings.Twilio.CountryCode : verificationCodeRequestDto.CountryCode,
                    code_length = _appSettings.Twilio.CodeLength,
                    locale = _appSettings.Twilio.Locale
                });
                streamWriter.Write(json);
            }
            try
            {
                var httpResponse = (HttpWebResponse)httpWebRequest.GetResponse();
                using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
                {
                    return JsonConvert.DeserializeObject<VerificationCodeResponseDto>(streamReader.ReadToEnd());
                }
            }
            catch (WebException ex)
            {
                string err = string.Empty;
                using (var stream = ex.Response.GetResponseStream())
                using (var reader = new StreamReader(stream))
                {
                    err = reader.ReadToEnd();
                }
                return JsonConvert.DeserializeObject<VerificationCodeResponseDto>(err);
            }
            catch (Exception ex)
            {
                return JsonConvert.DeserializeObject<VerificationCodeResponseDto>(null);
            }
        }
        public async Task<VerifyPhoneNumberResponseDto> VerifyPhoneNumber(VerifyPhoneNumberRequestDto request)
        {
            string countryCode = (string.IsNullOrWhiteSpace(request.CountryCode)) ? _appSettings.Twilio.CountryCode : request.CountryCode;
            string uurl = _appSettings.Twilio.VerifyPhoneUrl;
            uurl = string.Format(uurl, request.PhoneNumber, (string.IsNullOrWhiteSpace(request.CountryCode) ? _appSettings.Twilio.CountryCode : request.CountryCode), request.VerificationCode);
            HttpWebRequest req = WebRequest.Create(new Uri(uurl)) as HttpWebRequest;
            req.Method = "GET";
            req.Headers["X-Authy-API-Key"] = _appSettings.Twilio.AuthApiKey;
            try
            {
                HttpWebResponse response = (HttpWebResponse)req.GetResponse();
                if (response.StatusCode.ToString().ToLower() == "ok")
                {
                    string contentType = response.ContentType;
                    Stream content = response.GetResponseStream();
                    if (content != null)
                    {
                        StreamReader contentReader = new StreamReader(content);
                        string rr = contentReader.ReadToEnd();
                        var res = JsonConvert.DeserializeObject<VerifyPhoneNumberResponseDto>(rr);
                        if (res.Success == true)
                        {
                            return res;
                        }

                    }
                    return JsonConvert.DeserializeObject<VerifyPhoneNumberResponseDto>(null);
                }
                return JsonConvert.DeserializeObject<VerifyPhoneNumberResponseDto>(null);
            }
            catch (WebException ex)
            {
                string err = string.Empty;
                using (var stream = ex.Response.GetResponseStream())
                using (var reader = new StreamReader(stream))
                {
                    err = reader.ReadToEnd();
                }
                return JsonConvert.DeserializeObject<VerifyPhoneNumberResponseDto>(err);
            }
            catch (Exception ex)
            {
                return JsonConvert.DeserializeObject<VerifyPhoneNumberResponseDto>(null);
            }
        }
    }
}
