import { generateKeyPairSync } from "crypto";

export default function handler(req: any, res: any) {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  res.json({
    public: publicKey.export({ type: "pkcs1", format: "pem" }),
    private: privateKey.export({ type: "pkcs1", format: "pem" }),
  });
}
