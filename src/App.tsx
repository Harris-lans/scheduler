import { Route, Routes } from "react-router-dom";
import SyncProvider from "./components/SyncProvider";
import CollaborativeScheduler from "./pages/CollaborativeScheduler";
import Scheduler from "./pages/Scheduler";
import { getTwilioAccessToken } from "./utils";

function App() {
    return (
        <SyncProvider tokenFunc={getTwilioAccessToken}>
            <Routes>
                <Route path="/" element={<Scheduler />} />
                <Route path="/collaborative/:roomId" element={<CollaborativeScheduler />} />
            </Routes>
        </SyncProvider>
    );
}

export default App;
