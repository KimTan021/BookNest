export interface ApiErrorResponse {
  message: string;
  status: number;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthorSummary {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  authorId: number | null;
  authorName: string;
  categoryName: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface AuthorBook {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
}

export interface AuthorDetails {
  id: number;
  name: string;
  bio: string | null;
  books: AuthorBook[];
}

export interface AdminMetrics {
  users: number;
  books: number;
  orders: number;
  categories: number;
  authors: number;
}

export interface AdminCreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
}

export interface AdminCreateBookRequest {
  title: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  authorId: number;
  categoryId: number;
}

export interface AdminBookUpdateRequest {
  title: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  authorId: number;
  categoryId: number;
}

export interface AdminBookDetail {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  authorId: number | null;
  authorName: string;
  categoryId: number | null;
  categoryName: string;
}

export interface AdminAuthor {
  id: number;
  name: string;
  bio: string | null;
}

export interface AdminAuthorRequest {
  name: string;
  bio?: string;
}

export interface AdminCategoryRequest {
  name: string;
}

export interface CartItem {
  bookId: number;
  title: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  bookTitle: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  orderId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}
