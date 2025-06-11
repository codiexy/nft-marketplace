
import { useState, ChangeEvent, useEffect } from 'react'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import { trimString } from 'helpers'
import SearchBar from "material-ui-search-bar";
import Chip from '@mui/material/Chip';
import Layout from '../../layouts/Layout'
import Link from 'next/link'
import { toast, ToastContainer } from 'material-react-toastify'
import { Button, capitalize, Typography } from '@mui/material'
import { getUsers } from 'services'
import { addContent, getContent } from 'services/contentmanagement'
import swal from 'sweetalert'
import { TrimAndCopyText } from 'components/miscellaneous'


const AllArtists = () => {

  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [artists, setArtists] = useState<any>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState<string>("");
  const [formData, setFormData] = useState<any>([]);
  const [orderArtists, setOrderArtists] = useState<any>([]);
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
      const allArtists = await getUsers();
      setArtists(allArtists)
      setIsLoading(false);
    })()
  }, [])

  useEffect(() => {
    (async () => {
      const auctionOrderRes: any = await getContent({ orderType: 'artist' });
      setOrderArtists(auctionOrderRes)
      setFormData(auctionOrderRes);
    })();
  }, [updated])

  const requestSearch = (searchedVal: string) => {
    const filterData = artists.filter((artist: any) => {
      return artist.address.toLowerCase().includes(searchedVal.toLowerCase());
    });
    setArtists(filterData);
  };

  const cancelSearch = () => {
    setSearched("");
    requestSearch(searched);
  };


  const handleOrderSelection = async (formData: any) => {
    setIsLoading(true)
    const result: any = await addContent({
      'data': formData,
      'type': 'artist'
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
    const found = newFormData.find((element: any) => element.userId === id)
    const value = parseInt(e.target.value);
    if (value) {
      const foundValue = newFormData.find((element: any) => parseInt(element.orderValue) === value) || false;
      if (foundValue && id !== foundValue.userId) {
        const artistData = artists.find((artist: any) => artist.id === foundValue.userId);
        const option: any = {
          title: "Are you sure?",
          text: `Do you want to remove "${capitalize(artistData.name)}" artist from ${value} position?`,
          icon: "warning",
          buttons: true,
          dangerMode: true,
        };
        swal(option)
          .then(async (willDelete) => {
            if (willDelete) {
              newFormData = newFormData.filter((data: any) => data.userId !== artistData.id);
              newFormData = newFormData.map((data: any) => {
                if (data.userId === id) {
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
          userId: id,
          orderValue: value,
          orderType: 'artist',
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
                <TableCell>Address</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>order by</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                artists.length ? (
                  <>
                    {artists.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((artist: any, key: any) => {
                      const defaultValue: any = formData.find((data: any) => data.userId === artist.id);
                      return (
                        <TableRow hover role='checkbox' key={key} >
                          <TableCell>
                            <Link href={`/creators/${artist.id}`} passHref>
                              <a style={{
                                color: "#8d66f7"
                              }}>{artist.name}</a>
                            </Link>
                          </TableCell>
                          <TableCell>
                            {/* {trimString(artist.address) || ""} */}
                            <TrimAndCopyText text={artist.address} />
                          </TableCell>
                          <TableCell> <Link href={`/creators/${artist.id}`} passHref>
                            <a style={{
                              color: "#8d66f7"
                            }}>@{artist.username}</a>
                          </Link></TableCell>

                          <TableCell>{artist.status ? <Chip label="Active" color="success" size="small" /> : <Chip label="InActive" size="small" style={{ backgroundColor: 'red', color: 'white' }} />}</TableCell>
                          <TableCell>
                            <select value={defaultValue?.orderValue || 0} name="category" onChange={(e: any) => handleChange(e, artist.id)}>
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
                      <TableCell colSpan={5} sx={{ textAlign: "center" }}><Typography variant="body2">No Data Found</Typography></TableCell>
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
          count={artists.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Layout>
  )
}

export default AllArtists
