import React, { useState } from "react";
import { PhotoPicker } from "aws-amplify-react";
// prettier-ignore
import { Form, Button, Input, Notification, Radio, Progress } from "element-react";

const NewProduct = () => {
  const [state, setState] = useState({
    description: "",
    price: 0,
    shipped: true,
  });

  const handleChange = (key, value) => {
    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleAddProduct = () => {
    console.log("product added!");
  };

  return (
    <div className="flex-center">
      <h2 className="header">Add New Product</h2>
      <div>
        <Form className="market-header">
          <Form.Item label="Add Product Description">
            <Input
              type="text"
              icon="information"
              onChange={(value) => handleChange("description", value)}
              placeholder="Description"
              value={state.description}
            />
          </Form.Item>
          <Form.Item label="Set Product Price">
            <Input
              type="number"
              icon="plus"
              onChange={(value) => handleChange("price", value)}
              placeholder="Price ($USD)"
              value={state.price}
            />
          </Form.Item>
          <Form.Item label="Shipped or Emailed">
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
          <PhotoPicker />
          <Form.Item>
            <Button type="primary" onClick={handleAddProduct}>
              Add Product
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NewProduct;
