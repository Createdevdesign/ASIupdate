using FluentValidation;
using order_placement_service.Service.AuthService.User;
using System;
using System.Collections.Generic;
using System.Text;

namespace order_placement_service.Service.AuthService.Validators
{
    public class LogoutRequestDtoValidator : AbstractValidator<LogoutRequestDto>
    {
        public LogoutRequestDtoValidator()
        {
            RuleFor(m => m.DeviceId).NotEmpty();
            //RuleFor(m => m.RefreshToken).NotEmpty();
        }
    }
}
