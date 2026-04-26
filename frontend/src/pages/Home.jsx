import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const loadProducts = async () => {
    try {
      const res = await api.get(
        `/products?search=${search}&category=${category}`
      );
      setProducts(res.data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, category]);

  const addToCart = async (productId) => {
    try {
      // ✅ FIX: sanitize userId
      const rawUserId = localStorage.getItem("userId");
      const userId =
        rawUserId && rawUserId !== "undefined" ? rawUserId : null;

      // 🚫 stop if not logged in
      if (!userId) {
        alert("Please log in to add items to your cart.");
        return;
      }

      // 🚫 extra safety
      if (!productId) {
        console.error("Invalid productId");
        return;
      }

      console.log("Adding to cart:", { userId, productId });
      alert("item added successfully");

      const res = await api.post(`/cart/add`, {
        userId,
        productId,
        quantity: 1,
      });

      // ✅ safe reduce
      const total = Array.isArray(res.data.cart?.items)
        ? res.data.cart.items.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          )
        : 0;

      localStorage.setItem("cartCount", total);

      // 🔔 notify navbar
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(
        "Add to cart error:",
        err.response?.data || err.message
      );
      alert("Failed to add item to cart");
    }
  };

  return (
    <div className="p-6">
      {/* Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 border border-gray-900 px-4 py-2 rounded-md 
               focus:outline-none focus:ring-2 focus:ring-blue-700"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full md:w-1/4 border border-gray-300 px-4 py-2 rounded-md 
               focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          <option value="Laptops">Laptops</option>
          <option value="Mobiles">Mobiles</option>
          <option value="Tablets">Tablets</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {products.map((product) => (
          <div
            key={product._id}
            className="border p-3 rounded shadow hover:shadow-lg transition"
          >
            <Link to={`/product/${product._id}`}>
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-40 object-contain bg-white rounded"
              />
              <h2 className="mt-2 font-semibold text-lg">
                {product.title}
              </h2>
            </Link>

            <div className="mt-2 flex items-center justify-between">
              <p className="text-gray-700 font-semibold">
                ₹{product.price}
              </p>

              <button
                onClick={() => addToCart(product._id)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}