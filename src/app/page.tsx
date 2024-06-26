"use client";
import { ReloadIcon } from "@radix-ui/react-icons";
import { prepareContractCall } from "thirdweb";
import { polygonAmoy } from "thirdweb/chains";
import {
  ConnectButton,
  useActiveAccount,
  useReadContract,
  useSendTransaction,
  useSendBatchTransaction,
} from "thirdweb/react";
import { useToast } from "@/components/ui/use-toast";
import {
  thirdwebClient,
  tokenContract,
  voteContract,
  wallets,
} from "@/lib/thirdwebClient";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Voting from "@/components/screens/home/Voting";

export default function Home() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const meetingId = searchParams.get("meetingId");
  const account = useActiveAccount();

  const { data: userBalance, status: balanceStatus } = useReadContract({
    contract: tokenContract,
    method: "function balanceOf(address account) view returns (uint256)",
    params: [account?.address ?? ""],
  });

  const { data: proposalThreshold, isLoading } = useReadContract({
    contract: voteContract,
    method: "function proposalThreshold() view returns (uint256)",
    params: [],
  });

  const { mutate: sendTransaction, error, status } = useSendBatchTransaction();

  useEffect(() => {
    if (status === "error") {
      toast({
        title: "An error occurred",
        description: error.message,
      });
    }
  }, [status, toast]);

  const onMint = () => {
    if (!account?.address) return;

    const mint = prepareContractCall({
      contract: tokenContract,
      method:
        "function mintTo(address _to, uint256 _amount, uint256 _meetingId)",
      params: [account.address, BigInt(1 * 10 ** 18), BigInt(meetingId ?? 0)],
    });
    const delegate = prepareContractCall({
      contract: tokenContract,
      method: "function delegate(address delegatee)",
      params: [account.address],
    });

    sendTransaction([mint, delegate]);
  };

  const canVote = Number(userBalance) >= Number(proposalThreshold);

  return (
    <main className="background-animate flex bg-background min-h-screen flex-col items-center justify-center ">
      <div className="flex flex-col items-center justify-center gap-10 w-full h-full">
        <h1 className="text-center bg-black p-2 text-5xl font-extrabold text-white md:text-8xl">
          L`Apéro du Code
        </h1>
        <div className="items-center flex-col bg-black p-6">
          <BalanceDisplay balance={userBalance} />
          <div className=" flex-row gap-4 flex flex-wrap">
            {account?.address ? (
              <>
                <MintButton
                  account={account}
                  meetingId={meetingId}
                  onMint={onMint}
                  status={status}
                />
                <ConnectButton
                  chain={polygonAmoy}
                  client={thirdwebClient}
                  wallets={wallets}
                />
              </>
            ) : (
              <ConnectButton
                connectButton={{
                  style: {
                    backgroundColor: "#f922c7",
                    color: "black",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    padding: "1.5rem",
                    borderRadius: "0.5rem",
                  },
                }}
                chain={polygonAmoy}
                client={thirdwebClient}
                accountAbstraction={{
                  chain: polygonAmoy,
                  sponsorGas: true,
                  factoryAddress:
                    process.env.NEXT_PUBLIC_SMART_ACCOUNT_FACTORY_ADDRESS,
                }}
                wallets={wallets}
              />
            )}
          </div>
        </div>
      </div>
      {canVote && <Voting />}
    </main>
  );
}

const MintButton = ({ account, meetingId, onMint, status }) => (
  <button
    disabled={status === "pending"}
    onClick={onMint}
    className="inline-flex items-center justify-center px-6 py-4 text-lg font-bold  rounded-lg bg-gradient-to-r from-[#ff00ff]  to-[#ff00ff] hover:from-[#ee11ff] hover:to-[#ee11ff] shadow-lg active:scale-90 transition-all duration-100 ease-in-out "
  >
    <p className="text-3xl tracking-wide z-10">
      {status === "pending" ? "Loading" : "Mint token"}
    </p>
    {status === "pending" && (
      <ReloadIcon className="h-5 w-5 text-white animate-spin" />
    )}
  </button>
);

const BalanceDisplay = ({ balance }: { balance: bigint | undefined }) =>
  balance && (
    <p className="text-2xl text-white font-bold pb-4">
      You have already {String(Number(balance) / 10 ** 18)} tokens
    </p>
  );
