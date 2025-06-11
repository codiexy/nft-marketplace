import type { NextApiRequest, NextApiResponse } from 'next'
import { adConversion, CampaignAd, Nft, Theme } from 'backend/models'
import { ObjectId } from 'mongodb';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === "GET") {
            const adAmount = await getCampaignAdData(req, res);
            res.status(200).json({
                status: 'success',
                message: "",
                data: {
                    dollar: adAmount,
                    cent: adAmount * 100
                }
            })
        } else {
            throw new Error("Invalid method!");
        }
    } catch (error: any) {
        res
            .status(500)
            .json({
                status: "error",
                message: error.message || "something went wrong."
            });
    }
}

async function getCampaignAdData(req: NextApiRequest, res: NextApiResponse) {

    const adConversionModel = new adConversion(req, res);
    let nftId: any = req.query.id;
    const nftModel = new Nft(req, res);
    const nftData = await nftModel.first(nftId);
    if (!nftData) {
        throw new Error("Invalid nft Id!");
    }
    const options = [
        {
            $match: {
                $and: [
                    { $expr: { $eq: ["$nftId", new ObjectId(nftId)] } },
                    { $expr: { $eq: ["$onSaleToken", nftData.onSaleToken] } },
                ]
            }
        },
        { "$group": { _id: "$type", count: { $sum: 1 } } }
    ];
    const results = await adConversionModel.getAll(options);
    let adConversionPrice: any = [];
    if (results.length) {
        const themeSettingModel = new Theme(req, res);
        let adConversionPriceData = await themeSettingModel.getAdConversionPriceData();
        for (let i = 0; i < results.length; i++) {
            let price = 0;
            if(results[i].id == "view") {
                price = (adConversionPriceData.per_view || 0) * results[i].count;
            } else {
                price = (adConversionPriceData.per_click || 0) * results[i].count;
            }
            adConversionPrice.push(price);
        }
    }
    const totalAdAmount = adConversionPrice.reduce((a: number, b: number) => a + b, 0);
    return parseFloat(totalAdAmount.toFixed(2));
}




