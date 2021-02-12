import React, { useEffect, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { getMarket } from "../graphql/queries";
import { Icon, Loading, Tabs } from "element-react";
import { Link } from "react-router-dom";

import { ChevronLeft } from "@material-ui/icons";
import NewProduct from "../components/NewProduct";
import Product from "../components/Product";

const MarketPage = ({ marketId, user }) => {
  const [state, setState] = useState({
    market: null,
    isLoading: true,
    isOwner: false,
  });
  useEffect(() => {
    handleGetMarket();
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
            <NewProduct />
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
