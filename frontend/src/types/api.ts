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
