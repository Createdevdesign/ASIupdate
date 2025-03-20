using Stripe;
using System;
using System.Collections.Generic;


namespace order_placement_service.Model.Consumerpayment
{
    public class CardListResponse : BaseModel
    {
        public List<Stripe.Card> Cards { get; set; }

        public CardListResponse()
        {
            Cards = new List<Stripe.Card>();
        }
    }
}
