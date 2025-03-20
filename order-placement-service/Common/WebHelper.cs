using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using order_placement_service.Entities.Products;
using order_placement_service.Enums;
using SkiaSharp;

using System;
using System.Collections.Generic;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Serialization;

namespace order_placement_service.Common
{
    public class WebHelper
    {
        private const int MULTIPLE_THUMB_DIRECTORIES_LENGTH = 3;

        public async Task<string> RetrieveUsernameFromToken(HttpRequest request)
        {
            // Load username from JWT token
            StringValues bearerAuthToken;
            string authToken = string.Empty;
            bool tokenAvailable = request.Headers.TryGetValue("Authorization", out bearerAuthToken);
            if (!tokenAvailable)
                return null;

            if (bearerAuthToken.ToString().ToLower().Contains("bearer"))
                authToken = bearerAuthToken.ToString().Replace("Bearer", "").Replace(" ", "");

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenClaims = tokenHandler.ReadJwtToken(authToken);
            string userName = tokenClaims.Claims.Where(a => a.Type.Equals("unique_name")).Select(b => b.Value).FirstOrDefault();
            if (string.IsNullOrWhiteSpace(userName))
                return null;

            return userName;
        }

        public async Task<string> Serialize<T>(T dataToSerialize)
        {
            var emptyNamespaces = new XmlSerializerNamespaces(new[] { XmlQualifiedName.Empty });
            var serializer = new XmlSerializer(dataToSerialize.GetType());
            var settings = new XmlWriterSettings { OmitXmlDeclaration = true };
            using (var stream = new StringWriter())
            {
                using (var writer = XmlWriter.Create(stream, settings))
                {
                    serializer.Serialize(writer, dataToSerialize, emptyNamespaces);
                    return stream.ToString();
                }
            }
        }

        public async Task<T> Deserialize<T>(string xmlText)
        {
            var stringReader = new System.IO.StringReader(xmlText);
            var serializer = new XmlSerializer(typeof(T));
            return (T)serializer.Deserialize(stringReader);
        }

        /// <summary>
        /// Get a picture URL
        /// </summary>
        /// <param name="picture">Picture instance</param>
        /// <param name="targetSize">The target picture size (longest side)</param>
        /// <param name="showDefaultPicture">A value indicating whether the default picture is shown</param>
        /// <param name="storeLocation">Store location URL; null to use determine the current store location automatically</param>
        /// <param name="defaultPictureType">Default picture type</param>
        /// <returns>Picture URL</returns>
        public virtual async Task<string> GetPictureUrl(Picture picture,
            int targetSize = 0,
            bool showDefaultPicture = true,
            string storeLocation = null,
            PictureType defaultPictureType = PictureType.Entity)
        {
            byte[] pictureBinary = picture.PictureBinary;

            string seoFileName = picture.SeoFilename;
            string lastPart = GetFileExtensionFromMimeType(picture.MimeType);
            string thumbFileName;

            if (targetSize == 0)
            {
                thumbFileName = !string.IsNullOrEmpty(seoFileName) ?
                    string.Format("{0}_{1}.{2}", picture.Id, seoFileName, lastPart) :
                    string.Format("{0}.{1}", picture.Id, lastPart);

                //return thumbFileName;

                //var thumbFilePath = GetThumbLocalPath(thumbFileName);

                //if (await GeneratedThumbExists(thumbFilePath, thumbFileName))
                //    return GetThumbUrl(thumbFileName, storeLocation);
            }
            else
            {
                thumbFileName = !string.IsNullOrEmpty(seoFileName) ?
                    string.Format("{0}_{1}_{2}.{3}", picture.Id, seoFileName, targetSize, lastPart) :
                    string.Format("{0}_{1}.{2}", picture.Id, targetSize, lastPart);
                //var thumbFilePath = GetThumbLocalPath(thumbFileName);

                //if (await GeneratedThumbExists(thumbFilePath, thumbFileName))
                //    return GetThumbUrl(thumbFileName, storeLocation);

                using (var image = SKBitmap.Decode(pictureBinary))
                {
                    pictureBinary = ApplyResize(image, EncodedImageFormat(picture.MimeType), targetSize);
                }

            }
            return GetThumbUrl(thumbFileName, storeLocation);
        }

        /// <summary>
        /// Returns the file extension from mime type.
        /// </summary>
        /// <param name="mimeType">Mime type</param>
        /// <returns>File extension</returns>
        protected virtual string GetFileExtensionFromMimeType(string mimeType)
        {
            if (mimeType == null)
                return null;

            string[] parts = mimeType.Split('/');
            string lastPart = parts[parts.Length - 1];
            switch (lastPart)
            {
                case "pjpeg":
                    lastPart = "jpg";
                    break;
                case "x-png":
                    lastPart = "png";
                    break;
                case "x-icon":
                    lastPart = "ico";
                    break;
            }
            return lastPart;
        }

        /// <summary>
        /// Get picture (thumb) local path
        /// </summary>
        /// <param name="thumbFileName">Filename</param>
        /// <returns>Local picture thumb path</returns>
        protected virtual string GetThumbLocalPath(string thumbFileName)
        {
            //need to figure out how to get the site path
            var thumbsDirectoryPath = Path.Combine(@"http://3.129.30.124:4000/", "content/images/thumbs");
            var thumbFilePath = Path.Combine(thumbsDirectoryPath, thumbFileName);
            return thumbFilePath;
        }

        /// <summary>
        /// Get a value indicating whether some file (thumb) already exists
        /// </summary>
        /// <param name="thumbFilePath">Thumb file path</param>
        /// <param name="thumbFileName">Thumb file name</param>
        /// <returns>Result</returns>
        protected virtual Task<bool> GeneratedThumbExists(string thumbFilePath, string thumbFileName)
        {
            return Task.FromResult(File.Exists(thumbFilePath));
        }

        /// <summary>
        /// Get picture (thumb) URL 
        /// </summary>
        /// <param name="thumbFileName">Filename</param>
        /// <param name="storeLocation">Store location URL; null to use determine the current store location automatically</param>
        /// <returns>Local picture thumb path</returns>
        protected virtual string GetThumbUrl(string thumbFileName, string storeLocation = "/")
        {
            var url = storeLocation + "content/images/thumbs/";
            url = url + thumbFileName;
            return url;
        }

        protected byte[] ApplyResize(SKBitmap image, SKEncodedImageFormat format, int targetSize)
        {
            if (image == null)
                throw new ArgumentNullException("image");

            if (targetSize <= 0)
            {
                targetSize = 800;
            }
            float width, height;
            if (image.Height > image.Width)
            {
                // portrait
                width = image.Width * (targetSize / (float)image.Height);
                height = targetSize;
            }
            else
            {
                // landscape or square
                width = targetSize;
                height = image.Height * (targetSize / (float)image.Width);
            }

            if ((int)width == 0 || (int)height == 0)
            {
                width = image.Width;
                height = image.Height;
            }
            try
            {
                using (var resized = image.Resize(new SKImageInfo((int)width, (int)height), SKFilterQuality.Medium))
                {
                    using (var resimage = SKImage.FromBitmap(resized))
                    {
                        return resimage.Encode(format, 80).ToArray();
                    }
                }
            }
            catch
            {
                return image.Bytes;
            }

        }

        protected SKEncodedImageFormat EncodedImageFormat(string mimetype)
        {
            SKEncodedImageFormat defaultFormat = SKEncodedImageFormat.Jpeg;
            if (string.IsNullOrEmpty(mimetype))
                return defaultFormat;

            mimetype = mimetype.ToLower();

            if (mimetype.Contains("jpeg") || mimetype.Contains("jpg") || mimetype.Contains("pjpeg"))
                return defaultFormat;

            if (mimetype.Contains("png"))
                return SKEncodedImageFormat.Png;

            if (mimetype.Contains("webp"))
                return SKEncodedImageFormat.Webp;

            if (mimetype.Contains("webp"))
                return SKEncodedImageFormat.Webp;

            if (mimetype.Contains("gif"))
                return SKEncodedImageFormat.Gif;

            //if mime type is BMP format then happens error with convert picture
            if (mimetype.Contains("bmp"))
                return SKEncodedImageFormat.Png;

            if (mimetype.Contains("ico"))
                return SKEncodedImageFormat.Ico;

            return defaultFormat;

        }

        public bool IsStoreOpen(string companyHours)
        {
            bool response = false;
            if (string.IsNullOrWhiteSpace(companyHours))
                response = true;

            try
            {
                var timings = companyHours.Split(';');
                for (int i = 0; i < timings.Count(); i++)
                {
                    if (timings[i].Contains("Holidays"))
                    {
                        var holidays = timings[i].Split('=')[1].Split(',');

                        if (holidays.Contains("mm/dd/YYYY"))
                            continue;

                        if (holidays.Contains(DateTime.UtcNow.ToString("mm/dd/YYYY")))
                            response = false;
                    }
                    else
                    {
                        var days = timings[i].Split('=')[0];
                        var time = timings[i].Split('=')[1];
                        DateTime startTime = DateTime.ParseExact(time.Split('-')[0].Trim(), "hh:mmtt", CultureInfo.GetCultureInfo("en-US"));
                        DateTime endTime = DateTime.ParseExact(time.Split('-')[1].Trim(), "hh:mmtt", CultureInfo.GetCultureInfo("en-US"));
                        //TimeZoneInfo pst = TimeZoneInfo.FindSystemTimeZoneById("Pacific Standard Time");
                        //DateTime startTime = TimeZoneInfo.ConvertTime(start, pst, TimeZoneInfo.Utc);
                        //DateTime endTime = TimeZoneInfo.ConvertTime(end, pst, TimeZoneInfo.Utc);

                        TimeZoneInfo pst = TimeZoneConverter.TZConvert.GetTimeZoneInfo("Pacific Standard Time");
                        DateTime pstTime = TimeZoneInfo.ConvertTime(DateTime.UtcNow, TimeZoneInfo.Utc, pst);

                        int startOfWeek = 0, endOfWeek = 0;

                        //Loop for a week
                        for (int j = 0; j < 7; j++)
                        {
                            if (Enum.GetName(typeof(DayOfWeek), j).StartsWith(days.Split('-')[0].Trim()))//startday
                                startOfWeek = j;
                            if (Enum.GetName(typeof(DayOfWeek), j).StartsWith(days.Split('-')[1].Trim()))//endday
                                endOfWeek = j;
                        }

                        int weekDay = (int)DateTime.UtcNow.DayOfWeek;

                        if ((weekDay >= startOfWeek && weekDay <= endOfWeek) || weekDay == endOfWeek || weekDay == startOfWeek)
                        {
                            if (startTime.TimeOfDay.Hours <= pstTime.TimeOfDay.Hours && endTime.TimeOfDay.Hours >= pstTime.TimeOfDay.Hours)
                                response = true;
                            else if (startTime.TimeOfDay.Hours <= pstTime.TimeOfDay.Hours && endTime.DayOfYear >= pstTime.DayOfYear && endTime.TimeOfDay.Hours < pstTime.TimeOfDay.Hours)
                                response = true;
                            else
                                continue;
                        }

                        //return $"{startTime} {endTime} {pstTime} {startTime.Hour} {endTime.Hour} {pstTime.Hour}";
                    }
                }
            }
            catch (Exception)
            {
                response = true;
            }
            return response;
        }


    }
}
