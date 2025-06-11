
import nftMarketPlace from '../../artifacts/contracts/NFTMarket.sol/NFTMarketplace.json'
import nftMarketPlaceErc20 from '../../artifacts/contracts/DimondERC20.sol/DiamondVerseToken.json'
import nft from '../../artifacts/contracts/NFT.sol/NFT.json'
import networks from 'data/evm-network-chains.json';

import type { DvNetwork } from '@types';
import EthIcon from 'components/miscellaneous/web3/EthIcon';
import environment from '../../env.json'

//  NFT Contract Details
export const NFT_ADDRESS = environment.NFT_ADDRESS || "";
export const NFT_ABI = nft.abi || [];
export const NFT_BYTECODE = nft.bytecode || "";

// NFT Marketplace Contract Details
export const NFT_MARKET_PLACE_ADDRESS = environment.NFT_MARKET_PLACE_ADDRESS || "";
export const NFT_MARKET_PLACE_ABI = nftMarketPlace.abi || [];
export const NFT_MARKET_PLACE_BYTECODE = nftMarketPlace.bytecode || "";

// NFT Marketplace_erc20 Contract Details
export const NFT_MARKET_PLACE_ADDRESS_ERC20 = environment.NFT_MARKET_PLACE_ADDRESS_ERC20 || "";
export const NFT_MARKET_PLACE_ABI_ERC20 = nftMarketPlaceErc20.abi || [];
export const NFT_MARKET_PLACE_BYTECODE_ERC20 = nftMarketPlaceErc20.bytecode || "";

export const SITE_COLORS = () => {
    var siteColors = environment.SITE_COLORS || "";
    const newSiteColors: string[] = siteColors.split(",").filter(c => c);
    return newSiteColors.length ? siteColors : ["#000000", "#250a18", "#3e0932", "#510b55", "#571a81"];
};

export const SITE_TOKEN_DOLLAR = "$";
export const NETWORK_CHAIN = environment.CONTRACT_CHAIN_NETWORK || "mainnet";
export const CURRENT_NETWORK: DvNetwork = networks?.find(network => network.id == NETWORK_CHAIN) || {};
export const ETHERSCAN_BASE_URL = CURRENT_NETWORK?.scan_url || "";
export const TOKEN = CURRENT_NETWORK.token || "ETH"
export const SITE_TOKEN = TOKEN == 'ETH' ? EthIcon : TOKEN;
// Dollar

export const PRIVATE_KEY = environment.PRIVATE_KEY || "";

// Infura Details
export const INFURA_PROJECT_ID = environment.INFURA_PROJECT_ID || "";
export const INFURA_PROJECT_SECRET = environment.INFURA_PROJECT_SECRET || "";
export const INFURA_API_ENDPOINT = environment.INFURA_API_ENDPOINT || "";
export const INFURA_IPFS_BASE_URL = checkSlashInTheEnd(environment.INFURA_IPFS_BASE_URL) || "";
export const INFURA_KEY = environment.INFURA_KEY || ""
export const INFURA_RPC_ENDPOINT = environment.INFURA_RPC_ENDPOINT || "";

// Site Details
export const SECRET = environment.SECRET || "diamond-verse-crsf-token";
export const APP_BASE_URL = environment.APP_BASE_URL || "http://localhost:3000/";

function checkSlashInTheEnd(text: any = "", extra = "ipfs") {
    if(typeof text == "string") {
        text = text.replace('/ipfs', "").replace('/ipfs/', "")
        if(text.slice(-1) == "/") text = text+extra
        else text = text+"/"+extra
        return text;
    } 
    return "";
}