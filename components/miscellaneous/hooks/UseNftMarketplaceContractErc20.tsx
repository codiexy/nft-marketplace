import { ethers } from 'ethers';
import React from 'react'

import { Metamask, MetamaskContextResponse } from 'context';
import { NFT_MARKET_PLACE_ABI_ERC20, NFT_MARKET_PLACE_ADDRESS_ERC20 } from 'backend/utils/constants';

function UseNftMarketplaceContractErc20() {
    const [constract, setContract] = React.useState<any>(false);
    const { isAuthenticated, web3 }: MetamaskContextResponse = Metamask.useContext();

    React.useEffect(() => {
        (async () => {
            try {
                if (isAuthenticated && web3.library && Object.keys(web3.library).length) {
                    const signer = web3.library.getSigner();
                    const newContract = new ethers.Contract(NFT_MARKET_PLACE_ADDRESS_ERC20, NFT_MARKET_PLACE_ABI_ERC20, signer);
                    setContract(newContract);
                    return;
                }
            } catch (error) {
                console.log(error)
            }
            setContract(false);
        })();
    }, [web3, isAuthenticated])

    return [constract, setContract];
}

export default UseNftMarketplaceContractErc20