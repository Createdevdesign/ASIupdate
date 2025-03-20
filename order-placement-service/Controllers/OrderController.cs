using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;
using order_placement_service.Common;
using order_placement_service.Entities.Payments;
using order_placement_service.Model.OrderFacade.Order;
using order_placement_service.Repository.Interfaces;

namespace order_placement_service.Controllers
{
    [ApiController]
    [Route("api/cart/v{version:apiVersion}")]
    [ApiVersion("1.0")]
    public class OrderController : ControllerBase
    {
        #region fields
        private readonly ILogger<OrderController> _logger;
        private readonly IMapper _mapper;
        private readonly IOrderService _orderService;
        private readonly WebHelper _webHelper;
        #endregion

        public OrderController(
            ILogger<OrderController> logger,
            IMapper mapper,
            IOrderService orderService,
            WebHelper webHelper)
        {
            _logger = logger;
            _mapper = mapper;
            _orderService = orderService;
            _webHelper = webHelper;
        }

        [HttpPost, Route("totals")]
        public async Task<IActionResult> CalculateTotals(CalculateTotalsRequestDto requestDto)
        {
            if (string.IsNullOrWhiteSpace(requestDto.StoreId))
                return BadRequest("Search parameter cannot be empty");

            requestDto.Username = await _webHelper.RetrieveUsernameFromToken(Request);
            if (string.IsNullOrWhiteSpace(requestDto.Username))
                return Unauthorized();

            requestDto.PromoCode = requestDto.PromoCode;
            requestDto.PromotionId = requestDto.PromotionId;

            var output = await _orderService.CalculateTotals(requestDto);

            if (output.Status)
                return Ok(output);
            else
                return BadRequest(new { message = output.Message ?? output.PromoCodeMessage });
        }

        [HttpPost, Route("storeTotals")]
        public async Task<IActionResult> CalculateStoreTotals(CalculateStoreTotalsRequestDto requestDto)
        {
            if (string.IsNullOrWhiteSpace(requestDto.StoreId))
                return BadRequest("Search parameter cannot be empty");

            //requestDto.Username = await _webHelper.RetrieveUsernameFromToken(Request);
            //if (string.IsNullOrWhiteSpace(requestDto.Username))
            //    return Unauthorized();

            var output = await _orderService.CalculateStoreTotals(requestDto);

            if (output.Status)
            {
                output.CartItems = null;
                return Ok(output);
            }
            else
                return BadRequest(output.Message);
        }


        [HttpPost, Route("PlaceOrder")]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequestDto requestDto)
        {
            string username = await _webHelper.RetrieveUsernameFromToken(Request);

            if (string.IsNullOrEmpty(username))
                return Unauthorized();

            StringValues userAgent, geoLong, geoLat, ipAddress;
            HttpContext.Request.Headers.TryGetValue("User-Agent", out userAgent);
            HttpContext.Request.Headers.TryGetValue("x-lat", out geoLat);
            HttpContext.Request.Headers.TryGetValue("x-long", out geoLong);
            HttpContext.Request.Headers.TryGetValue("x-ipaddress", out ipAddress);
            var placeOrderRequest = _mapper.Map<PlaceOrderRequestDto, ProcessPaymentRequest>(requestDto);
            placeOrderRequest.UserName = username;
            placeOrderRequest.GeoLat = geoLat.ToString();
            placeOrderRequest.GeoLong = geoLong.ToString();
            placeOrderRequest.UserAgent = userAgent.ToString();
            placeOrderRequest.IpAddress = ipAddress.ToString();
            var response = await _orderService.PlaceOrder(placeOrderRequest);

            if (response.Success)
                return Ok(response);
            else
                return BadRequest(response.Errors);
        }

        [HttpPost, Route("StorePlaceOrder")]
        public async Task<IActionResult> StorePlaceOrder([FromBody] StoreOrderRequestDto requestDto)
        {
            StringValues userAgent, geoLong, geoLat, ipAddress;
            HttpContext.Request.Headers.TryGetValue("User-Agent", out userAgent);
            HttpContext.Request.Headers.TryGetValue("x-lat", out geoLat);
            HttpContext.Request.Headers.TryGetValue("x-long", out geoLong);
            HttpContext.Request.Headers.TryGetValue("x-ipaddress", out ipAddress);
            //requestDto.Username = username;
            requestDto.GeoLat = geoLat.ToString();
            requestDto.GeoLong = geoLong.ToString();
            requestDto.UserAgent = userAgent.ToString();
            requestDto.IpAddress = ipAddress.ToString();
            var response = await _orderService.PlaceStoreOrder(requestDto);

            if (response.Success)
                return Ok(response);
            else
                return BadRequest(new { message = response.Errors });
        }
    }
}
