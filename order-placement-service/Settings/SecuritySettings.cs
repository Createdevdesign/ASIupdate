﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Settings
{
    public class SecuritySettings// : ISettings
    {

        /// <summary>
        /// Gets or sets an encryption key
        /// </summary>
        public string EncryptionKey { get; set; }

        /// <summary>
        /// Gets or sets a list of admin area allowed IP addresses
        /// </summary>
        public List<string> AdminAreaAllowedIpAddresses { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether XSRF protection for admin area should be enabled
        /// </summary>
        public bool EnableXsrfProtectionForAdminArea { get; set; }
        /// <summary>
        /// Gets or sets a value indicating whether XSRF protection for public store should be enabled
        /// </summary>
        public bool EnableXsrfProtectionForPublicStore { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether honeypot is enabled on the registration page
        /// </summary>
        public bool HoneypotEnabled { get; set; }
        /// <summary>
        /// Gets or sets a honeypot input name
        /// </summary>
        public string HoneypotInputName { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether to allow non-ASCII characters in headers
        /// </summary>
        public bool AllowNonAsciiCharInHeaders { get; set; }
    }
}
