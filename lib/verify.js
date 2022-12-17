import { SERVICE_SID } from "../config/constants.js";
import TwilioClient from "./twilioClient.js";

export async function sendVerificationMessage(phoneNumber) {
  try {
    const response = await TwilioClient.verify.v2
      .services(SERVICE_SID)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });
  } catch (err) {
    return {
      errCode: err.status,
      errMsg: err.errMessage || err.message,
    };
  }
}

export async function verifyUserNumber(phoneNumber, verificationCode) {
  try {
    const response = await TwilioClient.verify.v2
      .services(SERVICE_SID)
      .verificationChecks.create({
        to: phoneNumber,
        code: verificationCode,
      });

    if (response.status === "approved") return true;

    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}
