import moment from 'moment';
import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'
import { CampaignAd } from './CampaignAd';

import Model from "./Model";
import { Nft } from './Nft';
import { Theme } from './Theme';

export class adConversion extends Model {

    protected defaultPipeline = [
        // {
        //     $lookup: {
        //         from: "nfts",
        //         localField: "nftId",
        //         foreignField: "_id",
        //         as: "nft",
        //     },
        // },
        // { $unwind: "$nft" },
        // {
        //     $lookup: {
        //         from: "campaign_ads",
        //         localField: "campaignAdId",
        //         foreignField: "_id",
        //         as: "campaign_ad",
        //         pipeline: [
        //             {
        //                 $lookup: {
        //                     from: "ad_conversions",
        //                     localField: "_id",
        //                     foreignField: "campaignAdId",
        //                     as: "ad_conversions_count",
        //                     let: { type: "$type" },
        //                     pipeline: [
        //                         { "$group": { _id: "$type", count: { $sum: 1 } } }
        //                     ]
        //                 },
        //             },
        //         ]
        //     },
        // },
        // { $unwind: "$campaign_ad" },
    ]
    constructor(req: NextApiRequest, res: NextApiResponse) {
        super("ad_conversions", req, res);
    }

    clickOrViewAd = async (adId: string, nftId: string, type: string = "view") => {
        const NftModel = new Nft(this.request, this.response);
        const nft = await NftModel.first(nftId)
        if (!nft) throw new Error("Invalid nft id!");
        if (nft.onMarketPlace) {
            const ipAddress = await this.getIpAddress();
            type = type ? type : 'view';
            const pipeline = [
                {
                    $match: {
                        $and: [
                            { $expr: { $eq: ["$type", type] } },
                            { $expr: { $eq: ["$ip", ipAddress] } },
                            { $expr: { $eq: ["$nftId", new ObjectId(nftId)] } },
                            { $expr: { $eq: ["$campaignAdId", new ObjectId(adId)] } },
                            { $expr: { $eq: ["$onSaleToken", nft.onSaleToken] } },
                        ]
                    }
                }
            ];
            // return pipeline
            let alreadyClickedOrViewed = await this.aggregate(pipeline, "single");
            if (alreadyClickedOrViewed) {
                const currentDate = moment().valueOf();
                const prevDate = moment(alreadyClickedOrViewed.createdAt).add(1, 'days').valueOf();
                if (currentDate > prevDate) {
                    alreadyClickedOrViewed = false;
                }
            }
            if (!alreadyClickedOrViewed) {
                await this._create({
                    nftId: new ObjectId(nftId),
                    type,
                    ip: ipAddress,
                    campaignAdId: new ObjectId(adId),
                    onSaleToken: nft.onSaleToken,
                    createdAt: new Date()
                });
                const themeModel = new Theme(this.request, this.response);
                const typeAdData = await themeModel.first(`per_${type}`, {}, 'key');
                if (typeAdData) {
                    const campaignAdModel = new CampaignAd(this.request, this.response);
                    const campaignAdData = await campaignAdModel.first(adId);
                    const balance = campaignAdData.balance - typeAdData.value;
                    await campaignAdModel._update({
                        balance
                    }, {
                        _id: new ObjectId(adId)
                    })
                } else {
                    throw new Error(`Please connect to admin for per_${type} price!`);

                }
            }

        }

    }

    getAll = async (options: any = []) => {
        const pipeline = [...this.defaultPipeline, ...options];
        return await this.aggregate(pipeline);
    }

}