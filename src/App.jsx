import DashboardRoutes from './components/routes';
import DefaultLayout from './layout/default';
import 'react-quill/dist/quill.snow.css';


function App() {
  return (
    <DefaultLayout>
      <DashboardRoutes />
    </DefaultLayout>
  );
}

export default App;
