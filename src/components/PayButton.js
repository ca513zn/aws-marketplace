import React from "react";
import StripeCheckout from "react-stripe-checkout";
// import { Notification, Message } from "element-react";
const stripeConfig = {
  currency: "USD",
  publishableAPIKey:
    "pk_test_51HTAdWBKTHkPcr71DpJW6kLoehXXxpyGg68uLvuSM6TXMzNRsyAArB5LoRevSlLgGAHl5RdzuSNvMWhMBJJk9i5m00QdaszmsX",
};
const PayButton = ({ product, user }) => {
  return (
    <StripeCheckout
      email={user.attributes.email}
      name={product.description}
      amount={product.price}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      shippingAddress={product.shipped}
      billingAddress={product.shipped}
      locale="auto"
      allowRememberMe
    />
  );
};

export default PayButton;
