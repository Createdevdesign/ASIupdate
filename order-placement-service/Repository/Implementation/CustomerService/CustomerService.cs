using AutoMapper;
using MongoDB.Driver;
using order_placement_service.Entities.Common;
using order_placement_service.Entities.Customers;
using order_placement_service.Entities.Notification;
using order_placement_service.Model.CustomerFacade.Customer;
using order_placement_service.Repository.Interfaces;
using order_placement_service.Repository.Interfaces.CustomerService;
using System;

using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Implementation.CustomerService
{
    public class CustomerService : ICustomerService
    {
        #region Fields
        private readonly IRepository<Customer> _customerRepository;
        private readonly IRepository<CustomerRole> _customerRoleRepository;
        private readonly IRepository<UserEmailVerification> _emailVerificationRepository;
        private readonly IMapper _mapper;
        private const string firstName = "FirstName";
        private const string lastName = "LastName";
        private const string userName = "UserName";
        private readonly IRepository<StateProvince> _stateRepository;

        #endregion

        public CustomerService(IRepository<Customer> customerRepository,
            IRepository<CustomerRole> customerRoleRepository,
            IRepository<UserEmailVerification> emailVerificationRepository,
            IRepository<StateProvince> stateRepository,
            IMapper mapper)
        {
            _customerRepository = customerRepository;
            _customerRoleRepository = customerRoleRepository;
            _emailVerificationRepository = emailVerificationRepository;
            _stateRepository = stateRepository;
            _mapper = mapper;
        }

        public async Task<UserProfileResponseDto> GetUserProfile(GetUserProfileRequestDto userProfileRequestDto)
        {
            if (string.IsNullOrWhiteSpace(userProfileRequestDto.UserName))
                return await Task.FromResult<UserProfileResponseDto>(null);

            var filter = Builders<Customer>.Filter.Eq(x => x.Username, userProfileRequestDto.UserName.ToLower());
            var customer = await _customerRepository.Collection.Find(filter).FirstOrDefaultAsync();
            var response = _mapper.Map<Customer, UserProfileResponseDto>(customer);
            response.IsEmailVerified = _emailVerificationRepository.Table.Where(x => x.Email.Equals(response.Email) && x.CustomerId.Equals(response.CustomerId)).Select(a => a.IsVerified).FirstOrDefault();
            response.ShippingAddress.StateName = _stateRepository.Table.Where(a => a.Id.Equals(response.ShippingAddress.StateProvinceId)).Select(b => b.Name).FirstOrDefault();
            return response;
        }

        public async Task<UpdateResultDto> UpdateUserProfile(UpdateUserProfileRequestDto updateUserProfileRequestDto)
        {
            //Update GenericAttribute array
            var filterFirstname = Builders<Customer>.Filter.ElemMatch(x => x.GenericAttributes, y => y.Key.Equals(firstName));
            var updateFirstname = Builders<Customer>.Update.Set(x => x.GenericAttributes.ElementAt(-1).Value, updateUserProfileRequestDto.Firstname);
            await _customerRepository.Collection.UpdateOneAsync(filterFirstname, updateFirstname);

            var filterLastname = Builders<Customer>.Filter.ElemMatch(x => x.GenericAttributes, y => y.Key.Equals(lastName));
            var updateLastname = Builders<Customer>.Update.Set(x => x.GenericAttributes.ElementAt(-1).Value, updateUserProfileRequestDto.Lastname);
            await _customerRepository.Collection.UpdateOneAsync(filterLastname, updateLastname);

            Customer customer = await _customerRepository.Collection.Find(x => x.Username.Equals(updateUserProfileRequestDto.Username)).SingleOrDefaultAsync();
            customer.DisplayName = updateUserProfileRequestDto.DisplayName;
            customer.ShippingAddress = new Address
            {
                Address1 = updateUserProfileRequestDto.ShippingAddress.Address1,
                Address2 = updateUserProfileRequestDto.ShippingAddress.Address2,
                City = updateUserProfileRequestDto.ShippingAddress.City,
                Company = updateUserProfileRequestDto.ShippingAddress.Company,
                CountryId = updateUserProfileRequestDto.ShippingAddress.CountryId,
                CustomerId = updateUserProfileRequestDto.ShippingAddress.CustomerId,
                Email = updateUserProfileRequestDto.ShippingAddress.Email,
                //FaxNumber = updateUserProfileRequestDto.ShippingAddress.FaxNumber,
                FirstName = updateUserProfileRequestDto.ShippingAddress.FirstName,
                LastName = updateUserProfileRequestDto.ShippingAddress.LastName,
                PhoneNumber = updateUserProfileRequestDto.ShippingAddress.PhoneNumber,
                StateProvinceId = updateUserProfileRequestDto.ShippingAddress.StateProvinceId,
                ZipPostalCode = updateUserProfileRequestDto.ShippingAddress.ZipPostalCode,
                VatNumber = updateUserProfileRequestDto.ShippingAddress.VatNumber,
            };

            customer = await _customerRepository.UpdateAsync(customer);
            return new UpdateResultDto { IsAcknowledged = true, ModifiedCount = 1 };
        }

        public async Task<SavePreferenceResponseDto> SaveMyPreference(SavePreferenceRequestDto savePreferenceRequestDto)
        {
            if (string.IsNullOrWhiteSpace(savePreferenceRequestDto.Username))
                return await Task.FromResult<SavePreferenceResponseDto>(null);

            SavePreferenceResponseDto savePreferenceResponseDto = new SavePreferenceResponseDto { Inserted = false };
            Customer customer = _customerRepository.Table.Where(a => a.Username == savePreferenceRequestDto.Username).First();

            try
            {
                if (customer == null)
                    return await Task.FromResult<SavePreferenceResponseDto>(null);
                if (customer.Preference != null && customer.Preference.Notifications.Count == 0)
                {
                    customer.Preference.Notifications.AddRange(savePreferenceRequestDto.Notifications);
                }
                else
                {
                    customer.Preference = new Notification();
                    customer.Preference.Notifications.RemoveRange(0, customer.Preference.Notifications.Count);
                    customer = await _customerRepository.UpdateAsync(customer);
                    customer.Preference.Notifications.AddRange(savePreferenceRequestDto.Notifications);
                }
                customer = await _customerRepository.UpdateAsync(customer);
                savePreferenceResponseDto.Inserted = true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return savePreferenceResponseDto;
        }

        public async Task<UserEmailResponseDto> GetUserEmail(GetUserEmailRequestDto userEmailRequestDto)
        {
            if (string.IsNullOrWhiteSpace(userEmailRequestDto.Username))
                return await Task.FromResult<UserEmailResponseDto>(null);

            var filter = Builders<Customer>.Filter.Eq(x => x.Username, userEmailRequestDto.Username.ToLower());
            var customer = await _customerRepository.Collection.Find(filter).FirstOrDefaultAsync();
            return _mapper.Map<Customer, UserEmailResponseDto>(customer);
        }

        public async Task<UpdateResultDto> UpdateUserEmailDisplayName(UpdateUserEmailRequestDto updateUserEmailRequestDto)
        {
            var filter = Builders<Customer>.Filter.Eq(x => x.Username, updateUserEmailRequestDto.Username);
            UpdateResult result;
            if (!string.IsNullOrWhiteSpace(updateUserEmailRequestDto.DisplayName))
            {
                var updatedCustomer = Builders<Customer>.Update
                .Set(x => x.Email, updateUserEmailRequestDto.Email)
                .Set(x => x.DisplayName, updateUserEmailRequestDto.DisplayName);

                result = await _customerRepository.Collection.UpdateOneAsync(filter, updatedCustomer);
            }
            else
            {
                var updatedCustomer = Builders<Customer>.Update
                .Set(x => x.Email, updateUserEmailRequestDto.Email);

                result = await _customerRepository.Collection.UpdateOneAsync(filter, updatedCustomer);
            }

            return _mapper.Map<UpdateResult, UpdateResultDto>(result);
        }

        public async Task<StateProvinceDto> GetStateProvince()
        {
            var stateProvinces = _stateRepository.Table.Where(a => a.Id != null).OrderBy(b => b.DisplayOrder).ToList();
            if (stateProvinces == null)
                return await Task.FromResult<StateProvinceDto>(null);

            var stateProvinceDto = new StateProvinceDto
            {
                StateProvinces = (from sp in stateProvinces
                                  select new StateProvinces()
                                  {
                                      StateProvinceCode = sp.Abbreviation,
                                      StateProvinceId = sp.Id,
                                      Name = sp.Name,
                                      DisplayOrder = sp.DisplayOrder
                                  }).ToList()
            };
            return stateProvinceDto;
        }
    }
}
