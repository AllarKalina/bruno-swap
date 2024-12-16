import crypto from "crypto";

export const calcSig = <T>({
  body,
  method,
  endpoint,
}: {
  body: T;
  method: string;
  endpoint: string;
}): string => {
  const hmac = crypto.createHmac("sha256", process.env.SANDBOX_API_SECRET);
  const time = Date.now().toString();

  hmac.update(time);
  hmac.update(method);
  hmac.update(endpoint);

  const contentHash = crypto.createHash("md5");
  contentHash.update(JSON.stringify(body));

  hmac.update(contentHash.digest("hex"));

  const auth = `HMAC ${time}:${hmac.digest("hex")}`;

  return auth;
};

// const lol = fetch("http://localhost:8080/api/v1/token/swap", {
//   method: "POST",
//   headers: {
//     "Content-type": "application/json",
//   },
//   body: JSON.stringify({
//     userId: "aecf2438-ade3-4563-ac48-aba3ddcf5d16",
//     sourceAccountId: "da41c756b86fc7b1d1f89bc479b67d46",
//     destinationAccountId: "b5a20319b860aec9cef82a83a5365f7b",
//     amount: "1000",
//     ip: "127.0.0.1",
//   }),
// })
//   .then((res) => res.json())
//   .then(console.log);
