
import { useState, ChangeEvent, useEffect } from 'react'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import { fileExist, trimString } from 'helpers'
import Chip from '@mui/material/Chip';
import Layout from '../../layouts/Layout'
import { ToastContainer } from 'material-react-toastify'
import { Avatar, Button, capitalize, Card, CardContent, CardHeader, Fab, Typography } from '@mui/material'
import { CustomModal } from 'components/miscellaneous/modal'
import { ModalHeader } from 'components/miscellaneous/modal'
import { ModalContent } from 'components/miscellaneous/modal'
import AdsForm from './campaigns/Form'
import { deleteCampaignAd, getCampaignAds } from 'services/campaigns'
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi'
import { DollarIcon } from 'components/miscellaneous/web3'


const AllAds = () => {

  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [campaigns, setCampaigns] = useState<any>([])
  const [activeCampaign, setActiveCampaign] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState<string>("");
  const [openModal, setOpenModal] = useState<Boolean>(false);
  const [updated, setUpdated] = useState<Boolean>(false);

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
      const data = await getCampaignAds();
      setCampaigns(data);
      setIsLoading(false);
    })()
  }, [updated])

  // const requestSearch = (searchedVal: string = "") => {
  //   searchedVal = searchedVal?.trim() || "";
  //   const filterData = campaigns.filter((campaign: any) => {
  //     return searchedVal ? campaign.name.toLowerCase().includes(searchedVal.toLowerCase()) : campaign.name;
  //   });
  //   setCampaigns(filterData);
  // };

  // const cancelSearch = () => {
  //   setSearched("");
  //   requestSearch();
  // };

  // const orderNumber = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleModalOpen = () => {
    setOpenModal(true);
    setActiveCampaign({});
  }

  const handleSubmit = () => {
    setUpdated(!updated);
    setActiveCampaign({});
    setOpenModal(false);
  }

  const handleEdit = async (id: string) => {
    const campaign: any = campaigns.find((campaign: any) => campaign.id == id);
    setActiveCampaign(campaign || {});
    setOpenModal(true);
  }

  const handleDelete = async (id: string) => {
    if (confirm('Do you want to delete this campaign ad?')) {
      const result = await deleteCampaignAd(id);
      if (result) {
        setUpdated(!updated);
      }
    }
  }

  return (
    <Layout>
      <Card>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: (theme) => theme.palette.primary.main, color: "white" }} aria-label="recipe">
              C
            </Avatar>
          }
          title="All Campaings"
          subheader="All ads for nft details"
          action={
            <Button startIcon={<BiPlus />} variant="outlined" onClick={handleModalOpen}>Create New</Button>
          }
        />
        <CardContent>
          <ToastContainer position='top-right' />
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} stickyHeader aria-label='sticky table'>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Group</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Button</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Ad Type</TableCell>
                  <TableCell>Clicks</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  campaigns.length ? (
                    <>
                      {campaigns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((campaignAd: any, key: any) => {

                        return (
                          <TableRow hover role='checkbox' key={key} >
                            <TableCell>
                              {campaignAd.name}
                            </TableCell>
                            <TableCell>
                              {campaignAd.group.name}
                            </TableCell>
                            <TableCell>
                              {trimString(campaignAd.title) || ""}
                            </TableCell>
                            <TableCell>
                              {trimString(campaignAd.description) || ""}
                            </TableCell>
                            <TableCell>
                              <a href={campaignAd.redirect_url} target="_blank" rel="noreferrer" style={{
                                color: "#8d66f7"
                              }}>
                                <Chip label={capitalize(campaignAd.button_text || 'Learn More')} color="primary" sx={{ cursor: "pointer" }} />
                              </a>
                            </TableCell>
                            <TableCell>
                              <DollarIcon>
                                {parseFloat(parseFloat(campaignAd.amount || "0").toFixed(2))}
                              </DollarIcon>
                            </TableCell>
                            <TableCell>
                              <DollarIcon>
                                {parseFloat(parseFloat(campaignAd.balance || "0").toFixed(2))}
                              </DollarIcon>
                            </TableCell>
                            <TableCell>
                              {campaignAd.file_type}
                            </TableCell>
                            <TableCell>
                              {campaignAd.ad_conversions?.click?.count || "0"}
                            </TableCell>
                            <TableCell>
                              {campaignAd.ad_conversions?.view?.count || "0"}
                            </TableCell>
                            <TableCell>
                              {
                                ["draft", "pending"].includes(campaignAd.status) ? (
                                  <Chip label="Pending" size="small" style={{ backgroundColor: 'orange', color: 'white' }} />
                                ) : campaignAd.status == "publish" ? (
                                  <Chip label="Active" color="success" size="small" /> 
                                ) : (
                                  <Chip label="InActive" size="small" style={{ backgroundColor: 'red', color: 'white' }} />
                                )
                              }
                              <Fab sx={{ ml: 2, color: "#8d66f7" }} onClick={() => handleEdit(campaignAd.id)} size="small" variant='extended' aria-label="edit ">
                                <BiEdit />
                              </Fab>
                              <Fab sx={{ ml: 2, color: "red" }} onClick={() => handleDelete(campaignAd.id)} size="small" variant='extended' aria-label="edit ">
                                <BiTrash />
                              </Fab>
                            </TableCell>

                          </TableRow>
                        )
                      })}
                    </>
                  ) : (
                    <>
                      <TableRow hover tabIndex={-1}>
                        <TableCell colSpan={9} sx={{ textAlign: "center" }}><Typography variant="body2">No Data Found</Typography></TableCell>
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
            count={campaigns.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      <CustomModal
  
        open={openModal}
        onClose={(_: any, reason: any) => {
          if (reason !== "backdropClick") {
            setOpenModal(false);
          }
        }}
        className="campaing-dialog"
        fullWidth={true}
        maxWidth='xl'
      >
        <ModalHeader onClose={() => setOpenModal(false)}>
          <span className="font-bold">{Object.keys(activeCampaign).length ? "Edit" : "Add"} Campaign</span>
        </ModalHeader>
        <ModalContent className='popup_form_title addcampaign_popup'>
          <AdsForm onSubmit={handleSubmit} setOpenModal={setOpenModal} editData={activeCampaign} />
        </ModalContent>
      </CustomModal>
    </Layout >
  )
}

export default AllAds
