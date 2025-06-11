// ** React Imports
import { useState, ChangeEvent, useEffect } from 'react'

// ** MUI Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import { getAllItems } from '../../../../services'
import { Chip, Tooltip, Typography } from '@mui/material'
import Link from 'next/link'
import { ToastContainer } from 'material-react-toastify';
import { trimString } from '../../../../helpers'


const GetAllNfts = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [nfts, setNfts] = useState<any>([])
    const [page, setPage] = useState<number>(0)
    const [rowsPerPage, setRowsPerPage] = useState<number>(10)


    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const AllNfts: any = await getAllItems({
                limit: 10,
                sort: { "createdAt": -1 },
                status: "publish,on_sale,on_auction"
            });
            setNfts(AllNfts);
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


    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>

            <TableContainer sx={{ maxHeight: 440 }}>
                <ToastContainer position="top-right" newestOnTop={false} />
                <Table stickyHeader aria-label='sticky table'>
                    <TableHead>
                        <TableRow>
                            <TableCell>Token</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>description</TableCell>
                            <TableCell>collection</TableCell>
                            <TableCell>category</TableCell>
                            <TableCell>likes</TableCell>
                            <TableCell>views</TableCell>
                            <TableCell>marketplace</TableCell>
                            <TableCell>Status</TableCell>
                            {/* <TableCell>Action</TableCell> */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            nfts.length ? (
                                <>
                                    {nfts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((nft: any, key: any) => {
                                        return (
                                            <TableRow hover role='checkbox' tabIndex={-1} key={key}>
                                                <TableCell>#{nft.tokenId}</TableCell>
                                                <TableCell>{nft.title}</TableCell>
                                                <Tooltip title={nft.description}>
                                                    <TableCell>
                                                        {trimString(nft.description)}
                                                    </TableCell>
                                                </Tooltip>
                                                <Tooltip title={nft.collection.name}>
                                                    <TableCell>
                                                        <Link
                                                            href={`/collections/${nft.collection.id}`}
                                                            style={{
                                                                color: "#8d66f7"
                                                            }}
                                                            passHref
                                                            legacyBehavior>
                                                            {trimString(nft.collection.name)}
                                                        </Link>
                                                    </TableCell>
                                                </Tooltip>
                                                <TableCell> {nft.category.name}</TableCell>
                                                <TableCell> {nft.likeCount}</TableCell>
                                                <TableCell> {nft.viewCount}</TableCell>
                                                <TableCell>
                                                    {
                                                        nft.onMarketPlace ?
                                                            <Chip label="On Sale" color="success" size="small" /> :
                                                            <Chip label="Not On Sale" color="error" size="small" />
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        nft.marketplace.action ? <Chip label={nft.marketplace.action} color="success" size="small" /> : "NA"
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        );
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
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component='div'
                count={nfts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}

export default GetAllNfts
