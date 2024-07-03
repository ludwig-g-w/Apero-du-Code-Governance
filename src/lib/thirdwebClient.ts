import { createThirdwebClient, prepareEvent } from "thirdweb";
export const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!;
export const secretKey = process.env.THIRDWEB_SECRET_KEY!;

import { defineChain, getContract } from "thirdweb";
import { createWallet, inAppWallet } from "thirdweb/wallets";

export const thirdwebClient = createThirdwebClient(
  secretKey
    ? { secretKey }
    : {
        clientId,
      }
);

export const wallets = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

const ERC20_CONTRACT_ADDRESS = "0xf368e9D38E1A1091ae8CBac2Ee3dfCc449D46e49";
export const tokenContract = getContract({
  client: thirdwebClient,
  chain: defineChain(80002),
  address: ERC20_CONTRACT_ADDRESS,
});

export const voteContract = getContract({
  client: thirdwebClient,
  chain: defineChain(80002),
  address: "0x26a5C0f7CB0A7d5B747bC9d84BDcf0cDDf779DaF",
});

export const proposalCreatedEvent = prepareEvent({
  contract: voteContract,
  signature:
    "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)",
});

export const tokenClaimedEvent = prepareEvent({
  contract: tokenContract,
  signature:
    "event TokensClaimed(address indexed claimer, address indexed receiver, uint256 indexed startTokenId, uint256 quantityClaimed)",
});

export const transferEvent = prepareEvent({
  contract: tokenContract,
  signature:
    "event Transfer(address indexed from, address indexed to, uint256 value)",
});
