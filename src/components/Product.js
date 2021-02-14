import React, { useState } from "react";
import { S3Image } from "aws-amplify-react";
import { converCentsToDollars, convertDollarsToCents } from "../utils";
// prettier-ignore
import {API, graphqlOperation} from 'aws-amplify'
import {
  Notification,
  Popover,
  Button,
  Dialog,
  Card,
  Form,
  Input,
  Radio,
} from "element-react";
import { Email, LocalShipping } from "@material-ui/icons";
import { UserContext } from "../App";
import PayButton from "./PayButton";
import useDialog from "../hooks/useDialog";
import { deleteProduct, updateProduct } from "../graphql/mutations";
const Product = ({ product }) => {
  const [state, setState] = useState({
    description: "",
    shipped: true,
    price: 0,
  });

  const updateProductDialog = useDialog();
  const deleteProductDialog = useDialog();
  const handleChange = (key, value) => {
    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
  const handleSetProductState = () => {
    setState({
      description: product.description,
      shipped: product.shipped,
      price: converCentsToDollars(product.price),
    });
  };
  const handleUpdateProduct = async (productId) => {
    try {
      updateProductDialog.handleClose();
      const input = {
        id: productId,
        description: state.description,
        shipped: state.shipped,
        price: convertDollarsToCents(state.price),
      };
      await API.graphql(
        graphqlOperation(updateProduct, {
          input,
        })
      );
      Notification({
        title: "Success!",
        message: "Product successfully updated!",
        type: "success",
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleDeleteProduct = async (id) => {
    try {
      const input = { id };
      deleteProductDialog.handleClose();
      await API.graphql(graphqlOperation(deleteProduct, { input }));
      Notification({
        title: "Success!",
        message: "Product successfully deleted!",
        type: "success",
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <UserContext.Consumer>
      {({ userAttributes }) => {
        const isOwner = userAttributes && userAttributes.sub == product.owner;
        return (
          <div className="card-container">
            <Card bodyStyle={{ padding: 0, minWidth: "200px" }}>
              <S3Image
                imgKey={product.file.key}
                theme={{
                  photoImg: { maxWidth: "100%", maxHeight: "100%" },
                }}
              />
              <div className="card-body">
                <h3 className="m-0">{product.description}</h3>
                <div className="items-center">
                  {product.shipped ? <LocalShipping /> : <Email />}
                  {product.shipped ? "Shipped" : "Emailed"}
                </div>
                <div className="text-right">
                  <span className="mx-1">
                    ${converCentsToDollars(product.price)}
                  </span>
                  {!isOwner && <PayButton product={product} userAttributes={userAttributes} />}
                </div>
              </div>
            </Card>
            <div className="text-center">
              {isOwner && (
                <>
                  <Button
                    type="warning"
                    icon="edit"
                    className="m-1"
                    onClick={() => {
                      updateProductDialog.handleOpen();
                      handleSetProductState();
                    }}
                  />
                  <Popover
                    placement="top"
                    width="160"
                    trigger="click"
                    visible={deleteProductDialog.open}
                    content={
                      <>
                        <p>Do you want to delete this product?</p>
                        <div className="text-right">
                          <Button
                            size="mini"
                            type="text"
                            className="m-1"
                            onClick={deleteProductDialog.handleClose}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="mini"
                            type="primary"
                            className="m-1"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Confirm
                          </Button>
                        </div>
                      </>
                    }
                  >
                    <Button
                      onClick={deleteProductDialog.handleOpen}
                      type="danger"
                      icon="delete"
                      className="m-1"
                    />
                  </Popover>
                </>
              )}
            </div>
            <Dialog
              title="Update Product"
              size="large"
              customClass="dialog"
              visible={updateProductDialog.open}
              onCancel={updateProductDialog.handleClose}
            >
              <Dialog.Body>
                <Form labelPosition="top">
                  <Form.Item label="Update Description">
                    <Input
                      onChange={(value) => handleChange("description", value)}
                      placeholder="Product Description"
                      icon="information"
                      value={state.description}
                      trim={true}
                    />
                  </Form.Item>
                  <Form.Item label="Update Price">
                    <Input
                      type="number"
                      icon="plus"
                      onChange={(value) => handleChange("price", value)}
                      placeholder="Price ($USD)"
                      value={state.price}
                    />
                  </Form.Item>
                  <Form.Item label="Update Shipping">
                    <div className="text-center">
                      <Radio
                        value="true"
                        checked={state.shipped === true}
                        onChange={(value) => handleChange("shipped", value)}
                      >
                        Shipped
                      </Radio>
                      <Radio
                        value="false"
                        onChange={(value) => handleChange("shipped", value)}
                        checked={state.shipped === false}
                      >
                        Emailed
                      </Radio>
                    </div>
                  </Form.Item>
                </Form>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={updateProductDialog.handleClose}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={() => handleUpdateProduct(product.id)}
                >
                  Update
                </Button>
              </Dialog.Footer>
            </Dialog>
          </div>
        );
      }}
    </UserContext.Consumer>
  );
};

export default Product;
