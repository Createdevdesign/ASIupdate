using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.ExternalDataAccess
{
    public static class Utils
    {
        public static TOut GetResult<TOut>(this Task<TOut> task)
        {
            return task.ConfigureAwait(false).GetAwaiter().GetResult();
        }

        /// <summary>
        /// /// Divide the value by 100
        /// </summary>
        /// <param name="value"></param>
        /// <param name="denominator"></param>
        /// <returns></returns>
        public static decimal DivideNumber(this decimal value, int denominator)
        {
            return value / denominator;
        }
    }
}
