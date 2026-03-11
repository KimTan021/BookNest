import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAdmin } from "./components/RequireAdmin";
import { RequireCustomer } from "./components/RequireCustomer";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { AuthorPage } from "./features/authors/AuthorPage";
import { BookDetailsPage } from "./features/books/BookDetailsPage";
import { BooksPage } from "./features/books/BooksPage";
import { CartPage } from "./features/cart/CartPage";
import { AdminDashboardPage } from "./features/admin/AdminDashboardPage";
import { OrdersPage } from "./features/orders/OrdersPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetailsPage />} />
        <Route path="/authors/:id" element={<AuthorPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/cart"
          element={
            <RequireCustomer>
              <CartPage />
            </RequireCustomer>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireCustomer>
              <OrdersPage />
            </RequireCustomer>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboardPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
