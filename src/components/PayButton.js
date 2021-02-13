import { API, graphqlOperation } from "aws-amplify";
import React from "react";
import StripeCheckout from "react-stripe-checkout";
import { getUser } from "../graphql/queries";
// import { Notification, Message } from "element-react";
const stripeConfig = {
  currency: "USD",
  publishableAPIKey:
    "pk_test_51HTAdWBKTHkPcr71DpJW6kLoehXXxpyGg68uLvuSM6TXMzNRsyAArB5LoRevSlLgGAHl5RdzuSNvMWhMBJJk9i5m00QdaszmsX",
};
const PayButton = ({ product, user }) => {
  const getOwnerEmail = async (ownerId) => {
    try {
      const input = { id: ownerId };
      const result = await API.graphql(graphqlOperation(getUser, input));
      return result.data.getUser.email;
    } catch (error) {
      console.log(error);
    }
  };
  const handleCharge = async (token) => {
    try {
      const ownerEmail = await getOwnerEmail(product.owner);
      const result = await API.post("orderlambda", "/charge", {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description,
          },
          email: {
            customerEmail: user.attributes.email,
            ownerEmail,
            shipped: product.shipped,
          },
        },
      });
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
