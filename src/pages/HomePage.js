import React, { useState } from "react";
import MarketList from "../components/MarketList";
import NewMarket from "../components/NewMarket";

const HomePage = () => {
  const [state, setState] = useState({
    searchTerm: "",
    searchResults: [],
    isSearching: false,
  });
  const handleChangeSearchTerm = (value) => {
    console.log(value);
    setState((prevState) => ({ ...prevState, searchTerm: value }));
  };
  const handleClearSearchTerm = () => {
    setState((prevState) => ({
      ...prevState,
      searchTerm: "",
      searchResults: [],
    }));
  };
  const handleSearch = (event) => {
    event.preventDefault();
    console.log(state.searchTerm);
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
      <MarketList />
    </div>
  );
};

export default HomePage;
