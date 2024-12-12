import crypto from "crypto";

export const calcSig = (body: any) => {
  const hmac = crypto.createHmac("sha256", process.env.SANDBOX_API_SECRET);
  const time = Date.now().toString();

  hmac.update(time);
  hmac.update(process.env.METHOD);
  hmac.update(process.env.SWAP_ENDPOINT);

  const contentHash = crypto.createHash("md5");
  contentHash.update(JSON.stringify(body));

  hmac.update(contentHash.digest("hex"));

  const auth = `HMAC ${time}:${hmac.digest("hex")}`;

  return auth;
};
