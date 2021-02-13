import React, { useEffect, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { Icon, Loading, Tabs } from "element-react";
import { Link } from "react-router-dom";

import { ChevronLeft } from "@material-ui/icons";
import NewProduct from "../components/NewProduct";
import Product from "../components/Product";
import {
  onCreateProduct,
  onDeleteProduct,
  onUpdateProduct,
} from "../graphql/subscriptions";
const getMarket = `
  query GetMarket($id: ID!) {
    getMarket(id: $id) {
      id
      name
      products {
        items {
          id
          description
          price
          shipped
          owner
          createdAt
          updatedAt
          file {
            key
          }
        }
        nextToken
      }
      tags
      owner
      createdAt
      updatedAt
    }
  }
`;

const MarketPage = ({ marketId, user }) => {
  const [state, setState] = useState({
    market: null,
    isLoading: true,
    isOwner: false,
  });

  useEffect(() => {
    handleGetMarket();
    const createProductListener = API.graphql(
      graphqlOperation(onCreateProduct, { owner: user.attributes.sub })
    ).subscribe({
      next: (productData) => {
        const createdProduct = productData.value.data.onCreateProduct;
        setState((prevState) => {
          console.log(prevState)
          const prevProducts = prevState.market.products.items.filter(
            (item) => item.id !== createdProduct.id
          );
          const updatedProducts = [createdProduct, ...prevProducts];
          const newMarket = { ...prevState.market };
          newMarket.products.items = updatedProducts;
          return {
            ...prevState,
            market: { ...prevState.market, market: newMarket },
          };
        });
      },
    });
    const updateProductListener = API.graphql(
      graphqlOperation(onUpdateProduct, { owner: user.attributes.sub })
    ).subscribe({
      next: (productData) => {
        const updatedProduct = productData.value.data.onUpdateProduct;
        setState((prevState) => {
          const index = prevState.market.products.items.findIndex(
            (item) => item.id === updatedProduct.id
          );
          const newItems = {
            items: [
              ...prevState.market.products.items.slice(0, index),
              updatedProduct,
              ...prevState.market.products.items.slice(index + 1),
            ],
          };

          return {
            ...prevState,
            market: { ...prevState.market, products: newItems },
          };
        });
      },
    });
    const deleteProductListener = API.graphql(
      graphqlOperation(onDeleteProduct, { owner: user.attributes.sub })
    ).subscribe({
      next: (productData) => {
        const deletedProduct = productData.value.data.onDeleteProduct;
        setState((prevState) => {
          const updatedProducts = prevState.market.products.items.filter(
            (item) => item.id !== deletedProduct.id
          );
          const newMarket = { ...prevState.market };
          newMarket.products.items = updatedProducts;
          return {
            ...prevState,
            market: newMarket,
          };
        });
      },
    });
    return () => {
      createProductListener.unsubscribe();
      deleteProductListener.unsubscribe();
      updateProductListener.unsubscribe();
    };
  }, []);

  const handleGetMarket = async () => {
    const input = { id: marketId };
    const result = await API.graphql(graphqlOperation(getMarket, input));
    setState((prevState) => ({
      ...prevState,
      market: result.data.getMarket,
      isLoading: false,
      isOwner: user.username === result.data.getMarket.owner,
    }));
  };

  return state.isLoading ? (
    <Loading fullscreen />
  ) : (
    <>
      <Link className="link" to="/">
        <ChevronLeft /> Back to Markets List
      </Link>
      <span className="items-center pt-2">
        <h2 className="mb-mr">{state.market.name}</h2> - {state.market.owner}
      </span>
      <div className="items-center pt-2">
        <span style={{ color: "var(--lightSquidInk)", paddingBottom: "1em" }}>
          <Icon name="date" className="icon" />
          {state.market.createdAt}
        </span>
      </div>
      {/* New Product */}
      <Tabs type="border-card" value={state.isOwner ? "1" : "2"}>
        {state.isOwner && (
          <Tabs.Pane
            label={
              <>
                <Icon name="plus" className="icon" />
                Add Product
              </>
            }
            name="1"
          >
            <NewProduct marketId={marketId} />
          </Tabs.Pane>
        )}
        <Tabs.Pane
          label={
            <>
              <Icon name="menu" className="icon" />
              Products ({state.market.products.items.length})
            </>
          }
          name="2"
        >
          <div className="product-list">
            {state.market.products.items.map((product) => (
              <Product product={product} />
            ))}
          </div>
        </Tabs.Pane>
      </Tabs>
    </>
  );
};

export default MarketPage;
