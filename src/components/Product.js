import React from "react";
import { S3Image } from "aws-amplify-react";
import { converCentsToDollars } from "../utils";
// prettier-ignore
import { Notification, Popover, Button, Dialog, Card, Form, Input, Radio } from "element-react";
import { Email, LocalShipping } from "@material-ui/icons";
import { UserContext } from "../App";
import PayButton from "./PayButton";

const Product = ({ product }) => {
  return (
    <UserContext.Consumer>
      {({ user }) => {
        const isOwner = user && user.attributes.sub == product.owner;
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
                  {isOwner && <PayButton />}
                </div>
              </div>
            </Card>
          </div>
        );
      }}
    </UserContext.Consumer>
  );
};

export default Product;
