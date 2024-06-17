import { createThirdwebClient } from "thirdweb";
export const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!;
export const secretKey = process.env.THIRDWEB_SECRET_KEY!;

export const thirdwebClient = createThirdwebClient(
  secretKey
    ? { secretKey }
    : {
        clientId,
      }
);
