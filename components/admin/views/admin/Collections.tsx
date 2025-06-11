
import { useState, ChangeEvent, useEffect } from 'react'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import SearchBar from "material-ui-search-bar";
import { trimString } from 'helpers'
import Link from 'next/link'
import Layout from '../../layouts/Layout'
import { Button, capitalize, Tooltip, Typography } from '@mui/material'
import { toast, ToastContainer } from 'material-react-toastify'
import { addContent, getContent } from 'services/contentmanagement'
import { getCollections } from 'services'
import swal from 'sweetalert'


const FeaturedCollections = () => {

    const [page, setPage] = useState<number>(0)
    const [rowsPerPage, setRowsPerPage] = useState<number>(10)
    const [collections, setCollections] = useState<any>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searched, setSearched] = useState<string>("");
    const [formData, setFormData] = useState<any>([]);
    const [orderCollections, setOrderCollections] = useState<any>([])
    const [updated, setUpdate] = useState<Boolean>(false);


    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    }


    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const results = await getCollections();
            setCollections(results);
            setIsLoading(false)

        })()
    }, [])

    useEffect(() => {
        (async () => {
            const auctionOrderRes: any = await getContent({ orderType: 'collection' });
            setOrderCollections(auctionOrderRes)
            setFormData(auctionOrderRes);
        })();
    }, [updated])

    const requestSearch = (searchedVal: string) => {
        const filterData = collections.filter((collection: any) => {
            return collection.address.toLowerCase().includes(searchedVal.toLowerCase());
        });
        setCollections(filterData);
    };

    const cancelSearch = () => {
        setSearched("");
        requestSearch(searched);
    };


    const handleOrderSelection = async (formData: any) => {
        setIsLoading(true)
        const result: any = await addContent({
            'data': formData,
            'type': 'collection'
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
        const found = newFormData.find((element: any) => element.collectionId === id)
        const value = parseInt(e.target.value);
        if (value) {
            const foundValue = newFormData.find((element: any) => parseInt(element.orderValue) === value) || false;
            if (foundValue && id !== foundValue.collectionId) {
                const collectionData = collections.find((collection: any) => collection.id === foundValue.collectionId);
                const option: any = {
                    title: "Are you sure?",
                    text: `Do you want to remove "${capitalize(collectionData.name)}" collection from ${value} position?`,
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                };
                swal(option)
                    .then(async (willDelete) => {
                        if (willDelete) {
                            newFormData = newFormData.filter((data: any) => data.collectionId !== collectionData.id);
                            newFormData = newFormData.map((data: any) => {
                                if (data.collectionId === id) {
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
                    collectionId: id,
                    orderValue: value,
                    orderType: 'collection',
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
        <Layout>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>

                <ToastContainer position='top-right' />
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
                                <TableCell>Name</TableCell>
                                <TableCell>description</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Token</TableCell>
                                <TableCell>Created By</TableCell>
                                <TableCell>Order By</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                collections.length ? (
                                    <>
                                        {collections.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((collection: any, key: any) => {
                                            const defaultValue: any = formData.find((data: any) => data.collectionId === collection.id);
                                            return (
                                                <TableRow hover role='checkbox' key={key} >
                                                    <TableCell>
                                                        <Link
                                                            href={`/collections/${collection.id}`} passHref >
                                                            <a style={{
                                                                color: "#8d66f7"
                                                            }}>
                                                                {collection.name}</a>
                                                        </Link>
                                                    </TableCell>
                                                    <Tooltip title={collection.description}>
                                                        <TableCell>{trimString(collection.description) || ""}</TableCell>
                                                    </Tooltip>
                                                    <TableCell>{trimString(collection.contractAddress) || ""}</TableCell>
                                                    <TableCell>{collection.symbol || ""}</TableCell>
                                                    <TableCell>
                                                        <Link href={`/creators/${collection.creator.id}`} passHref>
                                                            <a style={{
                                                                color: "#8d66f7"
                                                            }}>@{collection.creator.username || ""}</a>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <select value={defaultValue?.orderValue || 0} name="category" onChange={(e: any) => handleChange(e, collection.id)}>
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
                                                </TableRow>
                                            )
                                        })}
                                    </>
                                ) : (
                                    <>
                                        <TableRow hover tabIndex={-1}>
                                            <TableCell colSpan={6} sx={{ textAlign: "center" }}><Typography variant="body2">No Data Found</Typography></TableCell>
                                        </TableRow>
                                    </>
                                )
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component='div'
                    count={collections.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Layout>
    )
}

export default FeaturedCollections
