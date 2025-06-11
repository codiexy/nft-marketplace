import React, { useState, useEffect } from "react";
import moment from "moment";
import Link from "next/link";
import Image from "next/image";
import { ethers } from "ethers";
import { useRouter } from 'next/router';
import { Tooltip, Button } from "@nextui-org/react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import TokenIcon from '@mui/icons-material/Token';
// Icons
import { HiBadgeCheck } from "react-icons/hi";
import { FaFacebookF, FaInstagram, FaTwitter, FaUserEdit } from "react-icons/fa";

import { MyNFT } from '../nft'
import { NoDataFound, TrimAndCopyText, CommonFilter, DvAvatar } from "../miscellaneous";
import { CollectionCard } from "../collections";
import { Metamask, MetamaskContextResponse } from "context";
import { getUserById } from "services";
import 'react-tabs/style/react-tabs.css';
import EthIcon from "components/miscellaneous/web3/EthIcon";
import { useNftMarketplaceContractErc20 } from "components/miscellaneous/hooks";

function Profile({ useFilter, collected, nfts, collections }: any) {
  const router = useRouter();
  const [loginUser, setLoginUser] = useState<any>({});
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<Boolean>(true);
  const { isAuthenticated, user, web3 }: MetamaskContextResponse = Metamask.useContext();
  const [tokenBalance, setTokenBalance] = useState<number>(0)
  const [marketplaceContract] = useNftMarketplaceContractErc20();



  useEffect(() => {
    if (!isAuthenticated || !Object.keys(user).length) {
      router.push('/');
      return;
    }
    (async () => {
      const currentUserId = user.id;
      setIsLoading(true)
      const currentUser: any = await getUserById(currentUserId);
      var userBal = "0.0000";
      if (currentUser.address) {
        const userBalance = await web3.library.getBalance(currentUser.address);
        userBal = (parseFloat(ethers.utils.formatEther(userBalance))).toFixed(4);
      }
      setBalance(userBal);
      setLoginUser(currentUser);
      setIsLoading(false)
    })();

  }, [isAuthenticated, router, user, web3]);

  useEffect(() => {       
    (async () => {
      const userAddress = Object.keys(user).length ? user.address : "";
      if (typeof marketplaceContract.getAddressInfo === "function") {
        const dvTokenBal = await marketplaceContract.getAddressInfo(userAddress);        
        const resultToken: any = dvTokenBal[1];
        const desimalValue = 10**(dvTokenBal[2]);            
        setTokenBalance(parseInt(resultToken) / desimalValue)         
      }
    })()
  }, [tokenBalance])


  const handleToggle = (bool: Boolean) => {
    setViewMode(bool)
  }

  return (
    <>

      <section className="collectionsingle">
        <div className="container-fluid mx-auto ">
          <div className="">
            <div
              className="basis-12/12  collectionsingle_banner_row"
              data-aos="fade-up"
              data-aos-anchor-placement="top-bottom"
              data-aos-delay="350"
              data-aos-duration="2000"
            >
              <div className="collectionsingle_banner">
                {
                  loginUser.banner ? (
                    <Image
                      src={loginUser.banner}
                      className="rounded-lg object-cover    border border-3 border-[#fff]"
                      alt="my image"
                      height="300px"
                      width="1200px"
                    />
                  ) : (
                    <div className=" profile_dummybg"></div>
                  )
                }

              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="collectionsingle ">
        <div className="container-fluid mx-auto ">
          <div className="">
            <div
              className="basis-12/12  collectionsingle_banner_row "
              data-aos="fade-up"
              data-aos-anchor-placement="top-bottom"
              data-aos-delay="350"
              data-aos-duration="2000"
            >
            </div>
          </div>
        </div>
      </section>
      <section className="collectionsingle lg:px-14 md:px-5 px-0 pb-10 pt-4 profile_new" style={{ backgroundImage: 'url(' + loginUser.banner + ')' }}>
        <div className="container mx-auto ">
          <div className="lg:flex md:flex block collectionsingle_data_row">
            <div
              className="basis-3/12  collectionsingle_banner_row_data "
              data-aos="fade-up"
              data-aos-anchor-placement="top-bottom"
              data-aos-delay="350"
              data-aos-duration="2000"
            >
              <div className="collectionsingle_banner_row_data_box">

                <div className="collectionsingle_banner_smallimage">
                  <DvAvatar
                    imageAlt="User Profile"
                    imageSize={{
                      height: "200px",
                      width: "200px"
                    }}
                    imageUrl={loginUser.image}
                    size={200}
                    name={loginUser.name || "noname"}
                    colors={loginUser.colors}
                  />
                </div>
              </div>
            </div>

            <div
              className="basis-6/12 "
              data-aos="fade-up"
              data-aos-anchor-placement="top-bottom"
              data-aos-delay="350"
              data-aos-duration="2000"
            >
              <div className="">


                <div className="single creator_leftbox">
                  <h2 className="dark:text-white text-[#fff] font-semibold	text-lg	home-collection_heading_badge flex items-center">
                    {loginUser.name ?? "Demo User"}

                    {loginUser.isVarified && (
                      <Tooltip content={"Verified"} rounded color="primary" placement="rightEnd">
                        <Button auto flat>
                          <HiBadgeCheck />
                        </Button>
                      </Tooltip>
                    )}


                  </h2>
                  <h6 className="collectiondetail_user dark:text-white text-[#000] text-sm "> @{loginUser.username ?? "demo123"}</h6>

                  <div className="">
                    <p className="dark:text-[#707a83] text-[#707a83] text-sm flex  mt-1  mb-2 mx-auto ">
                      <b className="text-[#000] dark:text-[#fff] font-semibold"> JOIN DATE </b>: {moment(loginUser.createdAt).format('Do, MMMM YYYY')}</p>
                  </div>
                  <p className=" dark:text-[#707a83] text-[#707a83] text-md font-normal collectiondetail_text">{loginUser.description}</p>
                  <div className="mt-5 flex ">
                    <div className=" flex items-center  collectiondetail_balances">
                      <h6 className=" dark:text-[#fff] text-[#707a83] text-sm ml-2"><EthIcon /> {balance}</h6>
                    </div>

                    <div className=" flex items-center  collectiondetail_balances">
                      <h6 className=" dark:text-[#fff] text-[#707a83] text-sm ml-2"><TokenIcon /> {tokenBalance}</h6>
                    </div>
                    <div>
                      <h6 className=" collectiondetail_address dark:text-white text-[#000] text-sm ">   <TrimAndCopyText text={loginUser.address} /> </h6>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div
              className="basis-3/12  collectionsingle_banner_row  collectionsingle_right"
              data-aos="fade-up"
              data-aos-anchor-placement="top-bottom"
              data-aos-delay="350"
              data-aos-duration="2000"
            >
              <div className="creatordetails_followers_list flex justify-end items-center">
                <div className="creatordetails_followers ">
                  <h6 className=" dark:text-[#fff] text-[#000] ml-2 text-xs font-normal "><b>{loginUser.followers || 0}</b> Followers</h6>
                </div>
                <div className="creatordetails_followers">
                  <h6 className=" dark:text-[#fff] text-[#000] ml-2 text-xs font-normal "><b>{loginUser.followings || 0}</b> Following</h6>
                </div>

              </div>
              <div className="myprofile_onsale_column_box_end_btn mt-1 flex items-center">
                {
                  loginUser.socialLinks?.facebook && (
                    <div className="myprofile_onsale_column_box_socialicons ">
                      <a target="_blank" rel="noreferrer" title="Facebook" href={loginUser.socialLinks.facebook}><FaFacebookF /></a>
                    </div>
                  )
                }
                {
                  loginUser.socialLinks?.instagram && (
                    <div className="myprofile_onsale_column_box_socialicons ">
                      <a target="_blank" rel="noreferrer" title="Instagram" href={loginUser.socialLinks.instagram}><FaInstagram /></a>
                    </div>
                  )
                }
                {
                  loginUser.socialLinks?.twitter && (
                    <div className="myprofile_onsale_column_box_socialicons ">
                      <a target="_blank" rel="noreferrer" title="Twitter" href={loginUser.socialLinks.twitter}><FaTwitter /></a>
                    </div>
                  )
                }
                <div className="myprofile_onsale_column_box_socialicons ">
                  <Link href={`/profile/edit`}>
                    <a title="Edit Profile"><FaUserEdit /></a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f1f8] dark:bg-[#030306]">
        <div className="container mx-auto">
          <div className="">
            <div
              className="basis-12/12 myprofile_page_pr0file_row_image_content pt-10 pb-0"
              data-aos="fade-up"
              data-aos-anchor-placement="top-bottom"
              data-aos-delay="300"
              data-aos-duration="2000"
            >

              <Tabs>
                <TabList>
                  <Tab>Created</Tab>
                  <Tab>Owned</Tab>
                  <Tab>Collections</Tab>
                </TabList>


                <TabPanel className="reatordetail_tabs  searchpage_tabs_panel">
                  <CommonFilter onToggle={handleToggle} useFilter={useFilter} id="" pathname="profile" />
                  <div className="container-fluid mx-auto  ">
                    {
                      !isLoading ? (
                        <>
                          {
                            nfts.length ? (
                              <>
                                <div className={`grid grid-cols-${viewMode ? '4' : '3'} gap-4 `}>
                                  {
                                    nfts.map((nft: any, key: any) => {
                                      return (
                                        <MyNFT key={key} {...nft} />
                                      )
                                    })
                                  }
                                </div>
                              </>
                            ) : (
                              <NoDataFound />
                            )
                          }
                        </>
                      ) : (
                        <NoDataFound>Loading...</NoDataFound>
                      )
                    }
                  </div>

                </TabPanel>
                <TabPanel className="reatordetail_tabs searchpage_tabs_panel">
                  <CommonFilter onToggle={handleToggle} useFilter={useFilter} id="" pathname="profile" />
                  <div className="container-fluid mx-auto  ">
                    {
                      !isLoading ? (
                        <>
                          {
                            collected.length ? (
                              <>
                                <div className={`grid grid-cols-${viewMode ? '4' : '3'} gap-4 `}>
                                  {
                                    collected.map((nft: any, key: any) => {

                                      return (
                                        <MyNFT key={key} {...nft} collected={true} />
                                      )
                                    })
                                  }
                                </div>
                              </>
                            ) : (
                              <NoDataFound />
                            )
                          }
                        </>
                      ) : (
                        <NoDataFound>Loading...</NoDataFound>
                      )
                    }
                  </div>
                </TabPanel>
                <TabPanel className="reatordetail_tabs searchpage_tabs_panel">
                  <CommonFilter onToggle={handleToggle} useFilter={useFilter} id="" pathname="profile" />
                  <div className="container-fluid mx-auto  ">
                    {
                      !isLoading ? (
                        <>
                          {
                            collections.length ? (
                              <>
                                <div className={`grid grid-cols-${viewMode ? '4' : '3'} gap-4 `}>
                                  {
                                    collections.map((collection: any, key: any) => {
                                      return (
                                        <CollectionCard key={key} collection={collection} id={collection.id} />
                                      )
                                    })
                                  }
                                </div>
                              </>
                            ) : (
                              <NoDataFound />
                            )
                          }
                        </>
                      ) : (
                        <NoDataFound>Loading...</NoDataFound>
                      )
                    }
                  </div>
                </TabPanel>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Profile;
