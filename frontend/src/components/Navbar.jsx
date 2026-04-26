import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import api from "../api/axios";
import logo from "../assets/logo.png";

export default function Navbar() {
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useState(0);

    // ✅ Safely get userId (fixes "undefined" bug)
    const rawUserId = localStorage.getItem("userId");
    const userId =
        rawUserId && rawUserId !== "undefined" ? rawUserId : null;

    useEffect(() => {
        const loadCart = async () => {
            try {
                // ✅ Prevent bad API call
                if (!userId) {
                    setCartCount(0);
                    return;
                }

                const res = await api.get(`/cart/${userId}`);

                // ✅ Safe reduce
                const total = Array.isArray(res.data.items)
                    ? res.data.items.reduce(
                          (sum, item) => sum + (item.quantity || 0),
                          0
                      )
                    : 0;

                setCartCount(total);
            } catch (err) {
                console.error("Cart load error:", err);
                setCartCount(0);
            }
        };

        loadCart();

        // ✅ Listen for cart updates
        window.addEventListener("cartUpdated", loadCart);

        return () => {
            window.removeEventListener("cartUpdated", loadCart);
        };
    }, [userId]);

    const logout = () => {
        localStorage.removeItem("userId"); // ✅ safer than clear()
        setCartCount(0);
        navigate("/login");
    };

    return (
        <nav className="flex justify-between p-4 shadow bg-black text-white">
            <Link to="/" className="flex items-center">
            <img src={logo} alt="My Store Logo" className="h-8 w-auto scale-201 origin-left"/>
            </Link>
            
            <div className="flex gap-4 items-center">
                <Link to="/cart" className="relative text-xl">
                    🛒
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1 rounded">
                            {cartCount}
                        </span>
                    )}
                </Link>

                {!userId ? (
                    <>
                        <Link to="/login" className="text-lg">
                            Login
                        </Link>
                        <Link to="/signup" className="text-lg">
                            Signup
                        </Link>
                    </>
                ) : (
                    <button onClick={logout} className="text-lg">
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}