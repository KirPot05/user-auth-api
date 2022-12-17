import { failed_response, success_response } from "../helpers/response.js";
import {
  encryptPassword,
  getAuthToken,
  isCorrectPassword,
} from "../lib/auth.js";
import { sendVerificationMessage, verifyUserNumber } from "../lib/verify.js";
import UserModel from "../models/user.model.js";

export async function registerUser(req, res) {
  const { phoneNumber, password } = req.body;
  try {
    let userData = null;

    // DB operation to find user
    userData = await UserModel.findOne({
      phoneNumber: phoneNumber,
    });

    if (userData != null) {
      return res.json(failed_response(400, "User already exists"));
    }

    const secPassword = await encryptPassword(password);
    userData = {
      phoneNumber,
      password: secPassword,
    };

    // DB operation to create user
    const user = await UserModel.create(userData);
    const data = {
      id: user.id,
      role: user.role,
    };

    const error = await sendVerificationMessage(phoneNumber);
    if (error !== undefined) throw new Error(error.errMsg);

    const authToken = await getAuthToken(data);
    res.json(
      success_response(200, "Registration successful", {
        phoneNumber,
        authToken,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(
      failed_response(500, error.message || "Internal server error")
    );
  }
}

export async function userLogin(req, res) {
  const { phoneNumber, password } = req.body;
  try {
    let userData = null;

    if (phoneNumber != null && phoneNumber != "") {
      userData = await UserModel.findOne({
        phoneNumber: phoneNumber,
      });
    }

    if (userData == null) {
      return res.status(500).json(failed_response(500, "User not found"));
    }

    if (!userData.verified)
      return res
        .status(403)
        .json(failed_response(403, "Users need to verify before login"));

    // Compares hashed password in DB and entered password
    const passwordMatches = await isCorrectPassword(
      password,
      userData.password
    );
    if (!passwordMatches) {
      return res.status(500).json({ error: "Please enter valid credentials" });
    }

    // Returns Logged in user's id
    const data = {
      id: userData.id,
      role: userData.role,
    };

    // Signs and generates an authentication token
    const authToken = await getAuthToken(data);

    res.json(
      success_response(200, "Login successful", {
        phoneNumber,
        authToken,
        role: userData.role,
      })
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(failed_response(500, error.message || "Internal Server Error"));
  }
}

export async function verifyUser(req, res) {
  const { phoneNumber, verifyCode } = req.body;
  try {
    const isUserVerified = await verifyUserNumber(phoneNumber, verifyCode);

    if (!isUserVerified)
      return res
        .status(400)
        .json(
          failed_response(
            400,
            "Please enter the correct mobile number and verification-code"
          )
        );

    await UserModel.findOneAndUpdate(
      { phoneNumber: phoneNumber },
      { verified: true }
    );

    res
      .status(200)
      .json(success_response(200, "User verified successfully!", {}));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(failed_response(500, error.message || "Internal Server Error"));
  }
}

export async function createProfile(req, res) {
  const { name, email, dob, address } = req.body;
  try {
    const profile = {
      name,
      email,
      dob,
      address,
    };

    const updatedUserProile = await UserModel.findByIdAndUpdate(
      req.user_id,
      {
        $set: { profile: profile },
      },
      { new: true }
    );

    res
      .status(201)
      .json(
        success_response(
          201,
          "Profile created successfully",
          updatedUserProile?.profile
        )
      );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(failed_response(500, error.message || "Internal Server Error"));
  }
}

export async function fetchUserProfile(req, res) {
  try {
    const user = await UserModel.findById(req.user_id);

    if (!user.profile)
      return res
        .status(404)
        .json(
          failed_response(
            404,
            "Profile not available! Please do create one, if not done already!"
          )
        );

    res
      .status(200)
      .json(success_response(200, "Profile found successfully", user.profile));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(failed_response(500, error.message || "Internal Server Error"));
  }
}

export async function fetchUsers(req, res) {
  try {
    if (req.role !== "admin")
      return res.status(403).json(failed_response(403, "Forbidden Operation"));

    const users = await UserModel.aggregate([
      {
        $group: {
          _id: "$_id",
          name: { $first: "$profile.name" },
          email: { $first: "$profile.email" },
          dob: { $first: "$profile.dob" },
          address: { $first: "$profile.address" },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    if (users.length === 0) throw new Error("Users not found");

    res
      .status(200)
      .json(success_response(200, "Users fetched successfully", users));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(failed_response(500, error.message || "Internal Server Error"));
  }
}
