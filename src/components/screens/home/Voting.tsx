import { Button } from "@/components/ui/button";
import { voteContract } from "@/lib/thirdwebClient";
import { prepareContractCall } from "thirdweb";
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function Voting() {
  const [description, setDescription] = useState("");
  const { data: proposals, isLoading } = useReadContract({
    contract: voteContract,
    method:
      "function getAllProposals() view returns ((uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)[] allProposals)",
    params: [],
  });

  const { mutate: sendTransaction } = useSendTransaction();

  const onClick = () => {
    const transaction = prepareContractCall({
      contract: voteContract,
      method:
        "function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256 proposalId)",
      params: [[], [], [], description],
    });
    sendTransaction(transaction);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {isLoading ? (
        <p className="text-xl text-center text-secondary">Loading...</p>
      ) : (
        <div className="max-w-[500px] flex flex-col w-full h-full p-6">
          <h4 className=" bg-black text-4xl font-extrabold text-white">
            Voting
          </h4>
          {proposals?.map((proposal, index) => (
            <ProposalItem key={index} proposal={proposal} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

const ProposalItem = ({ proposal, index }) => {
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

  console.log({ votes, hasVoted, proposalid: proposal.proposalId });

  const { mutate: sendTransaction, error } = useSendTransaction();
  console.log({ error });

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
    <div className={`p-4 bg-popover ${hasVoted ? "bg-secondary" : ""}`}>
      <p className="text-2xl text-white font-bold pb-4">
        Proposal {prettifyId(proposal.proposalId)}
      </p>
      <p className="text-xl text-white pb-4 color-muted">
        {proposal.description}
      </p>
      <div className="flex flex-row gap-4 w-full">
        {["Approve", "Against", "Abstain"].map((label, i) => (
          <Button
            key={i}
            variant={"outline"}
            className={`flex items-center justify-center px-6 py-4 border-${
              i === 0 ? "primary" : i === 1 ? "secondary" : "muted"
            } bg-transparent`}
            onClick={() =>
              handleVote(label === "Approve" ? 0 : label === "Against" ? 1 : 2)
            }
          >
            <p className="text-white font-bold">
              {label} {Number(votes?.[i]) ?? 0}
            </p>{" "}
          </Button>
        ))}
      </div>
    </div>
  );
};
