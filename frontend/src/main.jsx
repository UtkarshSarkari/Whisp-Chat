import { Provider } from "./components/ui/provider.jsx";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import ChatProvider from "./Context/ChatProvider.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ChatProvider>
      <Provider>
        <App />
      </Provider>
    </ChatProvider>
  </BrowserRouter>,
);
