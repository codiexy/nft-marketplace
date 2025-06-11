import { useState, Fragment, useEffect, ChangeEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import Collapse from '@mui/material/Collapse'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TableContainer from '@mui/material/TableContainer'

// ** Icons Imports
import ChevronUp from 'mdi-material-ui/ChevronUp'
import ChevronDown from 'mdi-material-ui/ChevronDown'
import { getAllItems, offerNft, refundToOffererByAdmin } from 'services'
import { Button, capitalize, Chip, CircularProgress, Grid, TablePagination, Tooltip } from '@mui/material'
import { getTransactionOptions, IsJsonString, trimString } from 'helpers'
import Link from 'next/link'
import moment from 'moment'
import { Metamask } from 'context'
import { UserWalletAddress } from '@types'
import { useNftMarketplaceContract } from 'components/miscellaneous/hooks'
import { DollarIcon, EthIcon } from 'components/miscellaneous/web3'
import { CustomModal, ModalContent, ModalFooter, ModalHeader } from 'components/miscellaneous/modal'
import { AiOutlineCheck } from 'react-icons/ai'
import { formatSolidityError, followStepError } from 'helpers/web3'
import { useRouter } from 'next/router'



const defaultStateOptions = {
    isLoader: false,
    isComplete: false,
    isError: false,
    errorMessage: "",
    callback: "",
    title: "",
    description: ""
}

const defaultCancelStates = {
    refundOffer: {
        ...defaultStateOptions,
        callback: "refundOfferAmountToOfferer",
        title: "Refund To Offerer",
        description: "Refund the offer amount to offerer"
    },
    onOwnServer: {
        ...defaultStateOptions,
        callback: "refundInApi",
        title: "Sign message",
        description: "Sign message with nft item preferences"
    }
}


type DefaultCancelProps = typeof defaultCancelStates;

const GetAllOffers = () => {
    const [open, setOpen] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false);
    const [offerNfts, setOfferNfts] = useState<any>([])
    const [page, setPage] = useState<number>(0)
    const [rowsPerPage, setRowsPerPage] = useState<number>(10)
    const [offers, setOffers] = useState<any>([])
    const [openModal, setOpenModal] = useState<Boolean>(false)
    const [states, setStates]: [any, Function] = useState<DefaultCancelProps>(defaultCancelStates);
    const { user, isAuthenticated, login, web3, loginUserSigner }: any = Metamask.useContext();
    const [updated, setUpdated] = useState<Boolean>(false);

    const [transaction, setTransaction] = useState<any>({});
    const [currentActionOffer, setCurrentActionOffer] = useState<any>(false);

    const [marketplaceContract] = useNftMarketplaceContract();


    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const allOffer = await getAllItems({
                limit: rowsPerPage,
                sort: { "createdAt": -1 },
                from: "admin",
                offer: true,
            });
            setOfferNfts(allOffer);
            setIsLoading(false);
        })();
    }, [rowsPerPage])

    const handleOffer = async (id: any) => {
        setIsLoading(true);
        if (open !== id) {
            const currentNftOffers = await offerNft(id, {
                current: true
            }, 'get');
            setOffers(currentNftOffers)
        }
        setOpen(open === id ? "" : id);
        setIsLoading(false)
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    }

    const setFollowStepError = (slug: string, message: string) => {
        const newStates: any = followStepError(slug, message, states);
        setStates({ ...newStates });
    }

    const tryAgainModal = async () => {
        try {
            const newStates: any = states;
            Object.keys(newStates).forEach(async (element) => {
                try {
                    const modalAsset = newStates[element];
                    if (modalAsset.isError) {
                        if (eval(`typeof ${modalAsset.callback}`) === "function") {
                            await eval(`${modalAsset.callback}()`);
                        }
                    }
                } catch (error: any) {
                    let errorData = formatSolidityError(error.message);
                    if (!errorData.slug) {
                        errorData.slug = "refundOffer";
                    }
                    setFollowStepError(errorData.slug, errorData.message);
                }
            });
        } catch (error: any) {
            let errorData = formatSolidityError(error.message);
            if (!errorData.slug) {
                errorData.slug = "refundOffer";
            }
            setFollowStepError(errorData.slug, errorData.message);
        }
    }

    const handleRefund = async (offer: any) => {
        try {
            if (!isAuthenticated) {
                await login();
                return;
            }
            setCurrentActionOffer(offer);
            setOpenModal(true);
            await refundOfferAmountToOfferer(offer);
        } catch (error: any) {
            let errorData = formatSolidityError(error.message);
            if (!errorData.slug) {
                errorData.slug = "refundOffer";
            }
            setFollowStepError(errorData.slug, errorData.message);
        }
        return false;

    }

    const refundOfferAmountToOfferer = async (offer: any = {}) => {
        try {
            if (!isAuthenticated) {
                await login();
                return;
            }
            if (!user.isAuthorizer) throw new Error(JSON.stringify({ slug: "refundOffer", message: "You are not authorizer or super admin!" }));
            setStates({
                ...{
                    refundOffer: {
                        isLoader: true,
                        isComplete: false,
                        isError: false,
                        errorMessage: "",
                        callback: "refundOfferAmountToOfferer"
                    },
                    onOwnServer: {
                        isLoader: false,
                        isComplete: false,
                        isError: false,
                        errorMessage: "",
                        callback: "refundInApi"
                    }
                }
            });
            offer = Object.keys(offer).length ? offer : currentActionOffer;
            if (!offer) throw new Error("Invalid offer!");

            const options: any = {
                from: user.address
            }
            const transactionOptions = await getTransactionOptions(web3.library);
            if (transactionOptions) {
                options.gasPrice = transactionOptions.gasPrice;
                options.nonce = transactionOptions.nonce;
            }

            const marketPlaceTransaction: any = await marketplaceContract.refundToOfferer(
                parseInt(offer.nft.itemId),
                parseInt(offer.offerId),
                offer.offerer.address,
                options
            );
            const refundTx = await marketPlaceTransaction.wait();
            if (refundTx) {
                setTransaction({
                    ...refundTx
                });
                await refundInApi(refundTx, offer);
            } else {
                const message = "Something went wrong during item remove from sale!"
                throw new Error(JSON.stringify({ slug: "refundOffer", message }));
            }
        } catch (error: any) {
            let errorData = formatSolidityError(error.message);
            if (!errorData.slug) {
                errorData.slug = "refundOffer";
            }
            throw new Error(JSON.stringify(errorData));
        }
    }

    const refundInApi = async (tx: any = {}, offer: any = {}) => {
        tx = Object.keys(tx).length ? tx : transaction;
        offer = Object.keys(offer).length ? offer : currentActionOffer;
        try {
            if (!isAuthenticated) {
                await login();
                return;
            }
            if (!user.isAuthorizer) throw new Error("You are not authenticated!");
            setStates({
                ...{
                    refundOffer: {
                        isLoader: false,
                        isComplete: true,
                        isError: false,
                        errorMessage: "",
                        callback: "refundOfferAmountToOfferer"
                    },
                    onOwnServer: {
                        isLoader: true,
                        isComplete: false,
                        isError: false,
                        errorMessage: "",
                        callback: "refundInApi"
                    }
                }
            });
            const userSign = await loginUserSigner();
            if (!userSign.status) {
                throw new Error(JSON.stringify({ slug: "refundOffer", message: userSign.message }));
            }
            const result = await refundToOffererByAdmin(offer.nftId, offer.id, { transaction: tx });
            if (result.status === "success") {
                setUpdated(!updated);
                setStates({
                    ...{
                        refundOffer: {
                            isLoader: false,
                            isComplete: true,
                            isError: false,
                            errorMessage: "",
                            callback: "refundOfferAmountToOfferer"
                        },
                        onOwnServer: {
                            isLoader: false,
                            isComplete: true,
                            isError: false,
                            errorMessage: "",
                            callback: "refundInApi"
                        }
                    }
                });
            } else {
                const message = result.message || "something went wrong"
                throw new Error(JSON.stringify({ slug: "onOwnServer", message }));
            }
        } catch (error: any) {
            let errorData = formatSolidityError(error.message);
            if (!errorData.slug) {
                errorData.slug = "refundOffer";
            }
            throw new Error(JSON.stringify(errorData));
        }
    }
    const router = useRouter();
    const handleRefresh = () => {
        setUpdated(!updated)
        setOpenModal(false);
        router.push("admin/offers");
    }

    const isActive = false;

    return (
        <>
            <TableContainer component={Paper}>
                <Table aria-label='collapsible table'>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Token</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Collection</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Genre</TableCell>
                            <TableCell>Owner</TableCell>
                            <TableCell>Creator</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            offerNfts.length ? (
                                <>
                                    {offerNfts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((nft: any, key: any) => {
                                        return <Fragment key={key}>
                                            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                                                <TableCell>
                                                    <IconButton
                                                        aria-label='expand row'
                                                        size='small'
                                                        onClick={() => handleOffer(nft.id)}
                                                    >
                                                        {open === nft.id ? <span ><ChevronUp /></span> : <ChevronDown />}
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell> #{nft.tokenId} </TableCell>
                                                <TableCell>{nft.title}</TableCell>
                                                <TableCell>
                                                    <Tooltip title={nft.description}>
                                                        <span>{trimString(nft.description)}</span>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        color: "#8d66f7"
                                                    }}
                                                >
                                                    <Tooltip title={nft.collection.name}>
                                                        <Link
                                                            href={`/collections/${nft.collection.id}`}
                                                            passHref
                                                            legacyBehavior
                                                        >
                                                            {trimString(nft.collection.name)}
                                                        </Link>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>{nft.category.name}</TableCell>
                                                <TableCell>{nft.genre.name}</TableCell>
                                                <TableCell
                                                    sx={{
                                                        color: "#8d66f7"
                                                    }}
                                                >
                                                    <Link
                                                        href={`/creators/${nft.ownedBy.id}`}
                                                        passHref
                                                        legacyBehavior>
                                                        <span>@{nft.ownedBy.username}</span>
                                                    </Link>
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        color: "#8d66f7"
                                                    }}
                                                >
                                                    <Link
                                                        href={`/creators/${nft.createdBy.id}`}
                                                        passHref
                                                        legacyBehavior>
                                                        <span>@{nft.createdBy.username}</span>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={9} sx={{ py: '0 !important' }}>
                                                    <Collapse in={open === nft.id} timeout='auto' unmountOnExit>
                                                        <Box component="div" sx={{ m: 2 }}>
                                                            <Typography variant='h6' gutterBottom component='div'>
                                                                Offer Details
                                                            </Typography>
                                                            <Table size='small' aria-label='purchases'>
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell>Offerer</TableCell>
                                                                        <TableCell>Price</TableCell>
                                                                        <TableCell>Start Date</TableCell>
                                                                        <TableCell>End Date</TableCell>
                                                                        <TableCell>Expiration</TableCell>
                                                                        <TableCell>Is expired</TableCell>
                                                                        <TableCell>Status</TableCell>
                                                                        <TableCell>Action</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {
                                                                        offers.length ? (
                                                                            offers.map((offer: any, key: any) => {
                                                                                const isExpired = moment().isAfter(offer.expiredOn);
                                                                                return (
                                                                                    <TableRow key={key}>
                                                                                        <TableCell>
                                                                                            <Link href={`/creators/${offer.offerer.id}`} passHref legacyBehavior>
                                                                                                <span>@{offer.offerer.username}</span>
                                                                                            </Link>
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <Typography component='span' sx={{ mr: 2 }}><DollarIcon />{offer.offerPrice?.dollar}</Typography>
                                                                                            <Typography component='span'><EthIcon />{offer.offerPrice?.eth}</Typography>
                                                                                        </TableCell>
                                                                                        <TableCell>{moment(offer.createdAt).format("Do, MMM YYYY")}</TableCell>
                                                                                        <TableCell>{moment(offer.expiredOn).format("Do, MMM YYYY")}</TableCell>
                                                                                        <TableCell>{offer.expiration}</TableCell>
                                                                                        <TableCell>
                                                                                            {
                                                                                                isExpired
                                                                                                    ? <Chip label="Yes" color="success" size="small" />
                                                                                                    : <Chip label="No" color="error" size="small" />
                                                                                            }
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <Chip label={capitalize(offer.status)} color={offer.status === "initiate" ? "warning" : "success"} size="small" />
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            {
                                                                                                isExpired
                                                                                                    ? <Chip
                                                                                                        label="Refund To Offerer"
                                                                                                        color="success"
                                                                                                        size="small"
                                                                                                        onClick={() => handleRefund({
                                                                                                            ...offer,
                                                                                                            nft
                                                                                                        })}
                                                                                                    />
                                                                                                    : <Chip label="Pending..." color="warning" size="small" />
                                                                                            }
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                )
                                                                            })
                                                                        ) : (
                                                                            <TableRow hover tabIndex={-1}>
                                                                                <TableCell colSpan={8} sx={{ textAlign: "center" }}><Typography variant="body2">No Offer Found</Typography></TableCell>
                                                                            </TableRow>
                                                                        )
                                                                    }

                                                                </TableBody>
                                                            </Table>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </Fragment>
                                    })}
                                </>
                            ) : (
                                <TableRow hover tabIndex={-1}>
                                    <TableCell colSpan={9} sx={{ textAlign: "center" }}><Typography variant="body2">No Data Found</Typography></TableCell>
                                </TableRow>
                            )
                        }

                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component='div'
                    count={offerNfts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer >

            <CustomModal
                fullWidth={true}
                maxWidth="md"
                aria-labelledby="collection-dialog"
                open={openModal}
                className={isActive ? "dark_createform_popup" : "createform_popup"}
                onClose={(_: any, reason: any) => {
                    if (reason !== "backdropClick") {
                        setOpenModal(false);
                    }
                }}
            >
                <ModalHeader>
                    <span className="font-bold">Follow steps</span>
                </ModalHeader>
                <ModalContent className="uploadasset_form">
                    <Grid className="pt-2" container spacing={2}>
                        <Grid item xs={2} md={2}>
                            {
                                states.refundOffer.isLoader
                                    ? <CircularProgress size={30} color="secondary" />
                                    : (states.refundOffer.isComplete ? <AiOutlineCheck color='green' size={30} /> : <AiOutlineCheck className='dark:text-[#fff]' size={30} />)
                            }
                        </Grid>
                        <Grid item xs={10} md={10}>
                            <h1 className="font-bold text-[#000] dark:text-[#fff]">Refund To Offerer</h1>
                            <p>Refund the offer amount to offerer</p>
                        </Grid>
                        {states.refundOffer.isError
                            && <Grid item>
                                <p style={{ color: "red", marginLeft: '17%' }}>{states.refundOffer.errorMessage}</p>
                            </Grid>}
                    </Grid>
                    <Grid className="pt-5" container spacing={2}>
                        <Grid item xs={2} md={2}>
                            {
                                states.onOwnServer.isLoader
                                    ? <CircularProgress size={30} color="secondary" />
                                    : (states.onOwnServer.isComplete ? <AiOutlineCheck color='green' size={30} /> : <AiOutlineCheck className='dark:text-[#fff]' size={30} />)
                            }
                        </Grid>
                        <Grid item xs={10} md={10}>
                            <h1 className="font-bold text-[#000] dark:text-[#fff]">Sign message</h1>
                            <p>Sign message with refund preferences</p>
                        </Grid>
                        {states.onOwnServer.isError
                            && <Grid item>
                                <p style={{ color: "red", marginLeft: '17%' }}>{states.onOwnServer.errorMessage}</p>
                            </Grid>}
                    </Grid>
                </ModalContent>
                {
                    states.onOwnServer.isComplete || states.refundOffer.isError || states.onOwnServer.isError ? (
                        <ModalFooter className="steps_popup_button">
                            {
                                states.onOwnServer.isComplete
                                    ? <Link href={window.location.pathname} passHref>
                                        <Button autoFocus variant="outlined" onClick={handleRefresh}>Refresh Page</Button>
                                    </Link>
                                    : (
                                        states.refundOffer.isError || states.onOwnServer.isError
                                            ? <Button autoFocus variant="outlined" onClick={tryAgainModal}>Try again</Button>
                                            : ""
                                    )
                            }
                        </ModalFooter>
                    ) : ""
                }
            </CustomModal>
        </>
    );
}

export default GetAllOffers