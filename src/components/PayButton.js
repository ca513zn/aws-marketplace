import { API, graphqlOperation } from "aws-amplify";
import React from "react";
import StripeCheckout from "react-stripe-checkout";
import { getUser } from "../graphql/queries";
import { createOrder } from "../graphql/mutations";
import { Notification, Message } from "element-react";
import { history } from "../App";
const stripeConfig = {
  currency: "USD",
  publishableAPIKey:
    "pk_test_51HTAdWBKTHkPcr71DpJW6kLoehXXxpyGg68uLvuSM6TXMzNRsyAArB5LoRevSlLgGAHl5RdzuSNvMWhMBJJk9i5m00QdaszmsX",
};
const PayButton = ({ product, userAttributes }) => {
  const getOwnerEmail = async (ownerId) => {
    try {
      const input = { id: ownerId };
      const result = await API.graphql(graphqlOperation(getUser, input));
      return result.data.getUser.email;
    } catch (error) {
      console.log(error);
    }
  };
  const createShippingAddress = (source) => ({
    city: source.address_city,
    country: source.address_country,
    address_line1: source.address_line1,
    address_state: source.address_state,
    address_zip: source.address_zip,
  });
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
            customerEmail: userAttributes.email,
            ownerEmail,
            shipped: product.shipped,
          },
        },
      });
      if (result.charge.status === "succeeded") {
        let shippingAddress = null;
        if (product.shipped) {
          shippingAddress = createShippingAddress(result.charge.source);
        }
        const input = {
          orderUserId: userAttributes.sub,
          orderProductId: product.id,
          shippingAddress,
        };
        const order = await API.graphql(graphqlOperation(createOrder, { input }));
        console.log({ order });
        Notification({
          title: "Success!",
          message: `${result.message}`,
          type: "success",
          duration: 3000,
        });
        setTimeout(() => {
          history.push("/");
          Message({
            type: "info",
            message: "Check your verified email for order details.",
            duration: 5000,
            showClose: true,
          });
        }, 3000);
      }
    } catch (error) {
      console.log(error);
      Notification.error({
        title: "Error",
        message: `${error.message || "Error processing order."}`,
      });
    }
  };
  return (
    <StripeCheckout
      token={handleCharge}
      email={userAttributes.email}
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
