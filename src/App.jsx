import { Toaster } from "react-hot-toast";
import DashboardRoutes from "./components/routes";
import "react-quill/dist/quill.snow.css";
import { ReadStatusProvider } from "./context/ReadStatusContext";

function App() {
  return (
    <>
      <ReadStatusProvider>
        <Toaster position="top-center" />
        <DashboardRoutes />
      </ReadStatusProvider>
    </>
  );
}

export default App;
