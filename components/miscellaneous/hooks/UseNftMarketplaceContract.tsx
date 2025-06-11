import { ethers } from 'ethers';
import React from 'react'
import { NFT_MARKET_PLACE_ABI, NFT_MARKET_PLACE_ADDRESS } from 'utils';
import { Metamask, MetamaskContextResponse } from 'context';

function UseNftMarketplaceContract() {
    const [constract, setContract] = React.useState<any>(false);
    const { isAuthenticated, web3 }: MetamaskContextResponse = Metamask.useContext();

    React.useEffect(() => {
        (async () => {
            try {
                if (isAuthenticated && web3.library && Object.keys(web3.library).length) {
                    const signer = web3.library.getSigner();
                    const newContract = new ethers.Contract(NFT_MARKET_PLACE_ADDRESS, NFT_MARKET_PLACE_ABI, signer);
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

export default UseNftMarketplaceContract