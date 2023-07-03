const { Schema, model, Types } = require("mongoose");
const crypto = require("crypto");

const UserSchema = new Schema(
  {
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      min: 6,
    },
    address: [
      {
        district: String,
        ward: String,
        city: String,
        homeNumber: String,
      },
    ],
    lastName: { type: String, default: "" },
    firstName: { type: String, default: "" },
    cart: [
      {
        bid: { type: Types.ObjectId, ref: "Book" },
        quantity: { type: Number },
      },
    ],
    role: { type: String, enum: ["user", "admin", "creator"], default: "user" },
    avatar: { type: String, default: null },
    mobile: { type: Number, default: null },
    refresh_token: { type: String, default: "" },
    registerToken: { type: String, default: "" },
    passwordChangedAt: String,
    passwordResetToken: String,
    passwordResetExpired: String,
  },
  { timestamps: true }
);

UserSchema.methods.createPasswordChangedToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpired = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

const User = model("User", UserSchema);
module.exports = User;
