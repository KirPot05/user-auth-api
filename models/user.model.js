import { Schema, model } from "mongoose";

const userSchema = Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v.substr(3));
        },
        message: "{VALUE} is not a valid 10 digit number!",
      },
    },
    password: {
      type: String,
      required: true,
    },

    profile: {
      name: String,
      email: String,
      dob: {
        type: Date,
        min: "1930-01-01",
        max: "2021-01-01",
      },
      address: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user",
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.virtual("age").get(function () {
  return Math.floor(
    (Date.now() - this.profile.dob.getTime()) / (1000 * 3600 * 24 * 365)
  );
});

export default model("users", userSchema);
