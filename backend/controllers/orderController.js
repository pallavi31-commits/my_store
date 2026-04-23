import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import PDFDocument from 'pdfkit';

export const placeOrder = async (req, res) => {
    try {
        const { userId, address } = req.body;

        //Get Cart
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        //Prepare Order Items
        const orderItems = cart.items.map(item => ({
            productId: item.productId._id,
            title: item.productId.title,
            quantity: item.quantity,
            price: item.productId.price,
        }));

        //Calculate Total Amount
        const totalAmount = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);

        //Deduct stock from Products
        for (let item of cart.items){
            await Product.findByIdAndUpdate(item.productId._id, { $inc: { stock: -item.quantity } });
        }

        //Create Order
        const order = await Order.create({
            userId,
            items: orderItems,
            address,
            totalAmount,
            paymentMethod: "COD",
        });

        //Clear Cart
        await Cart.findOneAndUpdate({ userId }, { items: [] });

        res.status(201).json({ message: "Order placed successfully", orderId: order._id });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
}

// controllers/orderController.js

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("items.productId", "title price"); // get product details

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const downloadOrderPDF = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("items.productId", "title price");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const doc = new PDFDocument();

        // Set headers for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=order-${order._id}.pdf`
        );

        doc.pipe(res);

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

// Header Row
doc.fontSize(12).text('Item', itemX, tableTop);
doc.text('Qty', qtyX, tableTop);
doc.text('Price', priceX, tableTop);
doc.text('Total', totalX, tableTop);

// Line
doc.moveTo(50, tableTop + 15)
   .lineTo(550, tableTop + 15)
   .stroke();

let y = tableTop + 25;

// Rows
order.items.forEach((item) => {
    doc.text(item.title, itemX, y);
    doc.text(item.quantity.toString(), qtyX, y);
    doc.text(`₹${item.price}`, priceX, y);
    doc.text(`₹${item.quantity * item.price}`, totalX, y);

    y += 20;
});

// Line after table
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

// ===== SHIPPING ADDRESS BOX =====

// Position
const boxX = 50;
const boxY = doc.y + 20;
const boxWidth = 250;
const boxHeight = 100;

// Draw box
doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();

// Title
doc.fontSize(12).text('Shipping Address', boxX + 10, boxY + 10);

// Address text inside box
doc.fontSize(10).text(order.address.fullName, boxX + 10, boxY + 30);
doc.text(order.address.addressLine, boxX + 10, boxY + 45);
doc.text(`${order.address.city}, ${order.address.state}`, boxX + 10, boxY + 60);
doc.text(order.address.pincode, boxX + 10, boxY + 75);
        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};