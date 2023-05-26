const { Schema, model } = require("mongoose");
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
    lastName: { type: String, default: "" },
    firstname: { type: String, default: "" },
    cart: { type: [], default: [] },
    role: { type: String, default: "user" },
    avatar: { type: String, default: null },
    mobile: { type: Number, default: null },
    refreshToken: { type: String, default: "" },
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
