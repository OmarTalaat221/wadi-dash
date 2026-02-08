import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import DashboardRoutes from "./components/routes";
import "react-quill/dist/quill.snow.css";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <DashboardRoutes />
    </>
  );
}

export default App;
