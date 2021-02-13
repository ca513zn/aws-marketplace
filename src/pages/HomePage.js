import React, { useState } from "react";
import MarketList from "../components/MarketList";
import NewMarket from "../components/NewMarket";
import { API, graphqlOperation } from "aws-amplify";
import { searchMarkets } from "../graphql/queries";
const HomePage = () => {
  const [state, setState] = useState({
    searchTerm: "",
    searchResults: [],
    isSearching: false,
  });
  const handleChangeSearchTerm = (value) => {
    setState((prevState) => ({ ...prevState, searchTerm: value }));
  };
  const handleClearSearchTerm = () => {
    setState((prevState) => ({
      ...prevState,
      searchTerm: "",
      searchResults: [],
    }));
  };
  const handleSearch = async (event) => {
    try {
      setState((prevState) => ({ ...prevState, isSearching: true }));
      event.preventDefault();
      const result = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { match: state.searchTerm } },
              { owner: { match: state.searchTerm } },
              { tags: { match: state.searchTerm } },
            ],
          },
          sort: {
            field: "createdAt",
            direction: "desc",
          },
        })
      );
      setState((prevState) => ({
        ...prevState,
        isSearching: false,
        searchResults: result.data.searchMarkets.items,
      }));
    } catch (error) {}
  };
  return (
    <div>
      <NewMarket
        searchTerm={state.searchTerm}
        isSearching={state.isSearching}
        handleClearSearchTerm={handleClearSearchTerm}
        handleChangeSearchTerm={handleChangeSearchTerm}
        handleSearch={handleSearch}
      />
      <MarketList searchResults={state.searchResults} />
    </div>
  );
};

export default HomePage;
