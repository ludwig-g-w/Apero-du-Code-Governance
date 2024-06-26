import { Button } from "@/components/ui/button";
import { tokenContract, voteContract } from "@/lib/thirdwebClient";
import { prepareContractCall } from "thirdweb";
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { ProposalItem } from "./Proposal";

export default function Voting() {
  const [description, setDescription] = useState("");
  const account = useActiveAccount();
  const { data: proposals, isLoading } = useReadContract({
    contract: voteContract,
    method:
      "function getAllProposals() view returns ((uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)[] allProposals)",
    params: [],
  });

  const { data: threshold } = useReadContract({
    contract: voteContract,
    method: "function proposalThreshold() view returns (uint256)",
    params: [],
  });
  console.log({ threshold });

  const { mutate: sendTransaction, error } = useSendTransaction();

  useEffect(() => {
    if (error) {
      toast({
        title: "An error occurred",
        description: error.message,
      });
    }
  }, [error]);

  const vote = () => {
    const transaction = prepareContractCall({
      contract: voteContract,
      method:
        "function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256 proposalId)",
      params: [[tokenContract.address], [0n], ["0x"], description],
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

          {/* Proposal creation */}
          <div className="flex flex-col bg-black justify-center w-full h-full py-4 px-2 gap-2">
            <div className="flex flex-col gap-4">
              <label className="text-white">Description</label>
              <textarea
                placeholder="explain your proposal"
                className="bg-muted w-full h-24 p-2 rounded-md font-white color-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button
              variant={"outline"}
              className="flex bg-secondary items-center justify-center px-6 py-4 border-primary bg-transparent"
              onClick={vote}
            >
              <p className="text-white font-bold">Create</p>
            </Button>
          </div>

          {proposals?.map((proposal, index) => (
            <ProposalItem key={index} proposal={proposal} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
