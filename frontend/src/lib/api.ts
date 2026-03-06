import type {
  ApiErrorResponse,
  AuthResponse,
  AuthorDetails,
  Book,
  Category,
  Cart,
  LoginRequest,
  Order,
  PageResponse,
  RegisterRequest
} from "../types/api";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

async function request<T>(
  url: string,
  init: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { ...init, headers });
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const errorResponse = body as ApiErrorResponse | null;
    const message = errorResponse?.message ?? `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return body as T;
}

export async function login(input: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function register(input: RegisterRequest): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function listBooks(params: {
  page: number;
  size: number;
  title?: string;
  categoryId?: number;
}): Promise<PageResponse<Book>> {
  const path = params.title || params.categoryId ? "/api/books/search" : "/api/books";
  const query = toQueryString(params);
  return request<PageResponse<Book>>(`${path}?${query}`);
}

export async function listCategories(): Promise<Category[]> {
  return request<Category[]>("/api/categories");
}

export async function getBook(bookId: number): Promise<Book> {
  return request<Book>(`/api/books/${bookId}`);
}

export async function getAuthor(authorId: number): Promise<AuthorDetails> {
  return request<AuthorDetails>(`/api/authors/${authorId}`);
}

export async function getCart(token: string): Promise<Cart> {
  return request<Cart>("/api/cart", {}, token);
}

export async function addToCart(token: string, bookId: number, quantity: number): Promise<void> {
  await request<void>(`/api/cart/add?bookId=${bookId}&quantity=${quantity}`, { method: "POST" }, token);
}

export async function updateCartItem(token: string, bookId: number, quantity: number): Promise<void> {
  await request<void>(
    `/api/cart/update?bookId=${bookId}&quantity=${quantity}`,
    { method: "PUT" },
    token
  );
}

export async function removeCartItem(token: string, bookId: number): Promise<void> {
  await request<void>(`/api/cart/remove?bookId=${bookId}`, { method: "DELETE" }, token);
}

export async function clearCart(token: string): Promise<void> {
  await request<void>("/api/cart/clear", { method: "DELETE" }, token);
}

export async function checkout(token: string): Promise<Order> {
  return request<Order>("/api/orders/checkout", { method: "POST" }, token);
}

export async function getOrderHistory(token: string): Promise<Order[]> {
  return request<Order[]>("/api/orders/history", {}, token);
}

export { ApiError };
