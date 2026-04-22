import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router";

export default function Cart() {
  const navigate = useNavigate();

  // ✅ FIX: sanitize userId
  const rawUserId = localStorage.getItem("userId");
  const userId =
    rawUserId && rawUserId !== "undefined" ? rawUserId : null;

  const [cart, setCart] = useState(null);

  // ✅ Load cart safely
  const loadCart = async () => {
    try {
      if (!userId) {
        setCart({ items: [] });
        return;
      }

      const res = await api.get(`/cart/${userId}`);
      setCart(res.data);
    } catch (err) {
      console.error("Cart load error:", err.response?.data || err.message);
      setCart({ items: [] });
    }
  };

  useEffect(() => {
    loadCart();
  }, [userId]);

  // ✅ Remove item
  const removeItem = async (productId) => {
    try {
      if (!userId || !productId) return;

      await api.post(`/cart/remove`, { userId, productId });
      loadCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  // ✅ Update quantity
  const updateQty = async (productId, quantity) => {
    try {
      if (!userId || !productId) return;

      if (quantity === 0) {
        await removeItem(productId);
        return;
      }

      await api.post(`/cart/update`, { userId, productId, quantity });
      loadCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (!cart) {
    return <div>Loading...</div>;
  }

  // ✅ Safe total calculation
  const total = Array.isArray(cart.items)
    ? cart.items.reduce(
        (sum, item) =>
          sum + (item.productId?.price || 0) * item.quantity,
        0
      )
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {cart.items.length === 0 ? (
        <div>Your cart is empty.</div>
      ) : (
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.productId?._id}
              className="flex items-center justify-between p-4 border rounded"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.productId?.image}
                  alt={item.productId?.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h2 className="text-lg font-semibold">
                    {item.productId?.title}
                  </h2>
                  <p className="text-gray-600">
                    ₹{(item.productId?.price || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQty(item.productId?._id, item.quantity - 1)
                  }
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQty(item.productId?._id, item.quantity + 1)
                  }
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
              </div>

              <div>
                <p className="font-semibold">
                  ₹
                  {(
                    (item.productId?.price || 0) * item.quantity
                  ).toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => removeItem(item.productId?._id)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="text-right mt-4">
            <h2 className="text-xl font-bold">
              Total: ₹{total.toFixed(2)}
            </h2>
          </div>

          <button
            onClick={() => navigate("/checkout-address")}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}