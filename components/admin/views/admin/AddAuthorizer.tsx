import React, { useState } from 'react'
import {
    Grid, Tooltip, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, IconButton, styled, Stack, CircularProgress, Typography, FormControl
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import Box from '@mui/material/Box'
import { CustomModal, ModalContent, ModalFooter, ModalHeader } from 'components/miscellaneous/modal';
import { useNftMarketplaceContract } from 'components/miscellaneous/hooks'
import { Metamask } from 'context';
import { followStepError, formatSolidityError, getTransactionOptions } from 'helpers';
import { AiOutlineCheck } from 'react-icons/ai';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getUsers, setAuthorizers } from 'services';
import CreatableSelect from 'react-select/creatable';

const defaultStateOptions = {
    isLoader: false,
    isComplete: false,
    isError: false,
    errorMessage: "",
    callback: "",
    title: "",
    description: ""
}

const defaultState = {
    setAuthorizer: {
        ...defaultStateOptions,
        callback: "setAuthorizerAdmin",
        title: "Cancel Set Authrozer",
        description: "Cancel User from Set Authrozer"
    },
    onOwnServer: {
        ...defaultStateOptions,
        callback: "setAuthorizerApi",
        title: "Sign message",
        description: "Sign message with User preferences"
    }
}
type DefaultCancelProps = typeof defaultState;


const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export interface DialogTitleProps {
    id: string;
    children?: React.ReactNode;
    onClose: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
    const { children, onClose, ...other } = props;

    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );
}

export default function AddAuthorizers({ useUpdated, sx = {} }: any) {
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState([])
    const [updated, setUpdated] = useUpdated();
    const [openModal, setOpenModal] = useState<Boolean>(false)
    const [states, setStates]: [any, Function] = useState<DefaultCancelProps>(defaultState);
    const { isAuthenticated, login, user, loginUserSigner } = Metamask.useContext();
    const [markteplaceContract] = useNftMarketplaceContract();
    const [cancelTransaction, setCancelTransaction] = useState<any>({});
    const [currentValues, setCurrentValues] = useState([]);

    const handleClickOpen = () => {
        setOpen(true);
        setCurrentValues([]);
        setOpenModal(false);
        setStates(defaultState)
    };

    React.useEffect(() => {
        (async () => {
            const newUsers = await getUsers({
                from: "admin"
            });
            setUsers(newUsers.map((user: any) => ({
                value: user.id,
                label: user.name,
                address: user.address
            })));
        })();
    }, [])

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (value: any) => {
        setCurrentValues(value);
    }

    const setFollowStepError = (slug: string, message: string) => {
        const newStates = followStepError(slug, message, states);
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
                    const errorData = formatSolidityError(error.message);
                    if (!errorData?.slug) {
                        errorData.slug = "setAuthorizer";
                    }
                    setFollowStepError(errorData.slug, errorData.message);
                }
            });
        } catch (error: any) {
            const errorData = formatSolidityError(error.message);
            if (!errorData?.slug) {
                errorData.slug = "setAuthorizer";
            }
            setFollowStepError(errorData.slug, errorData.message);
        }
    }

    const setAuthorizerAdmin = async () => {
        try {
            if (!isAuthenticated) {
                await login();
                return;
            }
            setStates({
                ...{
                    setAuthorizer: {
                        isLoader: true,
                        isComplete: false,
                        isError: false,
                        errorMessage: "",
                        callback: "setAuthorizerAdmin"
                    },
                    onOwnServer: {
                        isLoader: false,
                        isComplete: false,
                        isError: false,
                        errorMessage: "",
                        callback: "setAuthorizerApi"
                    }
                }
            });
            const options: any = {
                from: user.address
            }
            const transactionOptions = await getTransactionOptions();
            if (transactionOptions) {
                options.gasPrice = transactionOptions.gasPrice;
                options.nonce = transactionOptions.nonce;
            }
            const addresses = currentValues.map((user: any) => user.address).filter(user => user.trim());
            if (!addresses.length) throw new Error(JSON.stringify({ slug: "setAuthorizer", message: "Atleast one wallet address required!" }));

            let marketPlaceTransaction = await markteplaceContract.addAuthorizerOrOwner(
                addresses,
                "authorizer"
            );
            const cancelTx = await marketPlaceTransaction.wait();
            if (cancelTx) {
                setCancelTransaction({
                    ...cancelTx
                });
                await setAuthorizerApi(cancelTx);
                setUpdated(!updated)
            } else {
                const message = "Something went wrong during item remove from sale!"
                throw new Error(JSON.stringify({ slug: "setAuthorizer", message }));
            }
        } catch (error: any) {
            let errorData = formatSolidityError(error.message);
            if (!errorData?.slug) {
                errorData.slug = "setAuthorizer";
            }
            throw new Error(JSON.stringify(errorData));
        }
    }

    const setAuthorizerApi = async (tx: any = {}) => {
        try {
            if (!isAuthenticated) {
                await login();
                return;
            }
            setStates({
                ...{
                    setAuthorizer: {
                        isLoader: false,
                        isComplete: true,
                        isError: false,
                        errorMessage: "",
                        callback: "setAuthorizerAdmin"
                    },
                    onOwnServer: {
                        isLoader: true,
                        isComplete: false,
                        isError: false,
                        errorMessage: "",
                        callback: "setAuthorizerApi"
                    }
                }
            });
            tx = Object.keys(tx).length ? tx : cancelTransaction;
            const addresses = currentValues.map((user: any) => user.address).filter(user => user.trim());
            if (!addresses.length) throw new Error(JSON.stringify({ slug: "onOwnServer", message: "Atleast one wallet address required!" }));
            const userSign = await loginUserSigner("Sign in for the set authorizers!");
            if (!userSign.status) {
                throw new Error(JSON.stringify({ slug: "onOwnServer", message: userSign.message }));
            }
            const result = await setAuthorizers({ addresses });
            if (result.status === "success") {
                setStates({
                    ...{
                        setAuthorizer: {
                            isLoader: false,
                            isComplete: true,
                            isError: false,
                            errorMessage: "",
                            callback: "setAuthorizerAdmin"
                        },
                        onOwnServer: {
                            isLoader: false,
                            isComplete: true,
                            isError: false,
                            errorMessage: "",
                            callback: "setAuthorizerApi"
                        }
                    }
                });
            } else {
                const message = "something went wrong"
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

    const handleSubmit = async () => {
        try {
            if (!isAuthenticated) {
                await login();
                return;
            }
            setOpenModal(true);
            await setAuthorizerAdmin();
            setUpdated(!updated)
        } catch (error: any) {
            const errorData = formatSolidityError(error.message);
            if (!errorData?.slug) {
                errorData.slug = "setAuthorizer";
            }
            setFollowStepError(errorData.slug, errorData.message);
        }
        return false;
    }

    const handleHide = () => {
        setUpdated(!updated);
        setOpenModal(false);
        setCurrentValues([]);
        setOpen(false);
    }

    const customStyles = {
        option: (provided: any, state: any) => ({
            ...provided,
            // borderBottom: '1px solid rgb(229, 232, 235)',
            color: state.isSelected ? '#fff' : '',
            backgroundColor: state.isSelected ? '#571a81' : '',
            // color: state.isSelected ? '#fff' : '#fff',
            // backgroundColor: state.isSelected ? '#571a81' : '#000',


            //dark  color: state.isSelected ? '#fff' : '#fff',
            //dark  borderBottom: '1px solid #000',
            //dark   backgroundColor: state.isSelected ? '#571a81' : '#000',

            // background: "#023950",
            "&:hover": {
                backgroundColor: state.isFocused ? "#571a81" : "#571a81",
                color: state.isFocused ? "#fff" : "#571a81",
            }


        }),
        control: (provided: any) => ({
            ...provided,
            padding: "0%",
        })
    }


    return (
        <div>
            <Tooltip title='Add user for Authorizer'>
                <Button
                    variant="outlined"
                    startIcon={<PersonAddAltIcon />}
                    onClick={() => handleClickOpen()}
                    size="small"
                    sx={sx}
                >
                    Add Authorizer
                </Button>
            </Tooltip>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
                fullWidth={true}
                maxWidth={"sm"}
                sx={{
                    minHeight: "500px"
                }}
            >
                <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
                    Add Authorizers
                </BootstrapDialogTitle>
                <DialogContent
                    sx={{
                        height: "200px",
                        py: 10
                    }}
                    dividers>
                    <Stack spacing={3}>
                        <FormControl
                            className="w-full"
                        >
                            <label className="block text-[#363434] text-md mb-2" htmlFor="authorizers">
                                Users
                            </label>
                            <CreatableSelect className="collection_select block mb-5 appearance-none w-full  py-1 rounded leading-tight text-[#7d7d7d] text-sm"
                                isClearable
                                isMulti
                                onChange={handleChange}
                                options={users}
                                value={currentValues}
                                styles={customStyles}
                                id="authorizers-select"
                                instanceId="authorizers-select"
                                theme={(theme) => ({
                                    ...theme,
                                    borderRadius: 0,
                                    colors: {
                                        ...theme.colors,
                                        primary: '#571a81',
                                    },
                                })}
                                placeholder="Select "
                                name="authorizers"
                            />
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Grid item xs={12} sx={{
                        my: 1
                    }}>
                        <Button
                            variant="outlined"
                            onClick={handleSubmit}
                        >
                            Submit
                        </Button>
                    </Grid>
                </DialogActions>
            </BootstrapDialog>

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
                                    states.setAuthorizer?.isLoader
                                        ? <CircularProgress size={30} color="secondary" />
                                        : <AiOutlineCheck color={states.setAuthorizer.isComplete ? "green" : "secondary"} size={30} />
                                }
                            </Grid>
                            <Grid item xs>
                                <h1 className="font-bold text-[#000] ">Set Authorizer</h1>
                                <Typography>Set Authorizer from users</Typography>
                            </Grid>
                        </Grid>
                        {states.setAuthorizer.isError
                            && <Grid item>
                                <p style={{ color: "red", marginLeft: '8%' }}>{states.setAuthorizer.errorMessage}</p>
                            </Grid>
                        }
                        <Grid container wrap="nowrap" spacing={2} sx={{
                            'mt': 1
                        }}>
                            <Grid item>
                                {
                                    states.onOwnServer.isLoader
                                        ? <CircularProgress size={30} color="secondary" />
                                        : <AiOutlineCheck color={states.onOwnServer.isComplete ? "green" : "secondary"} size={30} />
                                }
                            </Grid>
                            <Grid item xs>
                                <h1 className="font-bold text-[#000]">Sign Message</h1>
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
                    states.onOwnServer.isComplete || states.setAuthorizer.isError || states.onOwnServer.isError ? (
                        <ModalFooter className="steps_popup_button">
                            {
                                states.onOwnServer.isComplete
                                    ? <Button autoFocus variant="outlined" onClick={handleHide}>Hide</Button>
                                    : (
                                        states.setAuthorizer.isError || states.onOwnServer.isError
                                            ? <Button autoFocus variant="outlined" sx={{ marginRight: '37%' }} onClick={tryAgainModal}>Try again</Button>
                                            : ""
                                    )
                            }
                        </ModalFooter>
                    ) : ""
                }
            </CustomModal>
        </div>
    );
}
