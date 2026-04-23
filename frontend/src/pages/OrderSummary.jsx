import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function OrderSummary() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(
                    `http://localhost:5001/api/order/${id}`
                );
                setOrder(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchOrder();
    }, [id]);

    const downloadPDF = () => {
        window.open(`http://localhost:5001/api/order/${id}/pdf`);
    };

    if (!order) return <p className="text-center mt-10">Loading...</p>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">
                Order Summary
            </h1>

            {/* Order Info */}
            <div className="border p-4 rounded mb-4">
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
            </div>

            {/* Address */}
            <div className="border p-4 rounded mb-4">
                <h2 className="font-semibold mb-2">Shipping Address</h2>
                <p>{order.address.fullName}</p>
                <p>{order.address.addressLine}</p>
                <p>{order.address.city}, {order.address.state}</p>
                <p>{order.address.pincode}</p>
                <p>{order.address.phone}</p>
            </div>

            {/* Items */}
            <div className="border p-4 rounded mb-4">
                <h2 className="font-semibold mb-2">Items</h2>

                {order.items.map((item) => (
                    <div
                        key={item._id}
                        className="flex justify-between border-b py-2"
                    >
                        <div>
                            <p>{item.productId?.title}</p>
                            <p className="text-sm text-gray-500">
                                Qty: {item.quantity}
                            </p>
                        </div>
                        <p>₹{item.price}</p>
                    </div>
                ))}
            </div>

            {/* Download Button */}
            <div className="text-center">
                <button
                    onClick={downloadPDF}
                    className="bg-red-600 text-white px-6 py-2 rounded"
                >
                    Download Order PDF
                </button>
            </div>
        </div>
    );
}