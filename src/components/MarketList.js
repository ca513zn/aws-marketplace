import React from "react";
import { graphqlOperation } from "aws-amplify";
import { Connect } from "aws-amplify-react";
import { listMarkets } from "../graphql/queries";
import { onCreateMarket } from "../graphql/subscriptions";
import { Loading, Icon, Tag } from "element-react";
import Error from "./Error";
import { Link } from "react-router-dom";
import { ShoppingCart, Store } from "@material-ui/icons";
import { Card, CardHeader, Badge, Box } from "@material-ui/core";
const MarketList = () => {
  const onNewMarket = (prevQuery, newdata) => {
    let udpatedQuery = { ...prevQuery };
    const updatedMarketList = [
      newdata.onCreateMarket,
      ...prevQuery.listMarkets.items,
    ];
    udpatedQuery.listMarkets.items = updatedMarketList;
    return udpatedQuery;
  };
  return (
    <Connect
      query={graphqlOperation(listMarkets)}
      subscription={graphqlOperation(onCreateMarket)}
      onSubscriptionMsg={onNewMarket}
    >
      {({ data, loading, errors }) => {
        if (errors.length > 0) return <Error errors={errors} />;
        if (loading || !data.listMarkets) return <Loading fullscreen />;
        return (
          <>
            <h2 className="header">
              <Store />
              Markets
            </h2>
            {data.listMarkets.items.map((market) => (
              <div key={market.id} className="my-2">
                <Card>
                  <CardHeader
                    avatar={
                      <Badge
                        color="primary"
                        badgeContent={market.products.items.length}
                        showZero
                      >
                        <ShoppingCart />
                      </Badge>
                    }
                    title={
                      <Link className="link" to={`/markets/${market.id}`}>
                        {market.name}
                      </Link>
                    }
                    subheader={market.owner}
                    action={
                      <Box mt={1}>
                        {market.tags &&
                          market.tags.map((tag) => (
                            <Tag key={tag} type="danger" className="mx-1">
                              {tag}
                            </Tag>
                          ))}
                      </Box>
                    }
                  />
                </Card>
              </div>
            ))}
          </>
        );
      }}
    </Connect>
  );
};

export default MarketList;
