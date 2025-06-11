
import nftMarketPlace from '../artifacts/contracts/NFTMarket.sol/NFTMarketplace.json'
import nftMarketPlaceErc20 from '../artifacts/contracts/DimondERC20.sol/DiamondVerseToken.json'
import nft from '../artifacts/contracts/NFT.sol/NFT.json'
import networks from 'data/evm-network-chains.json';
import type { DvNetwork } from '@types';
import EthIcon from 'components/miscellaneous/web3/EthIcon';


//  NFT Contract Details
export const NFT_ADDRESS = process.env.NFT_ADDRESS || "";
export const NFT_ABI = nft.abi || [];
export const NFT_BYTECODE = nft.bytecode || "";

// NFT Marketplace Contract Details
export const NFT_MARKET_PLACE_ADDRESS = process.env.NFT_MARKET_PLACE_ADDRESS || "";
export const NFT_MARKET_PLACE_ABI = nftMarketPlace.abi || [];
export const NFT_MARKET_PLACE_ABI_ERC20 = nftMarketPlaceErc20.abi || [];
export const NFT_MARKET_PLACE_ADDRESS_ERC20 = process.env.NFT_MARKET_PLACE_ADDRESS_ERC20 || "";
export const NFT_MARKET_PLACE_BYTECODE = nftMarketPlace.bytecode || "";

export const MORALIS_IPFS_BASE_URL = process.env.MORALIS_IPFS_BASE_URL || "";

export const SITE_COLORS = () => {
    var siteColors = process.env.SITE_COLORS || "";
    const newSiteColors: string[] = siteColors.split(",").filter(c => c);
    return newSiteColors.length ? siteColors : ["#000000", "#250a18", "#3e0932", "#510b55", "#571a81"];
};

export const SITE_TOKEN_DOLLAR = "$";
export const NETWORK_CHAIN = process.env.CONTRACT_CHAIN_NETWORK || "mainnet";
export const CURRENT_NETWORK: DvNetwork = networks?.find(network => network.id == NETWORK_CHAIN) || {};
export const ETHERSCAN_BASE_URL = CURRENT_NETWORK?.scan_url || "";
export const TOKEN = CURRENT_NETWORK.token || "ETH"
export const SITE_TOKEN = TOKEN == 'ETH' ? EthIcon : TOKEN;
// Dollar


// Pinata IPFS Details 
export const PINATA_BASE_URL = process.env.PINATA_BASE_URL || "";
export const PINATA_API_KEY = process.env.PINATA_API_KEY || "";

export const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

// Infura Details
export const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || "";
export const INFURA_PROJECT_SECRET = process.env.INFURA_PROJECT_SECRET || "";
export const INFURA_API_ENDPOINT = process.env.INFURA_API_ENDPOINT || "";
export const INFURA_IPFS_BASE_URL = process.env.INFURA_IPFS_BASE_URL || "";
export const INFURA_KEY = process.env.INFURA_KEY || ""
export const INFURA_RPC_ENDPOINT = process.env.INFURA_RPC_ENDPOINT || "";


// Site Details
export const SECRET = process.env.SECRET || "diamond-verse-crsf-token";
export const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000/";

// Asset Details
export const ASSET_BASE_URL = process.env.ASSET_BASE_URL || "";