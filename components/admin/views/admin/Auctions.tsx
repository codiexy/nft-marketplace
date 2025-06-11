import { useState, useEffect, ChangeEvent, Fragment } from 'react'
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
import ChevronUp from 'mdi-material-ui/ChevronUp'
import ChevronDown from 'mdi-material-ui/ChevronDown'
import { getAllItems, getNftAuctions, transferNftItemByAdmin } from 'services'
import { Button, capitalize, Chip, CircularProgress, Grid, TablePagination, Tooltip } from '@mui/material'
import { formatSolidityError, getTransactionOptions, IsJsonString, trimString } from 'helpers'
import Link from 'next/link'
import Countdown from 'react-countdown'
import { Metamask, MetamaskContextResponse } from 'context';
import { UserWalletAddress } from '@types';
import { CustomModal, ModalContent, ModalFooter, ModalHeader } from 'components/miscellaneous/modal'
import { AiOutlineCheck } from 'react-icons/ai'
import { useNftMarketplaceContract } from 'components/miscellaneous/hooks'
import moment from 'moment'
import { EthIcon, DollarIcon } from 'components/miscellaneous/web3'
import { followStepError } from 'helpers/web3'
import { useRouter } from 'next/router'
import { getWatchedAdPrice } from 'services/campaigns'

const defaultStateOptions = {
    isLoader: false,
    isComplete: false,
    isError: false,
    errorMessage: "",
    callback: ""
}

const defaultCancelStates = {
    transferItemToHigherBidder: {
        ...defaultStateOptions,
        callback: "transferItemToHigherBidder"
    },
    onOwnServer: {
        ...defaultStateOptions,
        callback: "transferInApi"
    }
}

type DefaultCancelProps = typeof defaultCancelStates;

const GetAllAuctions = () => {
    const [open, setOpen] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false);
    const [auctionNfts, setAuctionNfts] = useState<any>([])
    const [page, setPage] = useState<number>(0)
    const [rowsPerPage, setRowsPerPage] = useState<number>(10)
    const [toggleAuction, setToggleAuction] = useState<any>(false)
    const [currentNft, setCurrentNft] = useState<any>(false);
    const [openModal, setOpenModal] = useState<Boolean>(false)
    const [states, setStates]: [any, Function] = useState<DefaultCancelProps>(defaultCancelStates);
    const { user, isAuthenticated, login, web3, loginUserSigner }: MetamaskContextResponse = Metamask.useContext();
    const [transaction, setTransaction] = useState<any>({});
    const [updated, setUpdated] = useState<Boolean>(false);
    const [markteplaceContract] = useNftMarketplaceContract();
    const router = useRouter();

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const allAuction: any = await getAllItems({
                limit: 10,
                sort: { "createdAt": -1 },
                auction: true,
                from: "admin"
            });
            setAuctionNfts(allAuction);
            setIsLoading(false);
        })();
    }, [])

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    }

    const setToggleAuctionData = async (nftId: string) => {
        const currentToggleAuction = await getNftAuctions(nftId, {
            current: true,
            response: "single",
            history: true
        })
        setToggleAuction(currentToggleAuction);
        return currentToggleAuction;
    }

    const handleToggleAuction = async (id: any) => {
        setIsLoading(true);
        if (open !== id) {
            await setToggleAuctionData(id);
        }
        setOpen(open === id ? "" : id);
        setIsLoading(false)
    }

    const setFollowStepError = (slug: string, message: string) => {
        const newState: any = followStepError(slug, message, states);
        setStates({ ...newState });
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
                }
                catch (error: any) {
                    let errorData = formatSolidityError(error.message);
                    if (!errorData.slug) {
                        errorData.slug = "transferItemToHigherBidder";
                    }
                    setFollowStepError(errorData.slug, errorData.message)

                }
            });
        } catch (error: any) {
            let errorData = formatSolidityError(error.message);
            if (!errorData.slug) {
                errorData.slug = "transferItemToHigherBidder";
            }
            setFollowStepError(errorData.slug, errorData.message)
        }
    }

    const transferHandle = async (nft: any) => {
        try {
            if (!isAuthenticated) {
                await login();
                return;
            }
            setOpenModal(true);
            setCurrentNft(nft);
            const auctionData: any = await setToggleAuctionData(nft.id);
            await transferItemToHigherBidder(nft, auctionData);
        }
        catch (error: any) {
            let errorData = formatSolidityError(error.message);
            if (!errorData.slug) {
                errorData.slug = "transferItemToHigherBidder";
            }
            setFollowStepError(errorData.slug, errorData.message)
        }
    }

    const transferItemToHigherBidder = async (nft: any = {}, auctionData: any = {}) => {

        nft = Object.keys(nft).length ? nft : currentNft;
        auctionData = Object.keys(auctionData).length ? auctionData : toggleAuction;
        try {
            if (!isAuthenticated) {
                await login();
                return;
            }
            setStates({
                ...{
                    transferItemToHigherBidder: {
                        isLoader: true,
                        isComplete: false,
                        isError: false,
                        errorMessage: "",
                        callback: "transferItemToHigherBidder"
                    },
                    onOwnServer: {
                        isLoader: false,
                        isComplete: false,
                        isError: false,
                        errorMessage: "",
                        callback: "transferInApi"
                    }
                }
            });

            if (!Object.keys(nft).length) throw new Error("Invalid nft data!");
            if (!auctionData) throw new Error("Invalid auction data!");

            const options: any = {
                from: user.address
            }
            const transactionOptions = await getTransactionOptions(web3.library);
            if (transactionOptions) {
                options.gasPrice = transactionOptions.gasPrice;
                options.nonce = transactionOptions.nonce;
            }
            const adsAmount: any = await getNftAdPrice(nft.id);
            const marketPlaceTransaction = await markteplaceContract.transferAuctionItem(
                // parseInt(nft.itemId),
                parseInt(auctionData.auctionId),
                adsAmount,
                options
            );

            const tx = await marketPlaceTransaction.wait();
            if (tx) {
                setTransaction({ ...tx });
                await transferInApi(tx, nft, auctionData);
            } else {
                const message = "Something went wrong during item transfer to higher bidder!"
                throw new Error(JSON.stringify({ slug: "transferItemToHigherBidder", message }));
            }
        } catch (error: any) {
            let errorData = formatSolidityError(error.message);
            if (!errorData.slug) {
                errorData.slug = "transferItemToHigherBidder";
            }
            throw new Error(JSON.stringify(errorData));
        }
    }

    const transferInApi = async (tx: any = {}, nft: any = {}, auctionData: any = {}) => {
        try {
            if (!isAuthenticated) {
                await login();
                return;
            }
            setStates({
                ...{
                    transferItemToHigherBidder: {
                        isLoader: false,
                        isComplete: true,
                        isError: false,
                        errorMessage: "",
                        callback: "transferItemToHigherBidder"
                    },
                    onOwnServer: {
                        isLoader: true,
                        isComplete: false,
                        isError: false,
                        errorMessage: "",
                        callback: "transferInApi"
                    }
                }
            });
            tx = Object.keys(tx).length ? tx : transaction;
            nft = Object.keys(nft).length ? nft : currentNft;
            auctionData = Object.keys(auctionData).length ? auctionData : toggleAuction;
            const userSign = await loginUserSigner()
            if (!userSign.status) {
                throw new Error(JSON.stringify({ slug: "onOwnServer", message: userSign.message }));
            }
            const result = await transferNftItemByAdmin(nft.id, auctionData.id, { transaction: tx });
            if (result.status === "success") {
                setUpdated(!updated);
                setStates({
                    ...{
                        transferItemToHigherBidder: {
                            isLoader: false,
                            isComplete: true,
                            isError: false,
                            errorMessage: "",
                            callback: "transferItemToHigherBidder"
                        },
                        onOwnServer: {
                            isLoader: false,
                            isComplete: true,
                            isError: false,
                            errorMessage: "",
                            callback: "transferInApi"
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
                errorData.slug = "onOwnServer";
            }
            throw new Error(JSON.stringify(errorData));
        }
    }

    const handleRefresh = () => {
        setUpdated(!updated);
        setOpenModal(false);
        router.push("admin/auctions");
    }

    const getNftAdPrice = async (id: string, currency = "cent") => {
        const data: any = await getWatchedAdPrice(id);
        return data ? data[currency] : 0;
    }

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
                            <TableCell>Higher Bid</TableCell>
                            <TableCell>Is Completed</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            auctionNfts.length ? (
                                <>
                                    {auctionNfts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((nft: any, key: any) => {
                                        const marketplace = nft.marketplace;
                                        const higerBidPrice = marketplace.data.maxBid;
                                        const isCompleted = moment().isAfter(marketplace.data.endDate);
                                        return (
                                            <Fragment key={key}>
                                                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                                                    <TableCell>
                                                        <IconButton
                                                            aria-label='expand row'
                                                            size='small'
                                                            onClick={() => handleToggleAuction(nft.id)}
                                                        >
                                                            {open === nft.id ? <span ><ChevronUp /></span> : <ChevronDown />}
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell>#{nft.tokenId}</TableCell>
                                                    <TableCell>{nft.title}</TableCell>
                                                    <Tooltip title={nft.description}>
                                                        <TableCell>
                                                            {trimString(nft.description)}
                                                        </TableCell>
                                                    </Tooltip>
                                                    <Tooltip title={nft.collection.name}>
                                                        <TableCell>
                                                            <Link href={`/collections/${nft.collection.id}`} passHref legacyBehavior>
                                                                {trimString(nft.collection.name)}
                                                            </Link>
                                                        </TableCell>
                                                    </Tooltip>
                                                    <TableCell>{nft.category.name}</TableCell>
                                                    <TableCell>{nft.genre.name}</TableCell>
                                                    <TableCell>
                                                        <Link href={`/creators/${nft.ownedBy.id}`} passHref legacyBehavior>
                                                            <span>@{nft.ownedBy.username}</span>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link href={`/creators/${nft.createdBy.id}`} passHref legacyBehavior>
                                                            <span>@{nft.createdBy.username}</span>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography component='span' sx={{ mr: 2 }}><DollarIcon />{higerBidPrice?.dollar}</Typography>
                                                        <Typography component='span'><EthIcon />{higerBidPrice?.eth}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            isCompleted
                                                                ? <Chip label="Yes" color="success" size="small" />
                                                                : <Chip label="No" color="error" size="small" />
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={<Countdown date={marketplace?.data.endDate} />} color="info" size="small" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label="Transfer To Higher Bid" color="success" size="small" onClick={() => transferHandle(nft)} />
                                                        {/* {
                                                            isCompleted
                                                                ? (
                                                                    nft.onMarketPlace
                                                                        ? <Chip label="Transfer To Higher Bid" color="success" size="small" onClick={() => transferHandle(nft)} />
                                                                        : <Chip label="Completed" color="success" size="small" />
                                                                )
                                                                : <Chip label="In Progress" color="warning" size="small" />
                                                        } */}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={13}>
                                                        <Collapse in={open === nft.id} timeout='auto' unmountOnExit>
                                                            <Box sx={{ margin: 1 }}>
                                                                <Typography variant='h6' gutterBottom component='div'>
                                                                    Auctions Details
                                                                </Typography>
                                                                <Table size='small' aria-label='purchases'>
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell>Offerer</TableCell>
                                                                            <TableCell>Initial Bid</TableCell>
                                                                            <TableCell>Min Bid</TableCell>
                                                                            <TableCell>Max Bid</TableCell>
                                                                            <TableCell>Status</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {
                                                                            toggleAuction.histories?.length ? (
                                                                                <>
                                                                                    {
                                                                                        toggleAuction.histories.map((history: any, key: any) => {
                                                                                            return (
                                                                                                <TableRow key={key}>
                                                                                                    <TableCell>
                                                                                                        <Link href={`/creators/${history.bidder.id}`} passHref>
                                                                                                            <span style={{
                                                                                                                color: "#8d66f7"
                                                                                                            }}>@{history.bidder?.username}</span>
                                                                                                        </Link>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                        <Typography component='span' sx={{ mr: 2 }}><DollarIcon />{history.initialBidPrice?.dollar}</Typography>
                                                                                                        <Typography component='span'><EthIcon />{history.initialBidPrice?.eth}</Typography>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                        <Typography component='span' sx={{ mr: 2 }}><DollarIcon />{history.minBidPrice?.dollar}</Typography>
                                                                                                        <Typography component='span'><EthIcon />{history.minBidPrice?.eth}</Typography>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                        <Typography component='span' sx={{ mr: 2 }}><DollarIcon />{history.maxBidPrice?.dollar}</Typography>
                                                                                                        <Typography component='span'><EthIcon />{history.maxBidPrice?.eth}</Typography>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                        <Chip label={capitalize(history.status || "NA")} color="warning" size="small" />
                                                                                                    </TableCell>
                                                                                                </TableRow>
                                                                                            )
                                                                                        })
                                                                                    }
                                                                                </>
                                                                            ) : (
                                                                                <TableRow hover tabIndex={-1}>
                                                                                    <TableCell colSpan={5} sx={{ textAlign: "center" }}><Typography variant="body2">No Auction Found</Typography></TableCell>
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
                                        )
                                    })}
                                </>
                            ) : (
                                <TableRow hover tabIndex={-1}>
                                    <TableCell colSpan={13} sx={{ textAlign: "center" }}><Typography variant="body2">No Data Found</Typography></TableCell>
                                </TableRow>
                            )
                        }

                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component='div'
                    count={auctionNfts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
            <CustomModal
                aria-labelledby="collection-dialog"
                open={openModal}
                onClose={(_: any, reason: any) => {
                    if (reason !== "backdropClick") {
                        setOpenModal(false);
                    }
                }}
                className="nft-card-buy-section"
            >
                <ModalHeader>
                    <span className="font-bold">Follow steps</span>
                </ModalHeader>
                <ModalContent className='popup_form_title'>
                    <Box
                        component="div"
                        sx={{
                            pb: 2,
                            mx: 'auto'
                        }}>
                        <Grid container wrap="nowrap" spacing={2}>
                            <Grid item>
                                {
                                    states.transferItemToHigherBidder.isLoader
                                        ? <CircularProgress size={30} color="secondary" />
                                        : (states.transferItemToHigherBidder.isComplete ? <AiOutlineCheck color='green' size={30} /> : <AiOutlineCheck className='dark:text-[#fff]' size={30} />)
                                }
                            </Grid>
                            <Grid item xs>
                                <h1 className="font-bold text-[#000] dark:text-[#fff]">Transfer Item</h1>
                                <Typography>Transfer nft item from Sale</Typography>
                            </Grid>
                        </Grid>
                        {states.transferItemToHigherBidder.isError
                            && <Grid item>
                                <p style={{ color: "red", marginLeft: '8%' }}>{states.transferItemToHigherBidder.errorMessage}</p>
                            </Grid>
                        }
                        <Grid container wrap="nowrap" spacing={2} sx={{
                            'mt': 1
                        }}>
                            <Grid item>
                                {
                                    states.onOwnServer.isLoader
                                        ? <CircularProgress size={30} color="secondary" />
                                        : (states.onOwnServer.isComplete ? <AiOutlineCheck color='green' size={30} /> : <AiOutlineCheck className='dark:text-[#fff]' size={30} />)
                                }
                            </Grid>
                            <Grid item xs>
                                <h1 className="font-bold text-[#000] dark:text-[#fff]">Sign Message</h1>
                                <Typography>Sign message with nft item preferences</Typography>
                            </Grid>
                        </Grid>
                        {states.onOwnServer.isError
                            && <Grid item>
                                <p style={{ color: "red", marginLeft: '8%' }}>{states.onOwnServer.errorMessage}</p>
                            </Grid>
                        }
                    </Box>
                </ModalContent>
                {
                    states.onOwnServer.isComplete || states.transferItemToHigherBidder.isError || states.onOwnServer.isError ? (
                        <ModalFooter className="steps_popup_button">
                            {
                                states.onOwnServer.isComplete
                                    ? <Link href={window.location.pathname} passHref legacyBehavior>
                                        <Button autoFocus variant="outlined" onClick={handleRefresh}>Refresh Page</Button>
                                    </Link>
                                    : (
                                        states.transferItemToHigherBidder.isError || states.onOwnServer.isError
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

export default GetAllAuctions