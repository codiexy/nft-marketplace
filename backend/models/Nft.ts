import { ObjectId } from 'mongodb';
import { generate } from 'randomized-string'

import Model from "./Model";
import { NftListing } from './NftListing';
import { NftHistory } from './NftHistory';
import { NftAuction } from './NftAuction';

import type { NextApiRequest, NextApiResponse } from 'next'
import { optionPropsNft } from '@types';
import moment from 'moment';
import { NftOffer } from './NftOffer';
import { EthTransaction } from './EthTransaction';
import { NftOwner } from './NftOwner';
import { NftAuctionHistory } from './NftAuctionHistory';
import { User } from './User';

export interface NFTItemOnSaleData {
    price?: string;
    onMarketPlace: Boolean;
    marketplace: any;
    status: "on_sale" | "on_auction";
    token?: string;
    transactions?: any;
}

export interface BuyNFTItemData {
    transaction: any;
}

export interface MakeAOfferProps {
    transaction: any;
    expiredDate: Date | string;
    price: string;
}

export interface PlaceABidProps {
    transaction: any;
    price: string;
}

export interface AcceptOfferProps {
    transaction: any;
    offerer: string;
}

export interface TransferNftItemProps {
    transaction: any;
    auctionId: string;
}

export interface RefundOfferProps {
    transaction: any;
    offerId: string;
}

export class Nft extends Model {

    public collection: string = "nfts";

    public defaultPipeline = [
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "creator",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "ownedBy",
                foreignField: "_id",
                as: "owner",
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "categoryData",
            },
        },
        {
            $lookup: {
                from: "genries",
                localField: "genre",
                foreignField: "_id",
                as: "genreData",
            },
        },
        {
            $lookup: {
                from: "collections",
                localField: "collection",
                foreignField: "_id",
                as: "collectionData",
            },
        },

        {
            $lookup: {
                from: "content_management",
                localField: "_id",
                foreignField: "nftId",
                as: "orderValue",
            },
        },
        {
            $lookup: {
                from: "nft_views",
                let: { nftId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$nftId", "$$nftId"] }
                        }
                    },
                    { $count: "count" }
                ],
                as: "views",
            }
        },
        {
            $lookup: {
                from: "nft_likes",
                let: { nftId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$nftId", "$$nftId"] }
                        }
                    },
                    {
                        $count: "count"
                    }

                ],
                as: "likes",
            }
        },
        { $unwind: "$categoryData" },
        { $unwind: "$genreData" },
        { $unwind: "$collectionData" },

        { $unwind: "$creator" },
    ]

    constructor(req: NextApiRequest, res: NextApiResponse) {
        super("nfts", req, res);
    }

    nftItemOnSale = async (id: string, inputData: NFTItemOnSaleData) => {
        const itemData: any = await this.first(id);
        if (!itemData) throw new Error("Invalid item id");

        if (!this.user?.id && itemData.ownedBy.toString() !== this.user.id.toString()) throw new Error("You are not owner for this item");
        const type: string = inputData.marketplace.type || "";
        if (!this.saleTypes.includes(type)) throw new Error("Invalid sale type!");

        const onSaleToken = this.createNftSaleToken();
        const transactions = inputData.transactions || {};
        delete inputData.token;
        delete inputData.transactions;
        const result = await this.update(id, {
            ...inputData,
            onSaleToken
        });
        var response = {
            status: false,
            message: "",
            data: {}
        };
        if (result) {
            this.request.method = "POST";
            const nftId: any = id;
            if (type === "fixed_price") {
                const NftListingModel = new NftListing(this.request, this.response);
                const listId = await NftListingModel.saveData(nftId, {
                    transaction: transactions,
                    price: inputData.marketplace.price,
                    secret: onSaleToken,
                    // listingId: inputData.marketplace.typeId
                });
                response = {
                    status: true,
                    message: "Item listed successfully!",
                    data: { listId }
                }
            } else if (type === "timed_auction") {
                const NftAuctionModel = new NftAuction(this.request, this.response);
                const auctionId = await NftAuctionModel.saveData(nftId, {
                    transaction: transactions,
                    startDate: inputData.marketplace.startDate,
                    endDate: inputData.marketplace.endDate,
                    bidPrice: inputData.marketplace.minBid,
                    secret: onSaleToken,
                    auctionId: inputData.marketplace.typeId
                });

                // 
                const auctionHistoryModel = new NftAuctionHistory(this.request, this.response);
                const auctionHistory = await auctionHistoryModel.saveData(auctionId, {
                    transaction: transactions,
                    initialBid: inputData.marketplace.minBid,
                    minBid: inputData.marketplace.minBid,
                    maxBid: inputData.marketplace.minBid,
                    nftId: nftId,
                    auctionId: inputData.marketplace.typeId,
                    status: "initialize"
                });
                // 

                response = {
                    status: true,
                    message: "Item set on auction successfully!",
                    data: {
                        auctionId,
                        auctionHistory
                    }
                }
            } else {
                await this.createHistory(
                    nftId,
                    "open_for_bids",
                    itemData.ownedBy,
                    itemData.createdBy,
                    transactions,
                    "0",
                    inputData.marketplace.typeId
                )
                response = {
                    status: true,
                    message: "Item successfully set on sale!",
                    data: {}
                };
            }
        }
        return result ? response : {
            status: false,
            message: "Item not updated successfully!",
            data: {}
        };
    }

    createHistory = async (
        id: any,
        type: string,
        owner: string,
        creator: string,
        transactions: any,
        price: string = "0",
        typeId: string | number = 0
    ) => {
        const NftHistoryModel = new NftHistory(this.request, this.response);
        return await NftHistoryModel.insert(
            {
                nftId: new ObjectId(id),
                type,
                typeId,
                price,
                transactions,
                owner: new ObjectId(owner),
                creator: new ObjectId(creator)

            },
            {
                restricted: false
            }
        );
    }

    getById = async (objectId: ObjectId, options = {}) => {
        options = typeof options === 'object' && options ? options : {};

        let pipeline: any = [...this.defaultPipeline, { $match: { _id: objectId } }];
        if (this.user.id) {
            pipeline = [
                ...pipeline,
                {
                    $lookup: {
                        from: "nft_likes",
                        let: { nftId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        { $expr: { $eq: ["$nftId", "$$nftId"] } },
                                        { $expr: { $eq: ["$createdBy", new ObjectId(this.user.id)] } },
                                    ]
                                }
                            },
                            {
                                $count: "count"
                            }

                        ],
                        as: "isLiked",
                    }
                }]
        }
        return await this.aggregate(pipeline, "single");
    }

    getAll = async (options: optionPropsNft) => {
        let {
            skip = 0,
            limit = 0,
            match,
            sort = { "updatedAt": -1 },
            others = []
        } = options;
        const userId = this.user.id || "";

        let pipeline: any = [...this.defaultPipeline, ...others];
        if (Object.keys(sort).length) {
            pipeline = [...pipeline, { $sort: sort }]
        }
        if (match) {
            pipeline = [...pipeline, { $match: match }];
        }
        if (limit > 0) {
            pipeline = [...pipeline, { $limit: limit + skip }];
        }
        if (skip > 0) {
            pipeline = [...pipeline, { $skip: skip }];
        }
        if (userId) {
            pipeline = [
                ...pipeline,
                {
                    $lookup: {
                        from: "nft_likes",
                        let: { nftId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        { $expr: { $eq: ["$nftId", "$$nftId"] } },
                                        { $expr: { $eq: ["$createdBy", new ObjectId(userId)] } },
                                    ]
                                }
                            },
                            {
                                $count: "count"
                            }

                        ],
                        as: "isLiked",
                    }
                }]
        }

        return await this.aggregate(pipeline);
    }

    buyNftItem = async (id: string, transaction: any = {}) => {
        try {
            const nftData = await this.first(id);
            if (nftData) {
                if (!nftData.onMarketPlace) throw new Error('Item is not on sale');
                const listModel = new NftListing(this.request, this.response);
                const listData = await listModel.getAll(id, {
                    current: true,
                    response: 'single'
                });
                if (!listData) throw new Error('Item is not on sale!');
                // if(!moment().isAfter(listData.startDate) || !moment(listData.endDate).isAfter(moment())){
                //     throw new Error('Expired sale time for the item!');
                // }

                const result = await this.update(id, {
                    marketplace: {},
                    onMarketPlace: false,
                    onSaleToken: "",
                    price: listData.price,
                    ownedBy: new ObjectId(this.user.id),
                    status: "publish"
                });
                if (result) {
                    await listModel.update(listData.id.toString(), {
                        status: 'completed'
                    });
                    // Save owner history of the item
                    const NftOwnerModel = new NftOwner(this.request, this.response);
                    await NftOwnerModel.saveData({
                        nftId: new ObjectId(id),
                        seller: new ObjectId(nftData.createdBy),
                        price: nftData.price,
                        owner: new ObjectId(this.user.id)
                    });

                    // Save NFT action history
                    this.createHistory(
                        id,
                        'sold',
                        this.user.id,
                        nftData.createdBy,
                        transaction,
                        listData.price
                    );

                    // Save NFT transaction history
                    const ethTransaction = new EthTransaction(this.request, this.response);
                    await ethTransaction.insert(
                        {
                            ...transaction,
                            type: "nft",
                            subType: "sold_listing_item",
                            moduleId: new ObjectId(id),
                            subModuleId: new ObjectId(listData.id.toString()),
                            saleTypeId: 0
                        }
                    );
                }
                return result;
            } else {
                throw new Error("Invalid nft id");
            }
        } catch (error: any) {
            throw new Error(error.message || "Something went wrong");
        }
    }

    createNftSaleToken = (prefix: string = "") => {
        prefix = prefix.trim();
        prefix = prefix.slice(-1) === "-" ? prefix.slice(0, -1) : prefix;
        const token = generate({
            prefix: `${prefix ? prefix + "-" : ""}`,
            length: 16,
            charset: "alphanumeric"
        });

        return token + + (moment().valueOf()).toString()
    }

    makeAOffer = async (id: string, inputData: MakeAOfferProps) => {
        const offerModel = new NftOffer(this.request, this.response);
        return await offerModel.saveData(id, inputData);
    }

    acceptOffer = async (id: string, inputData: AcceptOfferProps) => {
        const offerModel = new NftOffer(this.request, this.response);
        return await offerModel.acceptOffer(id, inputData);
    }

    placeABid = async (id: string, inputData: PlaceABidProps) => {
        const nftAuctionModel = new NftAuction(this.request, this.response);
        return await nftAuctionModel.placeABid(id, inputData);
    }

    transferNftItem = async (id: string, inputData: TransferNftItemProps) => {
        const nftAuctionModel = new NftAuction(this.request, this.response);
        return await nftAuctionModel.transfer(id, inputData);
    }

    transferNftItemByAdmin = async (id: string, inputData: TransferNftItemProps) => {
        if (this.user?.role !== 'ADMIN') throw new Error("You are not Authenticated");
        const nftAuctionModel = new NftAuction(this.request, this.response);
        return await nftAuctionModel.transfer(id, inputData);
    }

    nftItemRemoveFromSale = async (id: string, inputData: BuyNFTItemData) => {
        try {
            const nftData = await this.first(id);
            if (!nftData) throw new Error("Invalid nft id!");
            if (!nftData.onMarketPlace) throw new Error("Item is not on sale!");
            const action = nftData.marketplace.action || "";
            var subModuleId: any = "";
            var price: string = nftData.price || "0";
            var subType = 'cancelled_from_open_for_offers';
            switch (action) {
                case "fixed_price":
                    const listModel = new NftListing(this.request, this.response);
                    const listData = await listModel.getAll(id, {
                        response: 'single',
                        current: true,
                        listingId: nftData.marketplace.typeId
                    });
                    if (!listData) throw new Error('Item is not on sale!');
                    subModuleId = listData.id?.toString() || "";
                    price = listData.price || "0";
                    await listModel.update(subModuleId, {
                        status: "cancelled"
                    });
                    subType = 'cancelled_from_listing';
                    break;
                case "on_auction":
                    const auctionModel = new NftAuction(this.request, this.response);
                    const auctionData = await auctionModel.getAll(id, {
                        response: 'single',
                        current: true,
                        history: false,
                        winner: false,
                        auctionId: nftData.marketplace.typeId
                    });
                    if (!auctionData) throw new Error('Item is not on sale!');
                    subModuleId = auctionData.id?.toString() || "";
                    price = auctionData.maxBidPrice || "";
                    await auctionModel.update(subModuleId, {
                        status: "cancelled"
                    });
                    subType = 'cancelled_from_auction';
                    break;
                case "open_for_bids":
                    const offerModel = new NftOffer(this.request, this.response);
                    const offers = await offerModel.getAll(id, {
                        current: true,
                        history: false,
                        winner: false,
                        offerId: nftData.marketplace.typeId
                    });
                    for (let i = 0; i < offers.length; i++) {
                        const offer = offers[i];
                        if (offer) {
                            await offerModel.update(offer.id?.toString(), {
                                status: "cancelled"
                            });
                        }
                    }

                    subType = 'cancelled_from_offer';
                    break;
                default:
                    break;
            }

            const result = await this.update(id, {
                onSaleToken: "",
                onMarketPlace: false,
                marketplace: {},
                status: 'publish',
            });
            if (result) {
                this.request.method = 'POST';

                // Save NFT action history
                this.createHistory(
                    id,
                    'cancelled',
                    this.user.id,
                    nftData.createdBy,
                    inputData.transaction,
                    price,
                    nftData.marketplace.typeId
                );

                // Save NFT transaction history
                const ethTransaction = new EthTransaction(this.request, this.response);
                await ethTransaction.insert({
                    ...inputData.transaction,
                    type: "nft",
                    subType: subType,
                    moduleId: new ObjectId(id),
                    subModuleId: subModuleId ? new ObjectId(subModuleId) : "",
                    saleTypeId: nftData.marketplace.typeId
                });
                return {
                    status: true,
                    message: 'Item cancelled from sale'
                }
            }
            return {
                status: false,
                message: 'Item not cancelled from the sale'
            }
        } catch (error: any) {
            return {
                status: false,
                message: error.message || "Something went wrong"
            }
        }

    }

    refundOfferAmountToOfferer = async (id: string, inputData: RefundOfferProps) => {
        if (this.user?.role !== 'ADMIN') throw new Error("You are not Authenticated");
        const OfferModel = new NftOffer(this.request, this.response);
        return await OfferModel.refund(id, inputData);
    }

}