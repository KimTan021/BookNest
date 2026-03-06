import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addToCart, getBook } from "../../lib/api";
import { useAuth } from "../../state/AuthContext";
import type { Book } from "../../types/api";

export function BookDetailsPage() {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const parsedId = Number(id);
    if (!parsedId || Number.isNaN(parsedId)) {
      setStatus("Invalid book id in route.");
      return;
    }

    let cancelled = false;
    async function loadBook() {
      setLoading(true);
      setStatus("");
      try {
        const response = await getBook(parsedId);
        if (!cancelled) {
          setBook(response);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load book";
          setStatus(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadBook();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function onAddToCart(event: FormEvent) {
    event.preventDefault();
    if (!book) {
      return;
    }
    if (!token) {
      setStatus("Login is required before adding items to cart.");
      return;
    }

    try {
      await addToCart(token, book.id, quantity);
      setStatus(`Added ${quantity} copy/copies of "${book.title}" to cart.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Add to cart failed";
      setStatus(message);
    }
  }

  return (
    <section className="panel">
      <Link to="/" className="btn-link">
        Back to catalog
      </Link>
      {loading ? <p>Loading...</p> : null}
      {!loading && book ? (
        <div className="details-layout">
          <img
            src={book.imageUrl || "https://placehold.co/340x500?text=Book"}
            alt={book.title}
            className="details-image"
          />
          <div>
            <h1>{book.title}</h1>
            <p className="muted">{book.authorName}</p>
            <p>
              <strong>Category:</strong> {book.categoryName}
            </p>
            <p>
              <strong>Stock:</strong> {book.stock}
            </p>
            <p className="book-price">${Number(book.price).toFixed(2)}</p>
            <p>{book.description}</p>

            <form className="inline-form" onSubmit={onAddToCart}>
              <label className="field field-compact">
                <span>Quantity</span>
                <input
                  type="number"
                  min={1}
                  max={book.stock}
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
                />
              </label>
              <button type="submit">Add to cart</button>
            </form>
          </div>
        </div>
      ) : null}
      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
