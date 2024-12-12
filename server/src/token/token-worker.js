import { parentPort } from "worker_threads";
import crypto from "crypto";
import fetch from "node-fetch";

const calcSig = (body) => {
  const hmac = crypto.createHmac("sha256", process.env.SANDBOX_API_SECRET);
  const time = Date.now().toString();

  hmac.update(time);
  hmac.update(process.env.METHOD);
  hmac.update(process.env.TEST_ENDPOINT);

  const contentHash = crypto.createHash("md5");
  contentHash.update(JSON.stringify(body));

  hmac.update(contentHash.digest("hex"));

  const auth = `HMAC ${time}:${hmac.digest("hex")}`;

  return auth;
};

export const sendRequest = async () => {
  try {
    const body = {};
    const headers = {
      authorization: calcSig(body),
      "api-key": process.env.SANDBOX_API_KEY,
      accept: "application/json",
    };
    const f = {
      method: process.env.METHOD,
      headers,
    };
    const fullURL = `${process.env.API_BASE_URL}${process.env.TEST_ENDPOINT}`;
    const response = await fetch(fullURL, f);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else console.log(response.status);
  } catch (err) {
    console.error("Fetch error = ", err);
  }
};

export const fetchTokens = async () => {
  const strigaTokens = await sendRequest();
  if (!strigaTokens) throw Error("Failed to fetch tokens");

  parentPort.postMessage(strigaTokens);
};

fetchTokens();
