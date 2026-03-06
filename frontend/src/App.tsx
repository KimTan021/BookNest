import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { BookDetailsPage } from "./features/books/BookDetailsPage";
import { BooksPage } from "./features/books/BooksPage";
import { CartPage } from "./features/cart/CartPage";
import { OrdersPage } from "./features/orders/OrdersPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/cart"
          element={
            <RequireAuth>
              <CartPage />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <OrdersPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
