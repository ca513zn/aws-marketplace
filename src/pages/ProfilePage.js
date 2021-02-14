import React, { useEffect, useState } from "react";
import { Auth, API, graphqlOperation } from "aws-amplify";
// prettier-ignore
import { Table, Button, Notification, MessageBox, Message, Tabs, Icon, Form, Dialog, Input, Card, Tag } from 'element-react'
import { converCentsToDollars, formatOrderDate } from "../utils";
import useDialog from "../hooks/useDialog";
const getUser = `
query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    username
    email
    registered
    orders (sortDirection: DESC, limit: 10) {
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
const ProfilePage = ({ user, userAttributes }) => {
  const emailDialog = useDialog();
  const verificationForm = useDialog();
  const [state, setState] = useState({
    orders: [],
    columns: [
      { prop: "name", width: "150" },
      { prop: "value", width: "330" },
      {
        prop: "tag",
        width: "150",
        render: (row) => {
          if (row.name === "Email") {
            const emailVerified = userAttributes.email_verified;
            return emailVerified ? (
              <Tag type="success">Verified</Tag>
            ) : (
              <Tag type="danger">Unverified</Tag>
            );
          }
        },
      },
      {
        prop: "operations",
        render: (row) => {
          switch (row.name) {
            case "Email":
              return (
                <Button
                  onClick={emailDialog.handleOpen}
                  type="info"
                  size="small"
                >
                  Edit
                </Button>
              );
            case "Delete Profile":
              return (
                <Button
                  type="danger"
                  size="small"
                  onClick={handleDeleteProfile}
                >
                  Delete
                </Button>
              );
            default:
              break;
          }
        },
      },
    ],
    email: userAttributes.email && userAttributes.email,
    verificationCode: "",
  });
  useEffect(() => {
    if (userAttributes) {
      getUserOrders(userAttributes.sub);
    }
  }, []);
  const getUserOrders = async (userId) => {
    const input = { id: userId };
    try {
      const result = await API.graphql(graphqlOperation(getUser, input));
      setState((prevState) => ({
        ...prevState,
        orders: result.data.getUser.orders.items,
      }));
    } catch (error) {
      console.log(error);
    }
  };
  const handleUpdateEmail = async () => {
    try {
      const updatedAttributes = {
        email: state.email,
      };
      const result = await Auth.updateUserAttributes(user, updatedAttributes);
      if (result === "SUCCESS") {
        sendVerificationCode("email");
      }
    } catch (error) {
      console.error(error);
      Notification.error({
        title: "Error",
        message: "There was an error updating your email.",
      });
    }
  };

  const sendVerificationCode = async (attr) => {
    verificationForm.handleOpen();
    await Auth.verifyCurrentUserAttribute(attr);
    Message({
      type: "info",
      customClass: "message",
      message: `Verification code sent to ${state.email}`,
    });
  };

  const handleVerifyEmail = async (attr) => {
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit(
        attr,
        state.verificationCode
      );
      Notification({
        title: "success",
        message: "Email successfully verified",
        type: `${result.toLowerCase()}`,
      });
      setTimeout(() => window.location.reload(), 3000);
    } catch (error) {
      console.log(error);
      Notification.error({
        title: "Error",
        message: `${error.message || "Error Verifying email."}`,
      });
    }
  };

  const handleDeleteProfile = () => {
    MessageBox.confirm(
      "This will permanently delete your account. Continue?",
      "Attention!",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    )
      .then(async () => {
        try {
          await user.deleteUser();
        } catch (error) {
          console.error(error);
        }
      })
      .catch(() => {
        Message({
          type: "info",
          message: "Delete canceled",
        });
      });
  };

  return (
    userAttributes && (
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
            <Table
              columns={state.columns}
              data={[
                {
                  name: "Your Id",
                  value: userAttributes.sub,
                },
                {
                  name: "Username",
                  value: user.username,
                },
                {
                  name: "Email",
                  value: userAttributes.email,
                },
                {
                  name: "Phone Number",
                  value: userAttributes.phone_number,
                },
                {
                  name: "Delete Profile",
                  value: "Sorry to see you go...",
                },
              ]}
              showHeader={false}
              rowClassName={(row) =>
                row.name === "Delete Profile" && "delete-profile"
              }
            />
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
                        Price: ${converCentsToDollars(order.product.price)}{" "}
                        (USD)
                      </p>
                      <p>Purchased on: {formatOrderDate(order.createdAt)}</p>
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
        <Dialog
          size="large"
          customClass="dialog"
          title="Edit Email"
          visible={emailDialog.open}
          onCancel={emailDialog.handleClose}
        >
          <Dialog.Body>
            <Form labelPosition="top">
              <Form.Item label="Email">
                <Input
                  value={state.email}
                  onChange={(val) =>
                    setState((prevState) => ({ ...prevState, email: val }))
                  }
                />
              </Form.Item>
              {verificationForm.open && (
                <Form.Item label="Enter Verification Code" labelWidth="120">
                  <Input
                    value={state.verificationCode}
                    onChange={(val) =>
                      setState((prevState) => ({
                        ...prevState,
                        verificationCode: val,
                      }))
                    }
                  />
                </Form.Item>
              )}
            </Form>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={emailDialog.handleClose}>Cancel</Button>
            {!verificationForm.open && (
              <Button type="primary" onClick={handleUpdateEmail}>
                Save
              </Button>
            )}
            {verificationForm.open && (
              <Button type="primary" onClick={() => handleVerifyEmail("email")}>
                Submit
              </Button>
            )}
          </Dialog.Footer>
        </Dialog>
      </>
    )
  );
};

export default ProfilePage;
