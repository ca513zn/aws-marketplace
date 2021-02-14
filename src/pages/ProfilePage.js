import React, { useEffect, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
// prettier-ignore
import { Table, Button, Notification, MessageBox, Message, Tabs, Icon, Form, Dialog, Input, Card, Tag } from 'element-react'
import { converCentsToDollars } from "../utils";
const getUser = `
query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    username
    email
    registered
    orders {
      items {
        id
        createdAt
        updatedAt
        product {
          id
          owner
          price
          description
          createdAt
        }
        shippingAddress {
          city
          country
          address_line1
          address_state
          address_zip
        }
      }
      nextToken
    }
    createdAt
    updatedAt
  }
}
`;
const ProfilePage = ({ user }) => {
  const [state, setState] = useState({ orders: [] });
  useEffect(() => {
    if (user) {
      getUserOrders(user.attributes.sub);
    }
  }, []);
  const getUserOrders = async (userId) => {
    const input = { id: userId };
    try {
      const result = await API.graphql(graphqlOperation(getUser, input));
      console.log(result);
      setState((prevState) => ({
        ...prevState,
        orders: result.data.getUser.orders.items,
      }));
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Tabs activeName="1" className="profile-tabs">
        <Tabs.Pane
          name="1"
          label={
            <>
              <Icon name="document" className="icon" />
              Summary
            </>
          }
        >
          <h2 className="header">Profile Summary</h2>
        </Tabs.Pane>
        <Tabs.Pane
          name="2"
          label={
            <>
              <Icon name="message" className="icon" />
              Orders
            </>
          }
        >
          <h2 className="header">Order History</h2>
          {state.orders.map((order) => {
            console.log(order);
            return (
              <div className="mb-1" key={order.id}>
                <Card>
                  <pre>
                    <p>Order Id: {order.id}</p>
                    <p>Product Description: {order.product.description}</p>
                    <p>
                      Price: ${converCentsToDollars(order.product.price)} (USD)
                    </p>
                    <p>Purchased on: {order.createdAt}</p>
                    {order.shippingAddress && (
                      <>
                        Shipping Address:
                        <div className="ml-2">
                          <p>{order.shippingAddress.address_line1}</p>
                          <p>
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.address_state}{" "}
                            {order.shippingAddress.country}{" "}
                            {order.shippingAddress.address_zip}
                          </p>
                        </div>
                      </>
                    )}
                  </pre>
                </Card>
              </div>
            );
          })}
        </Tabs.Pane>
      </Tabs>
    </>
  );
};

export default ProfilePage;
