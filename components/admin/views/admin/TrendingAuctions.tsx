
import { useState, ChangeEvent, useEffect } from 'react'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import { getAllItems } from 'services'
import SearchBar from "material-ui-search-bar";
import { trimString } from 'helpers'
import Countdown from 'react-countdown'
import { capitalize, Chip, Tooltip, Typography } from '@mui/material'
import Layout from '../../layouts/Layout'
import Link from 'next/link'
import { toast, ToastContainer } from 'material-react-toastify'
import { addContent, getContent } from 'services/contentmanagement';
import swal from 'sweetalert'



const TrendingAuctions = (props: any) => {

    const [page, setPage] = useState<number>(0)
    const [rowsPerPage, setRowsPerPage] = useState<number>(10)
    const [auctions, setAuctions] = useState<any>([])
    const [orderedAuctions, setOrderAuctions] = useState<any>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searched, setSearched] = useState<string>("");
    const [updated, setUpdate] = useState<Boolean>(false);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    }
    const [formData, setFormData] = useState<any>([]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const results = await getAllItems({
                auction: true,
            });
            setAuctions(results);
            setIsLoading(false)

        })()
    }, []);

    useEffect(() => {
        (async () => {
            const auctionOrderRes: any = await getContent({ orderType: 'auction' });
            setOrderAuctions(auctionOrderRes)
            setFormData(auctionOrderRes);
        })();
    }, [updated])

    const requestSearch = (searchedVal: string) => {
        const filterData = auctions.filter((artist: any) => {
            return artist.address.toLowerCase().includes(searchedVal.toLowerCase());
        });
        setAuctions(filterData);
    };

    const cancelSearch = () => {
        setSearched("");
        requestSearch(searched);
    };


    const handleOrderSelection = async (formData: any) => {
        setIsLoading(true)
        const result: any = await addContent({
            'data': formData,
            'type': 'auction'
        });
        if (result.status === "success") {
            setUpdate(!updated);
            toast.success("Updated data in order!")
        } else {
            toast.error("Something Went Wrong")
        }
        setIsLoading(false)

    }

    const orderNumber = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];


    const handleChange = async (e: any, id: any) => {

        let saveData = false;
        let newFormData: any = formData;
        const found = newFormData.find((element: any) => element.nftId === id)
        const value = parseInt(e.target.value);
        if (value) {
            const foundValue = newFormData.find((element: any) => parseInt(element.orderValue) === value) || false;
            if (foundValue && id !== foundValue.nftId) {
                const auctionData = auctions.find((auction: any) => auction.id === foundValue.nftId);
                const option: any = {
                    title: "Are you sure?",
                    text: `Do you want to remove "${capitalize(auctionData.title)}" nft from ${value} position?`,
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                };
                swal(option)
                    .then(async (willDelete) => {
                        if (willDelete) {
                            newFormData = newFormData.filter((data: any) => data.nftId !== auctionData.id);
                            newFormData = newFormData.map((data: any) => {
                                if (data.nftId === id) {
                                    data.orderValue = value.toString();
                                }
                                return data;
                            })
                            await handleOrderSelection(newFormData)
                        }
                        setFormData((prev: any) => ([...prev, ...newFormData]));
                        setUpdate(!updated);
                    });
                return;
            } else {
                saveData = true;
                newFormData.push({
                    nftId: id,
                    orderValue: value,
                    orderType: 'auction',
                });
            }
        } else {
            if (found) {
                saveData = true;
                newFormData = newFormData.filter((item: any) => item !== found)
            }
        }
        if (saveData) {
            await handleOrderSelection(newFormData)
        }
        setFormData((prev: any) => ([...prev, ...newFormData]));
        setUpdate(!updated);
    }


    return (
        <>
            <ToastContainer position='top-right' />
            <Layout>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>

                    <TableContainer sx={{ maxHeight: 440 }}>
                        <div className='dashboard_topbar'>
                            <SearchBar
                                value={searched}
                                onChange={(searchVal) => requestSearch(searchVal)}
                                onCancelSearch={() => cancelSearch()}
                            />

                        </div>
                        <Table stickyHeader aria-label='sticky table'>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Token</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Time (dd hh mm)</TableCell>
                                    <TableCell>Order by</TableCell>
                                    <TableCell>category</TableCell>
                                    <TableCell>created by</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    auctions.length ? (
                                        <>
                                            {
                                                auctions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((auction: any, key: any) => {
                                                    const defaultValue: any = formData.find((data: any) => data.nftId === auction.id);
                                                    return (
                                                        <TableRow hover role='checkbox' key={key} >

                                                            <TableCell>
                                                                <a target="_blank" rel="noreferrer" href={auction.metadata}>#{auction.tokenId}</a>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Link
                                                                    href={`/discover/${auction.id}`} passHref >
                                                                    <a style={{
                                                                        color: "#8d66f7"
                                                                    }}>
                                                                        {auction.title}</a>
                                                                </Link>
                                                            </TableCell>
                                                            <Tooltip title={auction.description}>
                                                                <TableCell>
                                                                    {trimString(auction.description) || ""}
                                                                </TableCell>
                                                            </Tooltip>
                                                            <TableCell>{trimString(auction.transaction.to) || ""}</TableCell>
                                                            <TableCell>
                                                                <Chip label={<Countdown date={auction.marketplace.data.endDate} />} color="info" size="small" />

                                                            </TableCell>
                                                            <TableCell>
                                                                <select value={defaultValue?.orderValue || 0} name="category" onChange={(e: any) => handleChange(e, auction.id)}>
                                                                    {orderNumber.map((orderNo: any, key: any) => {
                                                                        const isSelected = parseInt(defaultValue?.orderValue) === orderNo || false;
                                                                        return <option
                                                                            key={key}
                                                                            value={orderNo}
                                                                            selected={isSelected}
                                                                        >{orderNo === 0 ? "Select Order" : orderNo}</option>
                                                                    })}
                                                                </select>
                                                            </TableCell>

                                                            <TableCell>

                                                                {auction.category.description || ""}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Link href={`/creators/${auction.createdBy.id}`} passHref>
                                                                    <a style={{
                                                                        color: "#8d66f7"
                                                                    }}>@{auction.createdBy.username || ""}</a>
                                                                </Link>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })
                                            }
                                        </>
                                    ) : (
                                        <TableRow hover tabIndex={-1}>
                                            <TableCell colSpan={8} sx={{ textAlign: "center" }}><Typography variant="body2">No Data Found</Typography></TableCell>
                                        </TableRow>
                                    )
                                }


                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component='div'
                        count={auctions.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Layout>
        </>
    )
}

export default TrendingAuctions
