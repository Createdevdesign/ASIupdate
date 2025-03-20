using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace order_placement_service.ExternalDataAccess
{
    public class MyHttpClientFactory
    {
        private readonly string _token = "";
        public MyHttpClientFactory(string token)
        {
            this._token = token;
        }

        private static readonly JsonSerializerSettings SerializerSettings = new JsonSerializerSettings()
        {
            NullValueHandling = NullValueHandling.Ignore
        };
        private HttpClient Client
        {
            get
            {
                var handler = new HttpClientHandler();
                if (handler.SupportsAutomaticDecompression)
                {
                    handler.AutomaticDecompression = DecompressionMethods.GZip |
                                                     DecompressionMethods.Deflate;
                }
                return new HttpClient(handler)
                {
                    Timeout = new TimeSpan(0, 5, 0)
                };
            }
        }

        public async Task<RS> PostAsync<RQ, RS>(string urlWithQueryString, RQ request, Dictionary<string, string> headers = null, string compressionAlgorithm = null, bool? expect100Continue = false)
        {
            var client = default(HttpClient);
            try
            {
                Uri uri = new Uri(urlWithQueryString);
                var jsonRequest = JsonConvert.SerializeObject(request, SerializerSettings);
                byte[] bytes = Encoding.UTF8.GetBytes(jsonRequest);
                ByteArrayContent byteArrayAsHttpContent = new ByteArrayContent(bytes);
                byteArrayAsHttpContent.Headers.ContentLength = bytes.LongLength;
                byteArrayAsHttpContent.Headers.ContentType = MediaTypeHeaderValue.Parse("application/json");

                client = Client;
                if (headers != null && headers.Any())
                {
                    client.DefaultRequestHeaders.Clear();
                    if (!string.IsNullOrWhiteSpace(compressionAlgorithm))
                    {
                        client.DefaultRequestHeaders.Add("Accept-Encoding", compressionAlgorithm);
                    }
                    if (expect100Continue.HasValue && expect100Continue.Value)
                    {
                        client.DefaultRequestHeaders.ExpectContinue = true;
                    }
                    else
                    {
                        client.DefaultRequestHeaders.ExpectContinue = false;
                    }
                    foreach (var item in headers)
                    {
                        try
                        {
                            client.DefaultRequestHeaders.TryAddWithoutValidation(item.Key, item.Value);
                        }
                        catch (Exception)
                        {
                        }
                    }
                }
                if (!string.IsNullOrEmpty(_token))
                {
                    client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"Bearer {_token}");
                }
                HttpResponseMessage apiResponse = await client.PostAsync(uri, byteArrayAsHttpContent);
                string jsonResponse = await apiResponse.Content.ReadAsStringAsync();
                if ((int)apiResponse.StatusCode == (int)HttpStatusCode.Unauthorized)
                {
                    throw new UnauthorizedAccessException("You are not authorized to perform this operation!");
                }
                apiResponse.EnsureSuccessStatusCode();
                return JsonConvert.DeserializeObject<RS>(jsonResponse);
            }
            finally
            {
                if (client != null)
                {
                    client.Dispose();
                }
            }
        }

        public async Task<RS> PutAsync<RQ, RS>(string urlWithQueryString, RQ request, Dictionary<string, string> headers = null)
        {
            Uri uri = new Uri(urlWithQueryString);
            var jsonRequest = JsonConvert.SerializeObject(request, SerializerSettings);
            byte[] bytes = Encoding.UTF8.GetBytes(jsonRequest);
            ByteArrayContent byteArrayAsHttpContent = new ByteArrayContent(bytes);
            byteArrayAsHttpContent.Headers.ContentLength = bytes.LongLength;
            byteArrayAsHttpContent.Headers.ContentType = MediaTypeHeaderValue.Parse("application/json");

            using (var client = Client)
            {
                if (headers != null && headers.Any())
                {
                    client.DefaultRequestHeaders.Clear();
                    foreach (var item in headers)
                    {
                        try
                        {
                            client.DefaultRequestHeaders.TryAddWithoutValidation(item.Key, item.Value);
                        }
                        catch (Exception)
                        {
                        }
                    }
                }
                if (!string.IsNullOrEmpty(_token))
                {
                    client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", _token);
                }
                HttpResponseMessage apiResponse = await client.PutAsync(uri, byteArrayAsHttpContent);
                if ((int)apiResponse.StatusCode == (int)HttpStatusCode.Unauthorized)
                {
                    throw new UnauthorizedAccessException("You are not authorized to perform this operation!");
                }
                string jsonResponse = await apiResponse.Content.ReadAsStringAsync();
                apiResponse.EnsureSuccessStatusCode();
                return JsonConvert.DeserializeObject<RS>(jsonResponse);
            }
        }

        public RS Get<RS>(string urlWithQueryString, Dictionary<string, string> headers = null)
        {
            if (!string.IsNullOrEmpty(_token))
            {
                headers.Add("Authorization", _token);
            }
            return GetAsync<RS>(urlWithQueryString, headers).GetResult();
        }

        public async Task<RS> GetAsync<RS>(string urlWithQueryString, Dictionary<string, string> headers = null, bool? expect100Continue = false)
        {
            var client = default(HttpClient);
            try
            {
                client = Client;
                Uri uri = new Uri(urlWithQueryString);
                if (headers != null && headers.Any())
                {
                    client.DefaultRequestHeaders.Clear();
                    if (expect100Continue.HasValue && expect100Continue.Value)
                    {
                        client.DefaultRequestHeaders.ExpectContinue = true;
                    }
                    else
                    {
                        client.DefaultRequestHeaders.ExpectContinue = false;
                    }
                    foreach (var item in headers)
                    {
                        client.DefaultRequestHeaders.TryAddWithoutValidation(item.Key, item.Value);
                    }
                }
                if (!string.IsNullOrEmpty(_token))
                {
                    client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", _token);
                }
                HttpResponseMessage apiResponse = await client.GetAsync(uri);

                if ((int)apiResponse.StatusCode == (int)HttpStatusCode.Unauthorized)
                {
                    throw new UnauthorizedAccessException("You are not authorized to perform this operation!");
                }
                string jsonResponse = await apiResponse.Content.ReadAsStringAsync();
                apiResponse.EnsureSuccessStatusCode();

                return JsonConvert.DeserializeObject<RS>(jsonResponse);
            }
            finally
            {
                if (client != null)
                {
                    client.Dispose();
                }
            }
        }
    }
}
