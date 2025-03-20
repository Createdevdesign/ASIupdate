
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using order_placement_service.Entities.Customers;
using order_placement_service.Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Implementation
{
    public class CustomersService : ICustomersService
    {
        #region Fields
        private readonly IRepository<Customer> _customerRepository;
        private readonly IRepository<CustomerRole> _customerRoleRepository;
        #endregion

        public CustomersService(IRepository<Customer> customerRepository,
            IRepository<CustomerRole> customerRoleRepository)
        {
            _customerRepository = customerRepository;
            _customerRoleRepository = customerRoleRepository;
        }

        public async Task<Customer> GetCustomerByUsername(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return await Task.FromResult<Customer>(null);

            var filter = Builders<Customer>.Filter.Eq(x => x.Username, username.ToLower());
            return await _customerRepository.Collection.Find(filter).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Insert a customer
        /// </summary>
        /// <param name="customer">Customer</param>
        public async Task<Customer> SaveCustomer(Customer customer)
        {
            if (customer == null)
                throw new ArgumentNullException("customer");

            if (!string.IsNullOrEmpty(customer.Username))
                customer.Username = customer.Username.ToLower();

            return await _customerRepository.InsertAsync(customer);
        }

        /// <summary>
        /// get customer with refreshtoken
        /// </summary>
        /// <param name="refreshtoken"></param>
        /// <returns></returns>
        public async Task<Customer> GetCustomerByRefreshToken(Guid refreshtoken)
        {
            return await _customerRepository.Table.Where(a => a.Sessions.Any(x => x.RefreshTokenId == refreshtoken)).FirstOrDefaultAsync();
        }
    }
}
