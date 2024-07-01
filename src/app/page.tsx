"use client";
import { ReloadIcon } from "@radix-ui/react-icons";
import { prepareContractCall } from "thirdweb";
import { polygonAmoy } from "thirdweb/chains";
import { ChevronDownIcon } from "@radix-ui/react-icons";
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
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-col items-center justify-center gap-10 w-full h-[100vh]">
        <h1 className="text-center bg-black p-2 text-5xl font-extrabold text-white md:text-8xl">
          L`Apéro du Code
        </h1>
        <div className="items-center flex-col bg-black p-6">
          <BalanceDisplay balance={userBalance} />
          {/* Mint section */}
          <div className="flex-col sm:flex-row gap-4 flex flex-wrap">
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
          {/* bouncing arrow down with the text */}
        </div>
        {canVote && (
          <button
            className="absolute bottom-6 justify-center items-center flex-col flex"
            onClick={() => {
              // scrool to voting section
              document.getElementById("voting")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            <p className="text-2xl text-white pb-4">Proposals</p>
            <ChevronDownIcon className="h-10 w-10 text-white animate-bounce" />
          </button>
        )}
      </div>
      {canVote && <Voting />}
    </main>
  );
}

const MintButton = ({ account, meetingId, onMint, status }) => (
  <Button
    loading={status === "pending"}
    disabled={status === "pending"}
    onClick={onMint}
    className="p-8 text-2xl font-bold"
  >
    Mint token
  </Button>
);

const BalanceDisplay = ({ balance }: { balance: bigint | undefined }) =>
  balance && (
    <p className="text-2xl text-white pb-4">
      Balance:{" "}
      <span className="text-primary font-bold">
        {String(Number(balance) / 10 ** 18)}
      </span>{" "}
      tokens
    </p>
  );
