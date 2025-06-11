import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'
import { EthTransaction } from './EthTransaction';

import Model from "./Model";
import { Nft, PlaceABidProps, TransferNftItemProps } from './Nft';
import { NftAuctionHistory } from './NftAuctionHistory';

interface InputDataProps {
    transaction: any;
    startDate: Date | string;
    endDate: Date | string;
    bidPrice: string;
    secret: string;
    auctionId: string | number;
}

interface GetAllProps {
    history?: Boolean | undefined;
    winner?: Boolean | undefined;
    current?: Boolean | undefined;
    response?: string | undefined;
    auctionId?: string | number | undefined;
}

export class NftAuction extends Model {

    collection: string = "nft_auctions";

    constructor(req: NextApiRequest, res: NextApiResponse) {
        super("nft_auctions", req, res);
    }

    async saveData(nftId: string, inputData: InputDataProps) {
        const nftModel = new Nft(this.request, this.response);
        const nftData: any = await nftModel.first(nftId);
        if (!nftData) throw new Error("Invalid nft id");
        if (!nftData.onMarketPlace || nftData.marketplace.type?.trim() !== "timed_auction") throw new Error('Item is not on sale');
        if (parseFloat(inputData.bidPrice) <= 0) throw new Error("Minimum bid price must be greater than zero");

        const result = await this.insert({
            nftId: new ObjectId(nftId),
            startDate: inputData.startDate,
            endDate: inputData.endDate,
            initialBidPrice: inputData.bidPrice,
            minBidPrice: inputData.bidPrice,
            maxBidPrice: inputData.bidPrice,
            winner: "",
            secret: inputData.secret,
            auctionId: inputData.auctionId,
            status: 'initiate'
        });
        
        if (result?._id) {
            const ethTransaction = new EthTransaction(this.request, this.response);
            await ethTransaction.insert({
                ...inputData.transaction,
                type: "nft",
                subType: "create_auction",
                moduleId: new ObjectId(nftId),
                subModuleId: new ObjectId(result._id),
                saleTypeId: inputData.auctionId
            });
            await nftModel.createHistory(
                nftId,
                'create_auction',
                nftData.ownedBy,
                nftData.createdBy,
                inputData.transaction,
                inputData.bidPrice,
                inputData.auctionId
            );
            return result._id;
        } else {
            throw new Error("Something went wrong");
        }
    }

    async placeABid(nftId: string, inputData: PlaceABidProps) {
        const nftModel = new Nft(this.request, this.response);
        const nftData: any = await nftModel.first(nftId);
        if (!nftData) throw new Error("Invalid nft id");
        if (!nftData.onMarketPlace || nftData.status?.trim() !== "on_auction") throw new Error('Item is not on sale');
        const auctionData = await this.getAll(nftId, {
            current: true,
            response: "single"
        });
        if (!auctionData) throw new Error("Auction not found!");
        if (parseFloat(inputData.price) < parseFloat(auctionData.maxBidPrice)) throw new Error(`Bid price must be greater than ${auctionData.maxBidPrice}`);

        const auctionId = auctionData.id.toString();
        const result = await this.update(auctionId, {
            minBidPrice: auctionData.maxBidPrice,
            maxBidPrice: inputData.price,
            winner: new ObjectId(this.user.id)
        });
        if (result) {
            this.request.method = "POST";
            const auctionHistoryModel = new NftAuctionHistory(this.request, this.response);
            return await auctionHistoryModel.saveData(auctionId, {
                transaction: inputData.transaction,
                initialBid: auctionData.initialBidPrice,
                minBid: auctionData.maxBidPrice,
                maxBid: inputData.price,
                nftId: nftId,
                status: "bid_placed"
            });
        } else {
            throw new Error("Something went wrong");
        }
    }

    async getAll(nftId: string, options: GetAllProps) {
        options = {
            history: options?.history || true,
            winner: options?.winner || true,
            current: options?.current || false,
            response: options?.response?.trim() || "multi"
        };
        const nftModel = new Nft(this.request, this.response);
        const nftData = await nftModel.first(nftId);
        if (!nftData) throw new Error("Invalid nft id");
        const andOptions: any = [
            { nftId: new ObjectId(nftId) }
        ];
        if (options?.current) {
            andOptions.push({ secret: nftData.onSaleToken });
        }
        if (options?.auctionId) {
            andOptions.push({ auctionId: options.auctionId });
        }
        let auctionPipeline: any = [{
            $match: { $and: andOptions }
        }];
        if (options?.history) {
            auctionPipeline.push({
                $lookup: {
                    from: 'nft_auction_histories',
                    let: { nftId: "$_id" },
                    localField: '_id',
                    foreignField: 'auctionId',
                    as: 'auctionHistories',
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "nftOwner",
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "createdBy",
                                foreignField: "_id",
                                as: "bidder",
                            }
                        },
                        { $unwind: "$nftOwner" },
                        { $unwind: "$bidder" }
                    ]
                }
            });
        }
        if (options?.winner) {
            auctionPipeline.push({
                $lookup: {
                    from: "users",
                    localField: "winner",
                    foreignField: "_id",
                    as: "auctionWinner",
                }
            });
        }
        const response = options.response === "single" ? "single" : "multi";
        return this.aggregate(auctionPipeline, response);
    }

    transfer = async (id: string, inputData: TransferNftItemProps) => {
        const nftModel = new Nft(this.request, this.response);
        const nftData = await nftModel.first(id);
        if (nftData) {
            const { transaction, auctionId } = inputData;
            if (!Object.keys(transaction).length) throw new Error("Transaction must be required");
            if(!nftData.onMarketPlace || nftData.marketplace.type?.trim() !== "timed_auction") throw new Error("Item not on auction sale!");
            
            const auction = await this.getAll(id, {
                history: false,
                winner: false,
                current: true,
                response: 'single',
                auctionId: nftData.marketplace.typeId
            });
            
            if (!auction || auctionId !== auction.id.toString()) throw new Error("Auction data not found");
            let winner = auction.winner?.toString() || "";
            if (!winner) throw new Error("No winner found for this auction");
            
            const result = await this.update(auctionId, {
                status: "completed"
            });
            if (result) {
                await nftModel.update(id, {
                    status: 'publish',
                    marketplace: {},
                    onMarketPlace: false,
                    onSaleToken: "",
                    price: auction.maxBidPrice,
                    ownedBy: new ObjectId(winner)
                });
                this.request.method = 'POST';
                const ethTransaction = new EthTransaction(this.request, this.response);
                await ethTransaction.insert({
                    ...transaction,
                    type: "nft",
                    subType: "transfer_auction_item",
                    moduleId: new ObjectId(id),
                    subModuleId: new ObjectId(auctionId),
                    saleTypeId: nftData.marketplace.typeId
                });
                await nftModel.createHistory(
                    id,
                    'transfer_auction_item',
                    winner,
                    nftData.createdBy,
                    transaction,
                    auction.maxBidPrice,
                    nftData.marketplace.typeId
                );
                return result;
            }
        } else {
            throw new Error("Invalid nft id");
        }
    }

}