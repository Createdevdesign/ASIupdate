using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Repository.Interfaces
{
    public interface IMonetaryTransaction
    {
        string RequestedCurrency { get; set; }
        string BaseCurrency { get; set; }
        decimal AmountInRequestedCurrency { get; set; }
        decimal AmountInBaseCurrency { get; set; }
        decimal FxRate { get; set; }

    }
}
