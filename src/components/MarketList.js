import React from "react";
import { graphqlOperation } from "aws-amplify";
import { Connect } from "aws-amplify-react";
import { onCreateMarket } from "../graphql/subscriptions";
import { Loading, Icon, Tag } from "element-react";
import Error from "./Error";
import { Link } from "react-router-dom";
import { ShoppingCart, Store } from "@material-ui/icons";
import { Card, CardHeader, Badge, Box } from "@material-ui/core";
const listMarkets = `
  query ListMarkets(
    $filter: ModelMarketFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMarkets(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
        }
          nextToken
        }
        tags
        owner
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
const MarketList = ({ searchResults }) => {
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
        const markets =
          searchResults.length > 0 ? searchResults : data.listMarkets.items;
        return (
          <>
            {searchResults.length > 0 ? (
              <h2 className="text-green">
                <Icon type="success" name="check" className="icon" />
                {searchResults.length} Results
              </h2>
            ) : (
              <h2 className="header">
                <Store />
                Markets
              </h2>
            )}
            {markets.map((market) => (
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
