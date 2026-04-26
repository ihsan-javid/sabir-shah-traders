import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: String,
  name: String,
  image: String,
  price: Number,
  qty: Number,
});

const OrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postal: { type: String, default: "" },
    items: [OrderItemSchema],
    subtotal: Number,
    shipping: Number,
    total: Number,
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "COD" },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
