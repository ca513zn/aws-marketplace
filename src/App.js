import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Authenticator, AmplifyTheme } from "aws-amplify-react";
import { API, graphqlOperation, Auth, Hub, Logger } from "aws-amplify";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Navbar";
import MarketPage from "./pages/MarketPage";
import "./App.css";
import { getUser } from "./graphql/queries";
import { registerUser } from "./graphql/mutations";
export const UserContext = React.createContext();

const App = () => {
  const [state, setState] = useState({ user: null });
  const authWatcher = new Logger("authWatcher");
  const getUserData = async () => {
    const user = await Auth.currentAuthenticatedUser();
    user
      ? setState((prevState) => ({ ...prevState, user }))
      : setState((prevState) => ({ ...prevState, user: null }));
  };

  useEffect(() => {
    console.dir(AmplifyTheme);
    getUserData();
    Hub.listen("auth", authWatcher);
    authWatcher.onHubCapsule = (capsule) => {
      switch (capsule.payload.event) {
        case "signIn":
          console.log("signed in");
          getUserData();
          registerNewUser(capsule.payload.data);
          break;
        case "signUp":
          console.log("signed up");
          break;
        case "signOut":
          console.log("signed out");
          setState((prevState) => ({ ...prevState, user: null }));
          break;
        default:
          return;
      }
    };
  }, []);

  const registerNewUser = async (signInData) => {
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub,
    };
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));
    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          username: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true,
        };
        await API.graphql(
          graphqlOperation(registerUser, {
           input: registerUserInput,
          })
        );
      } catch (error) {
        console.error("error:", error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log(error);
    }
  };

  return !state.user ? (
    <Authenticator theme={theme} />
  ) : (
    <UserContext.Provider value={{ user: state.user }}>
      <Router>
        <>
          {/* Navigation */}
          <Navbar user={state.user} handleSignOut={handleSignOut} />
          {/* Routes */}

          <div className="app-container">
            <Route exact path="/" component={HomePage} />
            <Route exact path="/profile" component={ProfilePage} />
            <Route
              exact
              path="/markets/:marketId"
              component={({ match }) => (
                <MarketPage
                  user={state.user}
                  marketId={match.params.marketId}
                />
              )}
            />
          </div>
        </>
      </Router>
    </UserContext.Provider>
  );
};
const theme = {
  ...AmplifyTheme,
  button: {
    ...AmplifyTheme.button,
    backgroundColor: "var(--amazonOrange)",
  },
  navBar: {
    ...AmplifyTheme.navBar,
    backgroundColor: "#ffc0cb",
  },
  sectionBody: {
    ...AmplifyTheme.sectionBody,
    padding: "5px",
  },
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: "var(--squidInk)",
  },
};

// export default withAuthenticator(App, true, [], null, theme);
export default App;
