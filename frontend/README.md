# Online Bookstore Frontend (React + TypeScript + Vite)

## Run locally
1. Start Spring Boot API on `http://localhost:8082`.
2. Install frontend dependencies:
   - `cd frontend`
   - `npm install`
3. Start Vite dev server:
   - `npm run dev`
4. Open `http://localhost:5173`.

Vite proxies `/api/*` requests to Spring Boot via `vite.config.ts`.

## UI Sub-task plan and testing checklist

### Task 1: App shell and navigation
- Components: `Layout`, router, route guards (`RequireAuth`).
- Test:
  - Navbar links render.
  - Anonymous users are redirected to `/login` from `/cart` and `/orders`.
  - Logged in users can access protected pages.

### Task 2: Authentication UI
- Components: `LoginPage`, `RegisterPage`, `AuthContext`, token storage.
- Test:
  - Register succeeds and auto-logs in.
  - Login succeeds and persists token in `localStorage`.
  - Logout clears token and protects `/cart`, `/orders`.

### Task 3: Catalog and search
- Components: `BooksPage`, pagination controls, search fields.
- Test:
  - Books load from `/api/books`.
  - Title/category filters call `/api/books/search`.
  - Pagination Next/Previous works.

### Task 4: Book details and add-to-cart
- Components: `BookDetailsPage`.
- Test:
  - `/books/:id` loads correct book.
  - Quantity input updates.
  - "Add to cart" requires auth and calls `/api/cart/add`.

### Task 5: Cart management
- Components: `CartPage`.
- Test:
  - Cart list loads from `/api/cart`.
  - Quantity edit calls `/api/cart/update`.
  - Remove calls `/api/cart/remove`.
  - Clear cart calls `/api/cart/clear`.
  - Checkout creates order using `/api/orders/checkout`.

### Task 6: Order history
- Components: `OrdersPage`.
- Test:
  - `/orders` loads from `/api/orders/history`.
  - Order metadata and line items display correctly.

## Suggested implementation/testing order
1. Task 1 + Task 2
2. Task 3
3. Task 4
4. Task 5
5. Task 6

This order keeps dependencies clear: auth first, then catalog, then cart/order flows.
