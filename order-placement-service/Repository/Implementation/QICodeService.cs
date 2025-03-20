using AutoMapper;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using order_placement_service.Common;
using order_placement_service.Entities.QiCodes;
using order_placement_service.Entities.Stores;
using order_placement_service.Model.QICode;
using order_placement_service.Repository.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace order_placement_service.Repository.Implementation
{
    public class QICodeService : IQICodeService
    {
        private readonly IRepository<QiCodes> _qiCodeRepository;
        private readonly IRepository<Store> _storeRepository;
        private readonly IMapper _mapper;
        private readonly WebHelper _webHelper;

        public QICodeService(IRepository<QiCodes> qicodeRepository, IRepository<Store> storeRepository, IMapper mapper, WebHelper webHelper)
        {
            _qiCodeRepository = qicodeRepository;
            _storeRepository = storeRepository;
            _mapper = mapper;
            _webHelper = webHelper;
        }

        public async Task<CreateQICResponseDto> CreateQICode(CreateQICRequestDto requestDto)
        {

            if (string.IsNullOrWhiteSpace(requestDto.Username))
                return await Task.FromResult<CreateQICResponseDto>(null);

            QiCodes code = await _qiCodeRepository.Table.SingleOrDefaultAsync(a => a.ExtId == requestDto.ExtId); 
            CreateQICResponseDto response = new CreateQICResponseDto();
            try
            {
                if (code != null && !string.IsNullOrWhiteSpace(code.ExtId))
                {
                    code.CreatedDt = DateTime.UtcNow;
                    code.CreatedBy = requestDto.Username;
                    code.Metadata = requestDto.Metadata;
                    code.StoreId = requestDto.StoreId;

                    code = await _qiCodeRepository.UpdateAsync(code);
                    response.Success = true;
                    response.Message = "QI Code updated successfully!";
                }
                else
                {
                    QiCodes qiCodes = new QiCodes
                    {
                        CreatedBy = requestDto.Username,
                        CreatedDt = DateTime.UtcNow,
                        ExtId = requestDto.ExtId,
                        Metadata = requestDto.Metadata,
                        StoreId = requestDto.StoreId,
                        Type = requestDto.Type
                    };

                    code = await _qiCodeRepository.InsertAsync(qiCodes);
                    response.Success = true;
                    response.Message = "QI Code created successfully!";
                }
            }
            catch (Exception)
            {
                response.Success = false;
                response.Message = "There was an issue while creating/updating the QR code!";
            }

            return response;
        }

        public async Task<ReadQICResponseDto> ReadQICode(ReadQICRequestDto requestDto)
        {
            if (string.IsNullOrWhiteSpace(requestDto.Username))
                return await Task.FromResult<ReadQICResponseDto>(null);

            QiCodes response = await _qiCodeRepository.Table.Where(a => a.ExtId == requestDto.ExtId).SingleOrDefaultAsync();

            if (response == null)
                throw new Exception("Invalid QI Code!");

            Store store = await _storeRepository.Collection.Find(x => x.Id.Equals(response.StoreId)).SingleOrDefaultAsync();
            var result = _mapper.Map<QiCodes, ReadQICResponseDto>(response);
            if (store != null)
            {
                result.StoreName = store.Name;
                result.StoreAddress = store.CompanyAddress;
                result.StorePhoneNumber = store.CompanyPhoneNumber;
                result.StoreTiming = store.CompanyHours;
                result.IsOpen = _webHelper.IsStoreOpen(store.CompanyHours);
                result.PayAtStore = store.PayAtStore;
                result.IsDelivery = (response.DisplayText.ToUpper().Contains("TABLE")) ? false : true;
                result.IsPickUp = (response.DisplayText.ToUpper().Contains("TABLE")) ? false : true;
            }

            return result;
        }
    }
}
