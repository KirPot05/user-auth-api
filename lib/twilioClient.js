import Twilio from "twilio";
import { ACCOUNT_SID, AUTH_TOKEN } from "../config/constants.js";

const client = Twilio(ACCOUNT_SID, AUTH_TOKEN);

export default client;
