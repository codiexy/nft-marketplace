// ** React Imports
import { useState, ChangeEvent, useEffect } from 'react'

// ** MUI Imports
import Link from 'next/link'
import { ToastContainer, toast } from 'material-react-toastify';
import {
  Card, CardHeader, Chip, Typography, TablePagination, TableContainer,
  TableCell, TableBody, TableHead, TableRow, Table, Paper, IconButton, Tooltip, Button, CircularProgress, Grid, Box
} from '@mui/material'
import { TrimAndCopyText } from '../../../miscellaneous';
import { getUsers, removeAuthorizer } from '../../../../services'
import moment from 'moment';
import { AiOutlineCheck, AiOutlineClose, AiOutlinePlusCircle } from 'react-icons/ai';
import { CustomModal, ModalContent, ModalFooter, ModalHeader } from 'components/miscellaneous/modal';
import { followStepError, formatSolidityError, getTransactionOptions } from 'helpers';
removeAuthorizer
import AddAuthorizers from './AddAuthorizer';
import { useNftMarketplaceContract } from 'components/miscellaneous/hooks';
import { Metamask } from 'context';


const defaultState = {
  canceling: {
    isLoader: false,
    isComplete: false,
    isError: false,
    errorMessage: "",
    callback: "removeAuthorizersOnBlockchain"
  },
  onOwnServer: {
    isLoader: false,
    isComplete: false,
    isError: false,
    errorMessage: "",
    callback: "removeAuthorizersApi"
  }
}

const AllAuthorizors = () => {
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState<Boolean>(false)
  const [states, setStates]: [any, Function] = useState<any>(defaultState);
  const { isAuthenticated, login, user, loginUserSigner } = Metamask.useContext();
  const [markteplaceContract] = useNftMarketplaceContract();
  const [cancelTransaction, setCancelTransaction] = useState<any>({});
  const [currentValues, setCurrentValues] = useState<any>({});

  const [isLoading, setIsLoading] = useState(false);
  const [authorizors, setAuthorizors] = useState([])
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const allAuthorisers = await getUsers({
        from: "admin",
        isAuthorizers: true
      });
      setAuthorizors(allAuthorisers);
      setIsLoading(false);
    })();
  }, [updated])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
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
            errorData.slug = "canceling";
          }
          setFollowStepError(errorData.slug, errorData.message);
        }
      });
    } catch (error: any) {
      const errorData = formatSolidityError(error.message);
      if (!errorData?.slug) {
        errorData.slug = "canceling";
      }
      setFollowStepError(errorData.slug, errorData.message);
    }
  }

  const removeAuthorizersOnBlockchain = async (userData: any = {}) => {
    try {
      if (!isAuthenticated) {
        await login();
        return;
      }
      setStates({
        ...{
          canceling: {
            isLoader: true,
            isComplete: false,
            isError: false,
            errorMessage: "",
            callback: "removeAuthorizersOnBlockchain"
          },
          onOwnServer: {
            isLoader: false,
            isComplete: false,
            isError: false,
            errorMessage: "",
            callback: "removeAuthorizersOnBlockchain"
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
      userData = Object.keys(userData).length ? userData : currentValues;
      if (!userData.address) throw new Error(JSON.stringify({ slug: "canceling", message: "Wallet address required!" }));

      let marketPlaceTransaction = await markteplaceContract.deleteAuthorizerOrOwner(
        userData.address,
        "authorizer"
      );
      const cancelTx = await marketPlaceTransaction.wait();
      if (cancelTx) {
        setCancelTransaction({
          ...cancelTx
        });
        await removeAuthorizersApi(cancelTx, userData);
        setUpdated(!updated)
      } else {
        const message = "Something went wrong during item remove authorizer!"
        throw new Error(JSON.stringify({ slug: "canceling", message }));
      }
    } catch (error: any) {
      let errorData = formatSolidityError(error.message);
      if (!errorData?.slug) {
        errorData.slug = "canceling";
      }
      throw new Error(JSON.stringify(errorData));
    }
  }

  const removeAuthorizersApi = async (tx: any = {}, userData: any = {}) => {
    try {
      if (!isAuthenticated) {
        await login();
        return;
      }
      setStates({
        ...{
          canceling: {
            isLoader: false,
            isComplete: true,
            isError: false,
            errorMessage: "",
            callback: "removeAuthorizersOnBlockchain"
          },
          onOwnServer: {
            isLoader: true,
            isComplete: false,
            isError: false,
            errorMessage: "",
            callback: "removeAuthorizersApi"
          }
        }
      });
      tx = Object.keys(tx).length ? tx : cancelTransaction;
      userData = Object.keys(userData).length ? userData : currentValues;
      if (!userData.address) throw new Error(JSON.stringify({ slug: "onOwnServer", message: "Wallet address required!" }));

      const userSign = await loginUserSigner("Sign in for the set authorizers!");
      if (!userSign.status) {
        throw new Error(JSON.stringify({ slug: "onOwnServer", message: userSign.message }));
      }
      const result = await removeAuthorizer({ addresses: [userData.address] });
      if (result.status === "success") {
        setStates({
          ...{
            canceling: {
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
              callback: "removeAuthorizersApi"
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

  const handleRemove = async (event: any, user: any) => {
    try {
      event.preventDefault();
      if (!isAuthenticated) {
        await login();
        return;
      }
      setOpenModal(true);
      setCurrentValues(user);
      await removeAuthorizersOnBlockchain(user);
    } catch (error: any) {
      const errorData = formatSolidityError(error.message);
      if (!errorData?.slug) {
        errorData.slug = "canceling";
      }
      setFollowStepError(errorData.slug, errorData.message);
    }
    return false;
  }

  const handleHide = () => {
    setUpdated(!updated);
    setOpenModal(false);
    setCurrentValues({});
    setOpen(false);
  }

  return <>
    <Card sx={{ position: "relative" }}>
      <CardHeader
        title='All Authorizers'
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <AddAuthorizers useUpdated={() => [updated, setUpdated]} />
        }
      />
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <ToastContainer position="top-right" newestOnTop={false} />

        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label='sticky table'>
            <TableHead>
              <TableRow>
                <TableCell>Name </TableCell>
                <TableCell>Username  </TableCell>
                <TableCell>Address </TableCell>
                <TableCell>Created At  </TableCell>
                <TableCell>Status  </TableCell>
                <TableCell>Action  </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                authorizors.length ? (
                  <>
                    {authorizors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user: any, key: any) => {
                      return (
                        <TableRow hover role='checkbox' tabIndex={-1} key={key}>
                          <TableCell>
                            <Link
                              href={`/creators/${user.id}`}
                              passHref
                              legacyBehavior
                            >
                              <Typography
                                sx={{
                                  cursor: "pointer",
                                  color: "#8d66f7"
                                }}
                              >
                                {user.name}
                              </Typography>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/creators/${user.id}`}
                              passHref
                              legacyBehavior
                            >
                              <Typography
                                sx={{
                                  cursor: "pointer",
                                  color: "#8d66f7"
                                }}
                              >
                                @{user.username}
                              </Typography>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span onClick={(e) => toast.success("Address Coppid")}>
                              <TrimAndCopyText text={user.address} />
                            </span>
                          </TableCell>
                          <TableCell>
                            {moment(user.createdAt).format("Do, MMM YYYY")}
                          </TableCell>
                          <TableCell>{user.status}
                            {
                              user.status ? (
                                <Chip label="Active" color="success" size="small" />
                              ) : (
                                <Chip label="Not-Active" color="error" size="small" />
                              )
                            }
                          </TableCell>
                          <TableCell>
                            <Chip label="Remove" color="error" size="small" onClick={(e) => handleRemove(e, user)} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </>
                ) : (
                  <TableRow hover tabIndex={-1}>
                    <TableCell colSpan={6} sx={{ textAlign: "center" }}><Typography variant="body2">No Data Found</Typography></TableCell>
                  </TableRow>
                )
              }
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component='div'
          count={authorizors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Card>
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
                states.canceling?.isLoader
                  ? <CircularProgress size={30} color="secondary" />
                  : <AiOutlineCheck color={states.canceling.isComplete ? "green" : "secondary"} size={30} />
              }
            </Grid>
            <Grid item xs>
              <h1 className="font-bold text-[#000] dark:text-[#fff]">Remove Authorizer</h1>
              <Typography>Remove Authorizer from users</Typography>
            </Grid>
          </Grid>
          {states.canceling.isError
            && <Grid item>
              <p style={{ color: "red", marginLeft: '8%' }}>{states.canceling.errorMessage}</p>
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
        states.onOwnServer.isComplete || states.canceling.isError || states.onOwnServer.isError ? (
          <ModalFooter className="steps_popup_button">
            {
              states.onOwnServer.isComplete
                ? <Button autoFocus variant="outlined" onClick={handleHide}>Hide</Button>
                : (
                  states.canceling.isError || states.onOwnServer.isError
                    ? <Button autoFocus variant="outlined" sx={{ marginRight: '37%' }} onClick={tryAgainModal}>Try again</Button>
                    : ""
                )
            }
          </ModalFooter>
        ) : ""
      }
    </CustomModal>
  </>;
}

export default AllAuthorizors;
