import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import store from "./store/store.js";

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="1097918368200-g5q6sfmhp9cpvtgtm5h9btseg6tq324i.apps.googleusercontent.com">
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </GoogleOAuthProvider>
);