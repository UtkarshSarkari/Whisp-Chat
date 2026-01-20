import "./App.css";
import { Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import ChatPage from "./Pages/ChatPage";
import { Toaster} from "./components/ui/toaster"

function App() {
  return (
    <div className="App">
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chats" element={<ChatPage />}/>
      </Routes>
    </div>
  );
}

export default App;
