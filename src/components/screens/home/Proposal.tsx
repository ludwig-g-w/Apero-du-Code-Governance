import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { voteContract } from "@/lib/thirdwebClient";
import { useCallback, useEffect } from "react";
import { prepareContractCall } from "thirdweb";
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";

export function ProposalItem({ proposal }) {
  const account = useActiveAccount();
  const { data: hasVoted } = useReadContract({
    contract: voteContract,
    method:
      "function hasVoted(uint256 proposalId, address account) view returns (bool)",
    params: [proposal.proposalId, account?.address ?? ""],
  });

  const { data: votes } = useReadContract({
    contract: voteContract,
    method:
      "function proposalVotes(uint256 proposalId) view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)",
    params: [proposal.proposalId],
  });

  const { mutate: sendTransaction, error, isPending } = useSendTransaction();

  const handleVote = useCallback(
    (support: number) => {
      const transaction = prepareContractCall({
        contract: voteContract,
        method:
          "function castVote(uint256 proposalId, uint8 support) returns (uint256)",
        params: [proposal.proposalId, support],
      });
      sendTransaction(transaction);
    },
    [proposal.proposalId, sendTransaction]
  );

  useEffect(() => {
    if (error) {
      toast({
        title: "An error occurred",
        description: error.message,
      });
    }
  }, [error]);

  const prettifyId = (id?: bigint) => {
    if (!id) return 0;
    return id.toString().slice(0, 6) + "..." + id.toString().slice(-4);
  };

  return (
    <div className={`p-4 bg-popover`}>
      <p className="text-xl text-white pb-4">
        Proposal:{" "}
        <span className="text-primary font-bold">
          {prettifyId(proposal.proposalId)}
        </span>
      </p>
      <p className=" text-white pb-4 color-muted">{proposal.description}</p>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {["Against", "Approve", "Abstain"].map((label, i) => (
          <Button
            disabled={hasVoted}
            loading={isPending}
            key={i}
            variant={"outline"}
            className={`flex items-center justify-center px-6 py-4 border-${
              i === 0 ? "primary" : i === 1 ? "secondary" : "muted"
            } bg-transparent`}
            onClick={() =>
              handleVote(label === "Approve" ? 1 : label === "Against" ? 0 : 2)
            }
          >
            <p className="text-white font-bold">
              {label} {Number(votes?.[i]) / 10 ** 18 ?? 0}
            </p>
          </Button>
        ))}
      </div>
    </div>
  );
}
