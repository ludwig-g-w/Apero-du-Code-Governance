"use client";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import {
  hexToBigInt,
  createThirdwebClient,
  defineChain,
  getContract,
} from "thirdweb";
import { polygonAmoy } from "thirdweb/chains";
import {
  ConnectButton,
  ThirdwebProvider,
  useActiveAccount,
} from "thirdweb/react";
import { prepareEvent } from "thirdweb";
import { useContractEvents } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";

const wallets = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

const contract = getContract({
  client,
  chain: defineChain(80002),
  address: "0x5DEe663BE3fce068140d543DB41004Ed35462Aa4",
});

function InnerHome() {
  const preparedEvent = prepareEvent({
    // contract,
    signature:
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
  });

  const {
    mutate: sendTransaction,
    data: tx,
    error,
    status,
  } = useSendTransaction();

  console.log({
    tx,
    error,
    status,
  });

  const account = useActiveAccount();

  const onClick = () => {
    if (!account?.address) return;
    try {
      const transaction = prepareContractCall({
        contract,
        method: "function mintTo(address to, uint256 amount)",
        params: [account?.address, hexToBigInt("0x1")],
        value: hexToBigInt("0x0"),
      });
      sendTransaction(transaction);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="flex bg-background  min-h-screen flex-col items-center justify-center  p-24">
      <NavBar />
      <div className="flex flex-col items-center justify-center gap-10">
        <h1 className="text-4xl font-bold">Apero du Code</h1>
        <p className="text-2xl">
          Mint your own NFTs on Polygon Mumbai with our NFT minting contract.
        </p>
        <div className=" flex-col gap-4 flex flex-wrap">
          {account?.address ? (
            <>
              <Button onClick={onClick} className="p-8 bg-primary">
                Mint Token
              </Button>
              <ConnectButton
                chain={polygonAmoy}
                client={client}
                wallets={wallets}
              />
            </>
          ) : (
            <ConnectButton
              chain={polygonAmoy}
              client={client}
              wallets={wallets}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <ThirdwebProvider>
      <InnerHome />
    </ThirdwebProvider>
  );
}
