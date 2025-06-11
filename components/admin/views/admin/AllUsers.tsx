// ** React Imports
import { useState, ChangeEvent, useEffect } from 'react'

// ** MUI Imports
import Link from 'next/link'
import copy from 'copy-to-clipboard';
import { ToastContainer, toast } from 'material-react-toastify';
import {
  Card, CardHeader, Chip, Tooltip, Typography, TablePagination, TableContainer,
  TableCell, TableBody, TableHead, TableRow, Table, Paper
} from '@mui/material'

import AddLinkIcon from '@mui/icons-material/AddLink';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import { getBaseUrl } from '../../../../helpers/axios';
import { TrimAndCopyText } from '../../../miscellaneous';
import { getTokenData, getUsers } from '../../../../services'
import moment from 'moment';



const AllUsers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([])
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const allUsers = await getUsers({
        from: "admin"
      });
      setUsers(allUsers);
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

  return <>
    <Card sx={{ position: "relative" }}>
      <CardHeader title='All Users' titleTypographyProps={{ variant: 'h6' }} />
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <ToastContainer position="top-right" newestOnTop={false} />

        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label='sticky table'>
            <TableHead>
              <TableRow>
                <TableCell>Name </TableCell>
                <TableCell>Username  </TableCell>
                <TableCell>Address </TableCell>
                <TableCell>Role  </TableCell>
                <TableCell>Created At  </TableCell>
                <TableCell>Status  </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                users.length ? (
                  <>
                    {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user: any, key: any) => {
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
                            <Chip label={user.role} color="success" size="small" />

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
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Card>
  </>;
}

export default AllUsers;
