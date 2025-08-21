import { Routes, Route } from "react-router";
import App from "./App";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import DashboardHomePage from "./pages/DashboardHomePage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<DashboardHomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="*" element={<div>Not Found</div>} />
      </Route>
    </Routes>
  );
}
