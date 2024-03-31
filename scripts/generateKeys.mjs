import crypto from "node:crypto";
import fs from "node:fs";

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
    },
    privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
    },
});

console.log(publicKey, privateKey);

fs.writeFileSync("certs/private.pem", privateKey, (err) => {
    if (err) throw err;
    console.log("Private key saved to certs/private.pem");
});

fs.writeFileSync("certs/public.pem", publicKey, (err) => {
    if (err) throw err;
    console.log("Public key saved to certs/public.pem");
});
