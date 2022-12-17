import { validationResult, body } from "express-validator";
import { failed_response } from "../helpers/response.js";

export const profileValidation = [
  body("name", "Invalid name").isString().isLength({ min: 3 }),
  body("email", "Invalid email").isEmail().normalizeEmail(),
  body("dob", "Enter a valid date of birth")
    .exists()
    .not()
    .isEmpty()
    .withMessage("Date of birth cannot be empty")
    .isISO8601("yyyy-mm-dd")
    .matches("^[0-9]|0[0-9]|1[0-9]|2[0-3]$")
    .withMessage("Date of birth must be in correct format yyyy:mm:dd"),
  body("address", "Enter a valid address of atleast 5 characters").isString(),
];

export const userCredentials = [
  body("phoneNumber")
    .isMobilePhone("en-IN")
    .withMessage("A valid phone number is required"),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Enter a password of minimum 5 characters"),
];

export const userVerify = [
  body("phoneNumber")
    .isMobilePhone("en-IN")
    .withMessage("A valid phone number is required"),
];

export function validateErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(failed_response(500, "Something went wrong", errors.array()));
  }
  next();
}
