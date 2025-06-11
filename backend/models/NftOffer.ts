import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'

import Model from "./Model";
import { Nft, MakeAOfferProps, AcceptOfferProps, RefundOfferProps } from './Nft';
import { EthTransaction } from './EthTransaction';
import moment from 'moment';
import { User } from './User';
import { NftOwner } from './NftOwner';

interface GetAllOptions {
    current?: boolean;
    response?: string;
    offerId?: string | number | undefined;
    history?: boolean;
    winner?: boolean;
    createdBy?: string | undefined;
}

export class NftOffer extends Model {

    collection: string = "nft_offers";

    constructor(req: NextApiRequest, res: NextApiResponse) {
        super("nft_offers", req, res);
    }

    async saveData(nftId: string, inputData: MakeAOfferProps) {
        try {
            const nftModel = new Nft(this.request, this.response);
            const nftData: any = await nftModel.first(nftId);
            if (!nftData) throw new Error("Invalid nft id");
            if (!nftData.onMarketPlace || nftData.marketplace.type !== "open_for_bids") throw new Error('Item is not on sale');
            if (parseFloat(inputData.price) <= 0) throw new Error("Offer price must be greater than zero");

            const result = await this.insert({
                nftId: new ObjectId(nftId),
                secret: nftData.onSaleToken,
                owner: new ObjectId(nftData.ownedBy),
                expiredOn: inputData.expiredDate,
                offerPrice: inputData.price,
                offerId: nftData.marketplace.typeId,
                status: "initiate"
            });
            if (result?._id) {
                const ethTransaction = new EthTransaction(this.request, this.response);
                await ethTransaction.insert({
                    ...inputData.transaction,
                    type: "nft",
                    subType: "make_a_offer",
                    moduleId: new ObjectId(nftId),
                    subModuleId: new ObjectId(result._id),
                    saleTypeId: nftData.marketplace.typeId
                });
                await nftModel.createHistory(
                    nftId,
                    'make_a_offer',
                    nftData.ownedBy,
                    nftData.createdBy,
                    inputData.transaction,
                    inputData.price,
                    nftData.marketplace.typeId
                );
                return result._id;
            } else {
                throw new Error("Something went wrong");
            }
        } catch (error: any) {
            throw new Error(error.message || "Something went wrong");
        }
    }

    async acceptOffer(nftId: string, inputData: AcceptOfferProps) {
        try {
            const nftModel = new Nft(this.request, this.response);
            const nftData: any = await nftModel.first(nftId);
            if (nftData) {
                const userModel = new User(this.request, this.response);
                const offerer = await userModel.first(inputData.offerer, {}, "ethAddress");
                if (!offerer) throw new Error('Invalid offerer!');
                if (!nftData.onMarketPlace || nftData.marketplace.type?.trim() !== "open_for_bids") throw new Error('Item is not on sale');
                const offerData = await this.getAll(nftId, {
                    response: "single",
                    current: true,
                    createdBy: offerer.id.toString()
                });
                if (!offerData) throw new Error('Invalid offer!');
                if (moment().isAfter(offerData.createdAt) && moment(offerData.expiredOn).isAfter(moment())) {
                    const result = await nftModel.update(nftId, {
                        marketplace: {},
                        onMarketPlace: false,
                        onSaleToken: "",
                        status: 'publish',
                        price: offerData.offerPrice,
                        ownedBy: new ObjectId(offerer.id)
                    });
                    if (result) {
                        // Save owner history of the item
                        const NftOwnerModel = new NftOwner(this.request, this.response);
                        await NftOwnerModel.saveData({
                            nftId: new ObjectId(nftId),
                            seller: new ObjectId(nftData.createdBy),
                            price: offerData.offerPrice,
                            owner: new ObjectId(offerer.id)
                        });
                        const ethTransaction = new EthTransaction(this.request, this.response);
                        await ethTransaction.insert({
                            ...inputData.transaction,
                            type: "nft",
                            subType: "accepted_offer",
                            moduleId: new ObjectId(nftId),
                            subModuleId: new ObjectId(offerer.id),
                            saleTypeId: nftData.marketplace.typeId
                        }, {
                            restricted: false
                        });
                        await nftModel.createHistory(
                            nftId,
                            'accepted_offer',
                            offerer.id,
                            nftData.createdBy,
                            inputData.transaction,
                            offerData.offerPrice,
                            nftData.marketplace.typeId
                        );
                        return result;
                    } else {
                        throw new Error("Something went wrong");
                    }
                } else {
                    throw new Error('Offer expired for the item!');
                }

            } else {
                throw new Error("Invalid nft id");
            }
        } catch (error: any) {
            throw new Error(error.message || "Something went wrong");
        }
    }

    async getAll(nftId: string, options: GetAllOptions = {}) {
        const nftModel = new Nft(this.request, this.response);
        const nftData = await nftModel.first(nftId);
        if (!nftData) throw new Error("Invalid nft id");
        const andOptions: any = [
            { nftId: new ObjectId(nftId) }
        ];
        if (options?.current) {
            andOptions.push({ secret: nftData.onSaleToken });
        }
        if (options?.offerId) {
            andOptions.push({ offerId: options.offerId });
        }
        if (options?.createdBy) {
            andOptions.push({ createdBy: new ObjectId(options.createdBy) });
        }

        const responseType = options?.response?.trim() == "single" ? 'single' : "multi";

        return this.aggregate([
            {
                $match: { $and: andOptions },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "offerer",
                }
            },
            { $unwind: "$offerer" },
        ], responseType)
    }

    refund = async (nftId: string, inputData: RefundOfferProps) => {
        try {
            const nftModel = new Nft(this.request, this.response);
            const nftData: any = await nftModel.first(nftId);
            if (!nftData) throw new Error("Invalid nft id");
            if (!nftData.onMarketPlace || nftData.marketplace.type?.trim() !== "open_for_bids") throw new Error('Item is not on sale');
            
            const offerData = await this.first(inputData.offerId);
            // if (!offerData) throw new Error("Invalid offer id!");

            const isExpired = moment().isAfter(offerData.expiredOn)
            if (!isExpired) throw new Error("Offer not expired yet!");

            const userModel = new User(this.request, this.response);
            const offerer = await userModel.first(offerData.offerer);
            if (!offerer) throw new Error('Invalid offerer!');

            const result = await this.update(offerData.id.toString(), {
                status: "refund"
            });
            if (result) {
                await nftModel.update(nftId, {
                    status: 'publish',
                    marketplace: {},
                    onMarketPlace: false,
                    onSaleToken: "",
                    price: offerData.offerPrice,
                    ownedBy: offerData.createdBy
                });
                const ethTransaction = new EthTransaction(this.request, this.response);
                await ethTransaction.insert({
                    ...inputData.transaction,
                    type: "nft",
                    subType: "refunded_offer",
                    moduleId: new ObjectId(nftId),
                    subModuleId: new ObjectId(offerer.id),
                    saleTypeId: nftData.marketplace.typeId
                }, {
                    restricted: false
                });
                await nftModel.createHistory(
                    nftId,
                    'refunded_offer',
                    offerer.id,
                    nftData.createdBy,
                    inputData.transaction,
                    offerData.offerPrice,
                    nftData.marketplace.typeId
                );
            }
            return result;
        } catch (error: any) {
            throw new Error(error.message || "Something went wrong");
        }
    }
}