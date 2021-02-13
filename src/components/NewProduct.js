import React, { useState } from "react";
import { PhotoPicker } from "aws-amplify-react";
import { Storage, Auth, API, graphqlOperation } from "aws-amplify";
import { createProduct } from "../graphql/mutations";
import aws_exports from "../aws-exports";
// prettier-ignore
import { Form, Button, Input, Notification, Radio, Progress } from "element-react";
import { convertDollarsToCents } from "../utils";

const initialState = {
  description: "",
  price: 0,
  shipped: true,
  imageURL: "",
  image: "",
  isUploading: false,
  percent: 0,
};

const NewProduct = ({ marketId }) => {
  const [state, setState] = useState(initialState);

  const handleChange = (key, value) => {
    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleAddProduct = async () => {
    try {
      const visibility = "public";
      const { identityId } = await Auth.currentCredentials();
      const filename = `/${visibility}/${identityId}/${Date.now()}-${
        state.image.name
      }`;
      const uploadedFile = await Storage.put(filename, state.image.file, {
        contentType: state.image.type,
        progressCallback: (progress) => {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          setState((prevState) => ({
            ...prevState,
            percent,
          }));
        },
      });
      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_project_region,
      };
      const input = {
        productMarketId: marketId,
        description: state.description,
        shipped: state.shipped,
        price: convertDollarsToCents(state.price),
        file,
      };
      const result = await API.graphql(
        graphqlOperation(createProduct, { input })
      );
      console.log(result);
      Notification({
        title: "Success",
        message: "Product successfully created",
        type: "success",
      });
      setState((prevState) => ({ ...prevState, isUploading: true }));
      setState(initialState);
    } catch (error) {
      console.log("Error: ", error);
    }
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
          {state.imageURL && (
            <img
              className="image-preview"
              src={state.imageURL}
              alt="Product Preview"
            />
          )}
          {state.percent > 0 && (
            <Progress
              type="circle"
              className="progress"
              percentage={state.percent}
            />
          )}
          <PhotoPicker
            title="Product Image"
            preview="hidden"
            onLoad={(url) => handleChange("imageURL", url)}
            onPick={(file) => handleChange("image", file)}
            theme={{
              formContainer: {
                margin: 0,
                padding: "0.8em",
              },
              formSection: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              },
              sectionBody: {
                margin: 0,
                width: "250px",
              },
              sectionHeader: {
                padding: "0.2em",
                color: "var(--darkAmazonOrange)",
              },
              photoPickerButton: {
                display: "none",
              },
            }}
          />
          <Form.Item>
            <Button
              disabled={
                !state.imageURL ||
                !state.description ||
                !state.price ||
                state.isUploading
              }
              type="primary"
              onClick={handleAddProduct}
              loading={state.isUploading}
            >
              {state.isUploading ? "Creating Product..." : "Add Product"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NewProduct;
