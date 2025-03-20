using AutoMapper;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using order_placement_service.Entities.Customers;
using order_placement_service.Entities.User;
using order_placement_service.Repository.Interfaces;
using order_placement_service.Service.AuthService.PhoneValidation;
using order_placement_service.Service.AuthService.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Implementation
{
    public class UserSession : IUserSession
    {
        private readonly IRepository<UserSessions> _userTokenRepository;
        private readonly IRepository<Customer> _customerRepository;
        private readonly IMapper _mapper;

        public UserSession(IRepository<UserSessions> userTokenRepository, IRepository<Customer> customerRepository, IMapper mapper)
        {
            _userTokenRepository = userTokenRepository;
            _customerRepository = customerRepository;
            _mapper = mapper;
        }

        public async Task<bool> DeleteSession(order_placement_service.Service.AuthService.User.LogoutRequestDto logoutRequestDto)
        {
            if (logoutRequestDto == null)
                throw new ArgumentNullException("DeleteUserSession");

            var customer = await _customerRepository.Table.Where(a => a.Sessions.Any(b => b.DeviceId == logoutRequestDto.DeviceId && b.RefreshTokenId == logoutRequestDto.RefreshToken)).SingleOrDefaultAsync();

            if (customer == null)
            {
                throw new UnauthorizedAccessException("Invalid device");
            }

            //var session = userSession.Sessions.First(b => b.RefreshTokenId == logoutRequestDto.RefreshToken && b.DeviceId == logoutRequestDto.DeviceId);
            var session = customer.Sessions.First(b => b.DeviceId == logoutRequestDto.DeviceId);
            var updatebuilder = Builders<Customer>.Update;
            var update = updatebuilder.Pull(p => p.Sessions, session);
            var result = await _customerRepository.Collection.UpdateOneAsync(new BsonDocument("_id", customer.Id), update);
            return result.IsAcknowledged;
        }

        public async Task<UserSessionDto> SaveUserSession(PhoneNumberVerificationRequestDto phoneVerificationRequestDto)
        {
            UserSessions userSession = await _userTokenRepository.Table.Where(a => a.UserName == phoneVerificationRequestDto.PhoneNumber).SingleOrDefaultAsync();
            Guid refreshToken = Guid.NewGuid();
            Session session = null;
            if (userSession == null)
            {
                userSession = new UserSessions
                {
                    UserName = phoneVerificationRequestDto.PhoneNumber,
                    CreatedDate = DateTime.UtcNow,
                    LastUpdatedDate = DateTime.UtcNow,
                    Sessions = new List<Session>()
                };
                session = new Session
                {
                    DeviceId = phoneVerificationRequestDto.DeviceId,
                    RefreshTokenId = refreshToken,
                    CreatedDate = DateTime.UtcNow,
                    DeviceType = phoneVerificationRequestDto.DeviceType,
                    OS = phoneVerificationRequestDto.OS,
                    LastUpdatedDate = DateTime.UtcNow
                };
                userSession.Sessions.Add(session);
                userSession = await _userTokenRepository.InsertAsync(userSession);
            }
            else
            {
                var currentSession = userSession.Sessions.SingleOrDefault(a => a.DeviceId == phoneVerificationRequestDto.DeviceId);
                if (currentSession == null)
                {
                    session = new Session
                    {
                        DeviceId = phoneVerificationRequestDto.DeviceId,
                        RefreshTokenId = refreshToken,
                        CreatedDate = DateTime.UtcNow,
                        DeviceType = phoneVerificationRequestDto.DeviceType,
                        OS = phoneVerificationRequestDto.OS,
                        LastUpdatedDate = DateTime.UtcNow
                    };
                    userSession.Sessions.Add(session);
                }
                else
                {
                    currentSession.LastUpdatedDate = DateTime.UtcNow;
                    userSession.Sessions[userSession.Sessions.IndexOf(currentSession)] = currentSession;
                }

                userSession = await _userTokenRepository.UpdateAsync(userSession);
            }
            return _mapper.Map<UserSessions, UserSessionDto>(userSession);
        }

        public async Task<UserSessionDto> ValidateRefreshToken(RefreshTokenRequestDto refreshTokenRequestDto)
        {
            UserSessionDto userSessionDto = null;

            //Add check for Refresh token for now. Will remove after getting concrete requirement
            var customer = await _customerRepository.Table.Where(a => a.Sessions.Any(b => b.DeviceId == refreshTokenRequestDto.DeviceId && b.RefreshTokenId == refreshTokenRequestDto.RefreshToken)).SingleOrDefaultAsync();

            if (customer.Sessions != null)
            {
                userSessionDto = new UserSessionDto();
                userSessionDto.UserName = customer.Username;
                userSessionDto.Sessions.AddRange(_mapper.Map<List<Session>, List<SessionDto>>(customer.Sessions));
            }

            return userSessionDto;
        }

        public async Task<List<SessionDto>> SaveCustomerSession(PhoneNumberVerificationRequestDto phoneVerificationRequestDto)
        {
            Customer customer = await _customerRepository.Table.Where(a => a.Username == phoneVerificationRequestDto.PhoneNumber).SingleOrDefaultAsync();
            Guid refreshToken = Guid.NewGuid();
            Session session = null;

            var curntSession = customer.Sessions.Where(a => a.DeviceId == phoneVerificationRequestDto.DeviceId).SingleOrDefault();
            if (curntSession != null)
            {
                curntSession.LastUpdatedDate = DateTime.UtcNow;
                customer.Sessions[customer.Sessions.IndexOf(curntSession)] = curntSession;
            }
            else
            {
                session = new Session
                {
                    DeviceId = phoneVerificationRequestDto.DeviceId,
                    RefreshTokenId = refreshToken,
                    CreatedDate = DateTime.UtcNow,
                    DeviceType = phoneVerificationRequestDto.DeviceType,
                    OS = phoneVerificationRequestDto.OS,
                    LastUpdatedDate = DateTime.UtcNow
                };

                customer.Sessions.Add(session);
            }

            customer = await _customerRepository.UpdateAsync(customer);
            var sessions = _mapper.Map<IList<Session>, IList<SessionDto>>(customer.Sessions);

            return sessions.ToList();
        }
    }
}
