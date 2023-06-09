import { model, models, Schema } from "mongoose";

const OrderSchema = new Schema(
  {
    // userEmail: String,
    orderId: String,
    purchaseDate: String,
    line_items: Object,
    name: String,
    email: String,
    phoneNumber: String,
    city: String,
    postalCode: String,
    streetAddress: String,
    country: String,
    paymentMethod: String,
    status: String,
    delivery: Object,
    totalPayment: Number,
  },
  {
    timestamps: true,
  }
);

export const Order = models?.Order || model("Order", OrderSchema);
