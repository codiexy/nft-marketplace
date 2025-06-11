import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import { CustomModal, ModalContent, ModalFooter, ModalHeader } from 'components/miscellaneous/modal';
import { Metamask, MetamaskContextResponse } from 'context';
import { ethers } from 'ethers';
import { followStepError, formatSolidityError, getNftMarketContract, getTransactionOptions } from 'helpers';
import React, { FC, useState } from 'react'
import { AiOutlineCheck } from 'react-icons/ai';
import { buyNft } from 'services';
import { getWatchedAdPrice } from 'services/campaigns';

interface BuyProps {
    nft: any;
    useUpdate: Function;
}

const defaultBuyStates = {
    buy: {
        isLoader: false,
        isComplete: false,
        isError: false,
        errorMessage: "",
        callback: "buyNftItem"
    },
    onOwnServer: {
        isLoader: false,
        isComplete: false,
        isError: false,
        errorMessage: "",
        callback: "buyNftItemAPI"
    }
}

const Buy: FC<BuyProps> = ({ nft, useUpdate }) => {
    
    const [updated, setUpdated] = useUpdate();
    const [open, setOpen] = useState(false);
    const [buyState, setBuyStates] = useState<any>(defaultBuyStates);
    const [transaction, setTransaction] = useState<any>({});

    const { login, isAuthenticated, user, loginUserSigner, web3 }: MetamaskContextResponse = Metamask.useContext();
    const { id, itemId, marketplace }: any = nft;

    const handleBuyNFT = async (event: any) => {
        event.preventDefault();
        try {
            if (!isAuthenticated) {
                await login();
                return;
            }
            setOpen(true);
            await buyNftItem();
        } catch (error: any) {
            let errorData = formatSolidityError(error.message);
            if (!errorData?.slug) {
                errorData.slug = "buy";
            }
            setFollowStepError(errorData.slug, errorData.message);
        }
        return false;
    }

    const buyNftItem = async () => {
        try {
            if (!isAuthenticated) {
                await login();
                return;
            }
            setBuyStates({
                ...{
                    buy: {
                        isLoader: true,
                        isComplete: false,
                        isError: false,
                        errorMessage: "",
                        callback: "buyNftItem"
                    },
                    onOwnServer: {
                        isLoader: false,
                        isComplete: false,
                        isError: false,
                        errorMessage: "",
                        callback: "buyNftItemAPI"
                    }
                }
            });
            const price = ethers.utils.parseUnits(parseFloat(nft.price.eth).toString(), "ether");
            const nftMarketPlaceContract: any = await getNftMarketContract();
            const options: any = {
                value: price,
                from: user.address
            }
            const adsAmount:any = await getNftAdPrice(id);
            const txOptions = await getTransactionOptions(web3.library);
            if (txOptions) {
                options.gasPrice = txOptions.gasPrice;
                options.nonce = txOptions.nonce;
            }
            const marketPlaceTransaction = await nftMarketPlaceContract.buyItem(
                parseInt(itemId),
                adsAmount,
                options
            );
            const buyTx = await marketPlaceTransaction.wait();
            if (buyTx) {
                setTransaction(buyTx)
                await buyNftItemAPI(buyTx);
            } else {
                const message = "Something went wrong during buying!"
                throw new Error(JSON.stringify({ slug: "buy", message }));
            }
        } catch (error: any) {
            let errorData = formatSolidityError(error.message);
            if (!errorData?.slug) {
                errorData.slug = "buy";
            }
            throw new Error(JSON.stringify(errorData));
        }
    }

    const buyNftItemAPI = async (tx: any = {}) => {
        tx = Object.keys(tx).length ? tx : transaction;
        try {
            if (!isAuthenticated) {
                await login();
                return;
            }
            setBuyStates({
                buy: {
                    isLoader: false,
                    isComplete: true,
                    isError: false,
                    errorMessage: "",
                    callback: "buyNftItem"
                },
                onOwnServer: {
                    isLoader: true,
                    isComplete: false,
                    isError: false,
                    errorMessage: "",
                    callback: "buyNftItemAPI"
                }
            });
            const userSign = await loginUserSigner();
            if (!userSign.status) {
                throw new Error(JSON.stringify({ slug: "onOwnServer", message: userSign.message }));
            }
            const result = await buyNft(id, {
                transaction: tx,
                userSign: userSign.sign
            });
            if (result.status === "success") {
                setBuyStates({
                    buy: {
                        isLoader: false,
                        isComplete: true,
                        isError: false,
                        errorMessage: "",
                        callback: "buyNftItem"
                    },
                    onOwnServer: {
                        isLoader: false,
                        isComplete: true,
                        isError: false,
                        errorMessage: "",
                        callback: "buyNftItemAPI"
                    }
                });
                setUpdated(!updated);
            } else {
                const message = result.message || "something went wrong"
                throw new Error(JSON.stringify({ slug: "onOwnServer", message }));
            }
        } catch (error: any) {
            let errorData = formatSolidityError(error.message);
            if (!errorData?.slug) {
                errorData.slug = "onOwnServer";
            }
            throw new Error(JSON.stringify(errorData));
        }

    }

    const tryAgainModal = async () => {
        try {
            const newBuyState: any = buyState;
            Object.keys(newBuyState).forEach(async (element) => {
                try {
                    const modalAsset = newBuyState[element];
                    if (modalAsset.isError) {
                        if (eval(`typeof ${modalAsset.callback}`) === "function") {
                            await eval(`${modalAsset.callback}()`);
                        }
                    }
                } catch (error: any) {
                    let errorData = formatSolidityError(error.message);
                    if (!errorData?.slug) {
                        errorData.slug = "buy";
                    }
                    setFollowStepError(errorData.slug, errorData.message);
                }
            });
        } catch (error: any) {
            let errorData = formatSolidityError(error.message);
            if (!errorData?.slug) {
                errorData.slug = "buy";
            }
            setFollowStepError(errorData.slug, errorData.message);
        }
    }

    const setFollowStepError = (slug: string, message: string) => {
        const newBuyState = followStepError(slug, message, buyState);
        setBuyStates({ ...newBuyState });
    }

    const getNftAdPrice = async (id: string, currency = "cent") => {
        const data: any = await getWatchedAdPrice(id);
        return data ? data[currency] : 0;
    }

    return (
        <>
            <button
                className="px-4 py-2 font-semibold block text-sm bg-[#571a81] text-white shadow-sm w-full rounded"
                onClick={handleBuyNFT}
                type="button"
                data-id={`nft-card-buy-btn`}
            >Buy Now</button>
            <CustomModal
                fullWidth={true}
                maxWidth="sm"
                aria-labelledby="collection-dialog"
                open={open}
                onClose={(_: any, reason: any) => {
                    if (reason !== "backdropClick") {
                        setOpen(false);
                    }
                }}
                className="nft-card-buy-section"
            >
                <ModalHeader>
                    <span className="font-bold">Follow steps</span>
                </ModalHeader>
                <ModalContent>
                    <Box sx={{
                        pb: 2,
                        mx: 'auto',
                    }}>
                        <Grid container wrap="nowrap" spacing={2}>
                            <Grid item>
                                {
                                    buyState.buy.isLoader
                                        ? <CircularProgress size={30} color="secondary" />
                                        : <AiOutlineCheck color={buyState.buy.isComplete ? "green" : "secondary"} size={30} />
                                }
                            </Grid>
                            <Grid item xs>
                                <h1 className="font-bold text-[#000] dark:text-[#fff]">Buy Item</h1>
                                <Typography>Buying nft item</Typography>
                            </Grid>
                        </Grid>
                        {buyState.buy.isError
                            && <Grid item>
                                <p style={{ color: "red", marginLeft: '8%' }}>{buyState.buy.errorMessage}</p>
                            </Grid>
                        }
                        <Grid container wrap="nowrap" spacing={2} sx={{
                            'mt': 1
                        }}>
                            <Grid item>
                                {
                                    buyState.onOwnServer.isLoader
                                        ? <CircularProgress size={30} color="secondary" />
                                        : <AiOutlineCheck color={buyState.onOwnServer.isComplete ? "green" : "secondary"} size={30} />
                                }
                            </Grid>
                            <Grid item xs>
                                <h1 className="font-bold text-[#000] dark:text-[#fff]">Sign Message</h1>
                                <Typography>Sign message with nft item preferences</Typography>
                            </Grid>
                        </Grid>
                        {buyState.onOwnServer.isError
                            && <Grid item>
                                <p style={{ color: "red", marginLeft: '8%' }}>{buyState.onOwnServer.errorMessage}</p>
                            </Grid>
                        }
                    </Box>
                </ModalContent>
                {
                    buyState.onOwnServer.isComplete || buyState.buy.isError || buyState.onOwnServer.isError ? (
                        <ModalFooter className="steps_popup_button">
                            {
                                buyState.onOwnServer.isComplete
                                    ? <Button autoFocus variant="outlined" onClick={() => {
                                        setOpen(false);
                                        setUpdated(true);
                                    }}>Refresh Page</Button>
                                    : (
                                        buyState.buy.isError || buyState.onOwnServer.isError
                                            ? <Button autoFocus variant="outlined" onClick={tryAgainModal}>Try again</Button>
                                            : ""
                                    )
                            }
                        </ModalFooter>
                    ) : ""
                }
            </CustomModal>
        </>
    )
}

export default Buy