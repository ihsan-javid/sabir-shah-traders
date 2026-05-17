import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["shipping", "refund", "privacy", "terms"],
      required: true,
      unique: true,
    },
    content: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Policy || mongoose.model("Policy", PolicySchema);
