import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import PDFDocument from 'pdfkit';
import path from 'path';


// ================= PLACE ORDER =================
export const placeOrder = async (req, res) => {
    try {
        const { userId, address } = req.body;

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const orderItems = cart.items.map(item => ({
            productId: item.productId._id,
            title: item.productId.title,
            quantity: item.quantity,
            price: item.productId.price,
        }));

        const totalAmount = orderItems.reduce(
            (total, item) => total + (item.price * item.quantity),
            0
        );

        for (let item of cart.items) {
            await Product.findByIdAndUpdate(item.productId._id, {
                $inc: { stock: -item.quantity }
            });
        }

        const order = await Order.create({
            userId,
            items: orderItems,
            address,
            totalAmount,
            paymentMethod: "COD",
        });

        await Cart.findOneAndUpdate({ userId }, { items: [] });

        res.status(201).json({
            message: "Order placed successfully",
            orderId: order._id
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};


// ================= GET ORDER =================
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("items.productId", "title price");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ================= DOWNLOAD PDF =================
export const downloadOrderPDF = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("items.productId", "title price");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=order-${order._id}.pdf`
        );

        doc.pipe(res);

        // ===== LOGO (TOP LEFT) =====
        const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png');
        doc.image(logoPath, 50, 20, { width: 80 });

        // ===== HEADER =====
        doc.fontSize(20).text('ORDER SUMMARY', { align: 'center' });

        doc.moveDown();

        doc.fontSize(10).text(`Order ID: ${order._id}`);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);

        // ===== TABLE =====
        doc.moveDown();

        const tableTop = doc.y;
        const itemX = 50;
        const qtyX = 300;
        const priceX = 350;
        const totalX = 450;

        doc.fontSize(12).text('Item', itemX, tableTop);
        doc.text('Qty', qtyX, tableTop);
        doc.text('Price', priceX, tableTop);
        doc.text('Total', totalX, tableTop);

        doc.moveTo(50, tableTop + 15)
           .lineTo(550, tableTop + 15)
           .stroke();

        let y = tableTop + 25;

        order.items.forEach((item) => {
            doc.text(item.title, itemX, y);
            doc.text(item.quantity.toString(), qtyX, y);
            doc.text(`₹${item.price}`, priceX, y);
            doc.text(`₹${item.quantity * item.price}`, totalX, y);
            y += 20;
        });

        doc.moveTo(50, y)
           .lineTo(550, y)
           .stroke();

        // ===== TOTAL =====
        doc.moveDown();

        doc.text(`Subtotal: ₹${order.totalAmount}`, { align: 'right' });
        doc.text(`Shipping: ₹0`, { align: 'right' });
        doc.text(`Total: ₹${order.totalAmount}`, { align: 'right' });

        // ===== ADDRESS =====
        doc.moveDown();

        const boxX = 50;
        const boxY = doc.y + 20;
        const boxWidth = 250;
        const boxHeight = 100;

        doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();

        doc.fontSize(12).text('Shipping Address', boxX + 10, boxY + 10);

        doc.fontSize(10).text(order.address.fullName, boxX + 10, boxY + 30);
        doc.text(order.address.addressLine, boxX + 10, boxY + 45);
        doc.text(`${order.address.city}, ${order.address.state}`, boxX + 10, boxY + 60);
        doc.text(order.address.pincode, boxX + 10, boxY + 75);

        // ===== FOOTER =====
        doc.moveDown(4);
        doc.fontSize(12).text('Thank you for shopping!', {
            align: 'center'
        });

        doc.end();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};