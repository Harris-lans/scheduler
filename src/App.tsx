import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Scheduler from "./pages/Scheduler";

function App() {
  return (
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scheduler" element={<Scheduler />} />
    </Routes>
  );
}

export default App;
