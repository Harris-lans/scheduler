import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import Tour from "./pages/Onboarding Experience";
import Scheduler from "./pages/Scheduler";

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scheduler" element={<Scheduler />} />
        <Route path="/tour" element={<Tour />} />
      </Routes>
    </>
  );
}

export default App;
