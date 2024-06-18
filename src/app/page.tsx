"use client";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import {
  createThirdwebClient,
  defineChain,
  getContract,
  prepareContractCall,
} from "thirdweb";
import { polygonAmoy } from "thirdweb/chains";
import {
  ConnectButton,
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";

import { useSearchParams } from "next/navigation";

const wallets = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

const ERC20_CONTRACT_ADDRESS = "0x37345A286B11fB74581826793511A97ad807f35A";
const contract = getContract({
  client,
  chain: defineChain(80002),
  address: ERC20_CONTRACT_ADDRESS,
});

export default function Home() {
  const searchParams = useSearchParams();
  const meetingId = searchParams.get("meetingId");
  const account = useActiveAccount();

  const { data: userBalance, status: balanceStatus } = useReadContract({
    contract,
    method: "function balanceOf(address account) view returns (uint256)",
    params: [account?.address ?? ""],
  });
  console.log({ userBalance, balanceStatus });

  const {
    mutate: sendTransaction,
    data: tx,
    error,
    status,
  } = useSendTransaction();

  const onClick = () => {
    if (!account?.address) return;
    try {
      const transaction = prepareContractCall({
        contract,
        method:
          "function mintTo(address _to, uint256 _amount, uint256 _meetingId)",
        params: [account.address, BigInt(1 * 10 ** 18), BigInt(meetingId ?? 0)],
      });
      sendTransaction(transaction);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="background-animate flex bg-background  min-h-screen flex-col items-center justify-center  p-24">
      <NavBar />
      <div className="flex flex-col items-center justify-center gap-10">
        <h1 className="text-center bg-black p-2 text-8xl font-extrabold text-white">
          Apero du Code
        </h1>
        {/* <p className="text-xl text-center text-secondary">
          Governance token for the Apero du Code Meetup. Get your token now and
          be apart of the community!
        </p> */}
        <div className="items-center flex-col bg-black p-6  rounded-lg ">
          {userBalance && (
            <p className="text-2xl text-white font-bold pb-4">
              You have {String(userBalance / BigInt(10 ** 18))} tokens
            </p>
          )}
          <div className=" flex-row gap-4 flex flex-wrap">
            {account?.address ? (
              <>
                <button
                  onClick={onClick}
                  className="inline-flex items-center justify-center px-6 py-4 text-lg font-bold  rounded-lg bg-gradient-to-r from-[#ff00ff]  to-[#ff00ff] shadow-lg hover:scale-125 transition-all duration-100 ease-in-out "
                >
                  <p className=" p-1 text-3xl color-black bg-primary tracking-wide z-10">
                    Mint NFT
                  </p>
                </button>
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
      </div>
    </main>
  );
}
