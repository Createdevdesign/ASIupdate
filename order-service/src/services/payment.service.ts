import { PaymentServices } from "../interfaces";
import debug from 'debug';
const stripe = require('stripe')(process.env.stripe_secret_key);

const log: debug.IDebugger = debug('app:vonage-service');

class PaymentService implements PaymentServices {
    
  public async paymentRefund(ChargeId:string, orderNumber: number, res:any){
    log("Refunding payment");
    try {
        await stripe.refunds.create({  charge: ChargeId,  metadata:{OrderId:orderNumber}  });
    }catch(err){
        log("Error refund payment");
        console.log(err)
        this.stripeErrorHandling(err, res);
    }
}

public async paymentCapture(ChargeId:string, res:any){
    log("Capturing payment");
    let verifyId = ChargeId.substring(0, ChargeId.indexOf("_"));
    try {
        if(verifyId === "pi"){
            await this.paymentConformUsingPaymentIntentMethod(ChargeId, res);
        }else{
            await stripe.charges.capture(ChargeId);
        }
    }catch(err){
        log("Error capturing payment");
        this.stripeErrorHandling(err, res);
    }
}

public async paymentConformUsingPaymentIntentMethod(PaymentIntentId:string, res:any){
    log("Capture payment");
    try {
        await stripe.paymentIntents.capture(PaymentIntentId)
    }catch(err){
        log("Error capturing payment");
        this.stripeErrorHandling(err, res);
    }
}

public stripeErrorHandling(err:any, res:any){​
        switch (err.type) {​
            case 'StripeCardError':
                log("StripeCardError", err.message);
                return res.status(err.statusCode).send({errors:[this.errorHandlingStripe(err)]});
                break;
            case 'StripeRateLimitError':
                log("StripeRateLimitError", err.message);
                return res.status(err.statusCode).send({errors:[this.errorHandlingStripe(err)]});
                break;
            case 'StripeInvalidRequestError':
                log("StripeInvalidRequestError", err.message);
                // Invalid parameters were supplied to Stripe's API
                return res.status(err.statusCode).send({errors:[this.errorHandlingStripe(err)]});
                break;
            case 'StripeAPIError':
                log("StripeAPIError", err.message);
                // An error occurred internally with Stripe's API
                return res.status(err.statusCode).send({errors:[this.errorHandlingStripe(err)]});
                break;
            case 'StripeConnectionError':
                log("StripeConnectionError", err.message);
                // Some kind of error occurred during the HTTPS communication
                return res.status(err.statusCode).send({errors:[this.errorHandlingStripe(err)]});
                break;
            case 'StripeAuthenticationError':
                log("StripeAuthenticationError", err.statusCode);
                // You probably used an incorrect API key
                return res.status(err.statusCode).send({errors:[this.errorHandlingStripe(err)]});
                break;
            default:
                log("default", err.message);
                // Handle any other types of unexpected errors
                return res.status(err.statusCode).send({errors:[this.errorHandlingStripe(err)]});
                break;
        }​
  }​

  public errorHandlingStripe(err:any){​
      let error:string="";
      if(err.code === "account_country_invalid_address")
          error = err.message;
      if(err.code === "account_country_invalid_address")
          error = "The country of the business address provided does not match the country of the account. Businesses must be located in the same country as the account."
      if(err.code === "account_error_country_change_requires_additional_steps")
          error = "Your account has already onboarded as a Connect platform. Changing your country requires additional steps. Please reach out to Stripe support for more information."
      if(err.code === "account_invalid")
          error = "The account ID provided as a value for the Stripe-Account header is invalid. Check that your requests are specifying a valid account ID."
      if(err.code === "account_number_invalid")
          error = "The bank account number provided is invalid (e.g., missing digits)."
      if(err.code === "acss_debit_session_incomplete")
          error = "The ACSS debit session is not ready to transition to complete status yet. Please try again the request later."
      if(err.code === "alipay_upgrade_required")
          error = "This method for creating Alipay payments is not supported anymore."
      if(err.code === "amount_too_large")
          error = "The specified amount is greater than the maximum amount allowed. Use a lower amount and try again."
      if(err.code === "amount_too_small")
          error = "The specified amount is less than the minimum amount allowed. Use a higher amount and try again."
      if(err.code === "api_key_expired")
          error = "The API key provided has expired."
      if(err.code === "authentication_required")
          error = "The payment requires authentication to proceed. If your customer is off session, notify your customer to return to your application and complete the payment."
      if(err.code === "balance_insufficient")
          error = "The transfer or payout could not be completed because the associated account does not have a sufficient balance available."
      if(err.code === "bank_account_declined")
          error = "The bank account provided can not be used to charge, either because it is not verified yet or it is not supported."
      if(err.code === "bank_account_exists")
          error = "The bank account provided already exists."
      if(err.code === "bank_account_unusable")
          error = "The bank account provided cannot be used for payouts. A different bank account must be used."
      if(err.code === "bank_account_unverified")
          error = "Your Connect platform is attempting to share an unverified bank account with a connected account."
      if(err.code === "bank_account_verification_failed")
          error = "The bank account cannot be verified, either because the microdeposit amounts provided do not match the actual amounts, or because verification has failed too many times."
      if(err.code === "billing_invalid_mandate")
          error = "The Subscription or Invoice attempted payment on a PaymentMethod without an active mandate."
      if(err.code === "bitcoin_upgrade_required")
          error = "This method for creating Bitcoin payments is not supported anymore."
      if(err.code === "card_decline_rate_limit_exceeded")
          error = "This card has been declined too many times. You can try to charge this card again after 24 hours."
      if(err.code === "card_declined")
          error = "The card has been declined."
      if(err.code === "cardholder_phone_number_required")
          error = "You must have a phone_number on file for Issuing Cardholders who will be creating EU cards. You cannot create EU cards without a phone_number on file for the cardholder."
      if(err.code === "charge_already_captured")
          error = "The charge you’re attempting to capture has already been captured. Update the request with an uncaptured charge ID."
      if(err.code === "charge_already_refunded")
          error = "The charge you’re attempting to refund has already been refunded. Update the request to use the ID of a charge that has not been refunded."
      if(err.code === "charge_disputed")
          error = "The charge you’re attempting to refund has been charged back."
      if(err.code === "charge_exceeds_source_limit")
          error = "This charge would cause you to exceed your rolling-window processing limit for this source type. Please retry the charge later, or contact us to request a higher processing limit."
      if(err.code === "charge_expired_for_capture")
          error = "The charge cannot be captured as the authorization has expired. Auth and capture charges must be captured within seven days."
      if(err.code === "charge_invalid_parameter")
          error = "This card has been declined too many times. You can try to charge this card again after 24 hours."
      if(err.code === "clearing_code_unsupported")
          error = "The clearing code provided is not supported."
      if(err.code === "country_code_invalid")
          error = "The country code provided was invalid."
      if(err.code === "country_unsupported")
          error = "Your platform attempted to create a custom account in a country that is not yet supported."
      if(err.code === "coupon_expired")
          error = "The coupon provided for a subscription or order has expired."
      if(err.code === "customer_max_payment_methods")
          error = "The maximum number of PaymentMethods for this Customer has been reached. Either detach some PaymentMethods from this Customer or proceed with a different Customer."
      if(err.code === "customer_max_subscriptions")
          error = "The maximum number of subscriptions for a customer has been reached."
      if(err.code === "email_invalid")
          error = "The email address is invalid."
      if(err.code === "expired_card")
          error = "The card has expired. Check the expiration date or use a different card."
      if(err.code === "idempotency_key_in_use")
          error = "TThe idempotency key provided is currently being used in another request. This occurs if your integration is making duplicate requests simultaneously."
      if(err.code === "incorrect_address")
          error = "The card’s address is incorrect. Check the card’s address or use a different card."
      if(err.code === "incorrect_cvc")
          error = "The card’s security code is incorrect. Check the card’s security code or use a different card."
      if(err.code === "incorrect_number")
          error = "The card number is incorrect. Check the card’s number or use a different card."
      if(err.code === "incorrect_zip")
          error = "The card’s postal code is incorrect. Check the card’s postal code or use a different card."
      if(err.code === "instant_payouts_unsupported")
          error = "This card is not eligible for Instant Payouts. "
      if(err.code === "intent_invalid_state")
          error = "Intent is not in the state that is required to perform the operation."
      if(err.code === "intent_verification_method_missing")
          error = "Intent does not have verification method specified in its PaymentMethodOptions object."
      if(err.code === "invalid_card_type")
          error = "The card provided as an external account is not supported for payouts. Provide a non-prepaid debit card instead."
      if(err.code === "invalid_characters")
          error = "This value provided to the field contains characters that are unsupported by the field."
      if(err.code === "invalid_charge_amount")
          error = "The specified amount is invalid. The charge amount must be a positive integer in the smallest currency unit, and not exceed the minimum or maximum amount."
      if(err.code === "incorrect_number")
          error = "The card’s security code is invalid. Check the card’s security code or use a different card."
      if(err.code === "invalid_expiry_month")
          error = "The card’s expiration month is incorrect. Check the expiration date or use a different card."
      if(err.code === "invalid_expiry_year")
          error = "The card’s expiration year is incorrect. Check the expiration date or use a different card."
      if(err.code === "invalid_number")
          error = "The card number is invalid. Check the card details or use a different card."
      if(err.code === "invalid_source_usage")
          error = "The source cannot be used because it is not in the correct state (e.g., a charge request is trying to use a source with a pending, failed, or consumed source)."
      if(err.code === "invoice_no_customer_line_items")
          error = "An invoice cannot be generated for the specified customer as there are no pending invoice items. "
      if(err.code === "invoice_no_payment_method_types")
          error = "An invoice cannot be finalized because there are no payment method types available to process the payment."
      if(err.code === "invoice_no_subscription_line_items")
          error = "An invoice cannot be generated for the specified subscription as there are no pending invoice items."
      if(err.code === "invoice_not_editable")
          error = "The specified invoice can no longer be edited. Instead, consider creating additional invoice items that will be applied to the next invoice. You can either manually generate the next invoice or wait for it to be automatically generated at the end of the billing cycle."
      if(err.code === "invoice_payment_intent_requires_action")
          error = "This payment requires additional user action before it can be completed successfully. Payment can be completed using the PaymentIntent associated with the invoice."
      if(err.code === "invoice_upcoming_none")
          error = "There is no upcoming invoice on the specified customer to preview."
      if(err.code === "livemode_mismatch")
          error = "Test and live mode API keys, requests, and objects are only available within the mode they are in."
      if(err.code === "lock_timeout")
          error = "This object cannot be accessed right now because another API request or Stripe process is currently accessing it."
      if(err.code === "missing")
          error = "Both a customer and source ID have been provided, but the source has not been saved to the customer."
      if(err.code === "not_allowed_on_standard_account")
          error = "Transfers and payouts on behalf of a Standard connected account are not allowed."
      if(err.code === "order_creation_failed")
          error = "The order could not be created."
      if(err.code === "order_required_settings")
          error = "The order could not be processed as it is missing required information."
      if(err.code === "order_status_invalid")
          error = "The order cannot be updated because the status provided is either invalid or does not follow the order lifecycle."
      if(err.code === "order_upstream_timeout")
          error = "The request timed out."
      if(err.code === "out_of_inventory")
          error = "The SKU is out of stock."
      if(err.code === "parameter_invalid_empty")
          error = "One or more required values were not provided. Make sure requests include all required parameters."
      if(err.code === "parameter_invalid_integer")
          error = "One or more of the parameters requires an integer, but the values provided were a different type."
      if(err.code === "parameter_invalid_string_blank")
          error = "One or more values provided only included whitespace. Check the values in your request and update any that contain only whitespace."
      if(err.code === "parameter_invalid_string_empty")
          error = "One or more required string values is empty. Make sure that string values contain at least one character."
      if(err.code === "parameter_missing")
          error = "One or more required values are missing. Check our API documentation to see which values are required to create or modify the specified resource."
      if(err.code === "parameter_unknown")
          error = "The request contains one or more unexpected parameters."
      if(err.code === "parameters_exclusive")
          error = "Two or more mutually exclusive parameters were provided."
      if(err.code === "payment_intent_action_required")
          error = "The provided payment method requires customer actions to complete, but error_on_requires_action was set."
      if(err.code === "payment_intent_authentication_failure")
          error = "The provided payment method has failed authentication."
      if(err.code === "payment_intent_incompatible_payment_method")
          error = "The PaymentIntent expected a payment method with different properties than what was provided."
      if(err.code === "payment_intent_invalid_parameter")
          error = "One or more provided parameters was not allowed for the given operation on the PaymentIntent."
      if(err.code === "payment_intent_mandate_invalid")
          error = "The provided mandate is invalid and can not be used for the payment intent."
      if(err.code === "payment_intent_payment_attempt_expired")
          error = "The latest payment attempt for the PaymentIntent has expired."
      if(err.code === "payment_intent_payment_attempt_failed")
          error = "The latest payment attempt for the PaymentIntent has failed."
      if(err.code === "payment_intent_unexpected_state")
          error = "The PaymentIntent’s state was incompatible with the operation you were trying to perform."
      if(err.code === "payment_method_bank_account_already_verified")
          error = "This bank account has already been verified."
      if(err.code === "payment_method_bank_account_blocked")
          error = "This bank account has failed verification in the past and can not be used."
      if(err.code === "payment_method_currency_mismatch")
          error = "The currency specified does not match the currency for the attached payment method."
      if(err.code === "payment_method_invalid_parameter")
          error = "Invalid parameter was provided in the payment method object."
      if(err.code === "payment_method_microdeposit_failed")
          error = "Microdeposits were failed to be deposited into the customer’s bank account. "
      if(err.code === "payment_method_microdeposit_verification_amounts_invalid")
          error = "You must provide exactly two microdeposit amounts."
      if(err.code === "payment_method_microdeposit_verification_amounts_mismatch")
          error = "The amounts provided do not match the amounts that were sent to the bank account."
      if(err.code === "payment_method_microdeposit_verification_attempts_exceeded")
          error = "You have exceeded the number of allowed verification attempts."
      if(err.code === "payment_method_microdeposit_verification_timeout")
          error = "Payment method should be verified with microdeposits within the required period."
      if(err.code === "payment_method_provider_decline")
          error = "The payment was declined by the issuer or customer."
      if(err.code === "payment_method_provider_timeout")
          error = "The payment method failed due to a timeout."
      if(err.code === "payment_method_unactivated")
          error = "The operation cannot be performed as the payment method used has not been activated."
      if(err.code === "payment_method_unexpected_state")
          error = "The provided payment method’s state was incompatible with the operation you were trying to perform."
      if(err.code === "payment_method_unsupported_type")
          error = "The API only supports payment methods of certain types."
      if(err.code === "payouts_not_allowed")
          error = "Payouts have been disabled on the connected account."
      if(err.code === "platform_account_required")
          error = "Only Stripe Connect platforms can work with other accounts."
      if(err.code === "platform_api_key_expired")
          error = "The API key provided by your Connect platform has expired."
      if(err.code === "postal_code_invalid")
          error = "The postal code provided was incorrect."
      if(err.code === "processing_error")
          error = "An error occurred while processing the card. Try again later or with a different payment method."
      if(err.code === "product_inactive")
          error = "The product this SKU belongs to is no longer available for purchase."
      if(err.code === "rate_limit")
          error = "Too many requests hit the API too quickly. We recommend an exponential backoff of your requests."
      if(err.code === "resource_already_exists")
          error = "A resource with a user-specified ID (e.g., plan or coupon) already exists."
      if(err.code === "resource_missing")
          error = "The ID provided is not valid. Either the resource does not exist, or an ID for a different resource has been provided."
      if(err.code === "routing_number_invalid")
          error = "The bank routing number provided is invalid."
      if(err.code === "secret_key_required")
          error = "The API key provided is a publishable key, but a secret key is required."
      if(err.code === "sepa_unsupported_account")
          error = "Your account does not support SEPA payments."
      if(err.code === "setup_attempt_failed")
          error = "The latest setup attempt for the SetupIntent has failed."
      if(err.code === "setup_intent_authentication_failure")
          error = "The provided payment method has failed authentication."
      if(err.code === "setup_intent_invalid_parameter")
          error = "One or more provided parameters was not allowed for the given operation on the SetupIntent."
      if(err.code === "setup_intent_unexpected_state")
          error = "The SetupIntent’s state was incompatible with the operation you were trying to perform."
      if(err.code === "shipping_calculation_failed")
          error = "Shipping calculation failed as the information provided was either incorrect or could not be verified."
      if(err.code === "sku_inactive")
          error = "The SKU is inactive and no longer available for purchase."
      if(err.code === "state_unsupported")
          error = "Occurs when providing the legal_entity information for a U.S. custom account, if the provided state is not supported."
      if(err.code === "tax_id_invalid")
          error = "The tax ID number provided is invalid (e.g., missing digits)."
      if(err.code === "taxes_calculation_failed")
          error = "Tax calculation for the order failed."
      if(err.code === "terminal_location_country_unsupported")
          error = "Terminal is currently only available in some countries. Locations in your country cannot be created in livemode."
      if(err.code === "testmode_charges_only")
          error = "Your account has not been activated and can only make test charges."
      if(err.code === "tls_version_unsupported")
          error = "Your integration is using an older version of TLS that is unsupported."
      if(err.code === "token_already_used")
          error = "The token provided has already been used. You must create a new token before you can retry this request."
      if(err.code === "token_in_use")
          error = "The token provided is currently being used in another request."
      if(err.code === "transfers_not_allowed")
          error = "The requested transfer cannot be created."
      if(err.code === "upstream_order_creation_failed")
          error = "Occurs when providing the legal_entity information for a U.S. custom account, if the provided state is not supported."
      if(err.code === "url_invalid")
          error = "The URL provided is invalid."
                                          
      return error;        
  }
}

export default new PaymentService();
