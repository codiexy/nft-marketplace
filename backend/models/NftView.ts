import moment from 'moment';
import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'
import Model from "./Model";
import { Nft } from './Nft';

export class NftViews extends Model {

    constructor(req: NextApiRequest, res: NextApiResponse) {
        super("nft_views", req, res);
    }


    nftViewsByUser = async (nftId: string) => {
        const NftModel = new Nft(this.request, this.response);
        const nft = await NftModel.first(nftId)
        if (!nft) throw new Error("Invalid nft id!");

        const id = new ObjectId(nftId);
        const ipAddress = await this.getIpAddress();
        let isViewed = await this.aggregate([
            {
                $match: {
                    $and: [
                        { $expr: { $eq: ["$nftId", id] } },
                        { $expr: { $eq: ["$ip", ipAddress] } }
                    ]
                }
            }
        ], 'single');

        if (isViewed) {
            const currentDate = moment().valueOf();
            const prevDate = moment(isViewed.createdAt).add(1, 'days').valueOf();
            if (currentDate > prevDate) {
                isViewed = false;
            }
        }
        if(!isViewed) {
            await this.insert({ nftId: id, ip: ipAddress });
        }

    }
}