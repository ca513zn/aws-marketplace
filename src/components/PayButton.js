import { API } from "aws-amplify";
import React from "react";
import StripeCheckout from "react-stripe-checkout";
// import { Notification, Message } from "element-react";
const stripeConfig = {
  currency: "USD",
  publishableAPIKey:
    "pk_test_51HTAdWBKTHkPcr71DpJW6kLoehXXxpyGg68uLvuSM6TXMzNRsyAArB5LoRevSlLgGAHl5RdzuSNvMWhMBJJk9i5m00QdaszmsX",
};
const PayButton = ({ product, user }) => {
  const handleCharge = async (token) => {
    try {
      const result = await API.post("orderlambda", "/charge", {
        body: {
          token,
        },
      });
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <StripeCheckout
      token={handleCharge}
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
