
using order_placement_service.Entities.Customers;
using System;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Interfaces
{
    public interface ICustomersService
    {
        /// <summary>
        /// Get customer by username
        /// </summary>
        /// <param name="username">Username</param>
        /// <returns>Customer</returns>
        Task<Customer> GetCustomerByUsername(string username);

        /// <summary>
        /// Insert a customer
        /// </summary>
        /// <param name="customer">Customer</param>
        Task<Customer> SaveCustomer(Customer customer);

        /// <summary>
        /// Get Customer with Refresh token
        /// </summary>
        /// <param name="refreshtoken"></param>
        /// <returns></returns>
        Task<Customer> GetCustomerByRefreshToken(Guid refreshtoken);
    }
}
