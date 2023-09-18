const mongoose = require("mongoose");
const validator = require("validator");
const { parsePhoneNumberFromString } = require("libphonenumber-js");

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          // Ensure the number is in E.164 format
          const phoneNumber = parsePhoneNumberFromString(v);
          if (!phoneNumber) return false;
          return phoneNumber.isValid();
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
      required: [true, "User phone number required"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
