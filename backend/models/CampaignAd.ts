import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'

import Model from "./Model";
import { Theme } from './Theme';

export class CampaignAd extends Model {

    protected defaultPipeline = [
        {
            $lookup: {
                from: "campaign_groups",
                localField: "group_id",
                foreignField: "_id",
                as: "group",
            },
        },
        {
            $lookup: {
                from: "ad_conversions",
                localField: "_id",
                foreignField: "campaignAdId",
                as: "ad_conversions_count",
                let: { type: "$type" },
                pipeline: [
                    { "$group": { _id: "$type", count: { $sum: 1 } } }
                ]
            },
        },
        { $unwind: "$group" },
    ]

    constructor(req: NextApiRequest, res: NextApiResponse) {
        super("campaign_ads", req, res);
    }

    getAll = async (options: any = []) => {
        options = typeof options == "object" && options.length ? options : [];
        const pipeline = [...this.defaultPipeline, ...options];
        const results = await this.aggregate(pipeline);
        const data = await results.map(async (ad: any) => {
            if (typeof ad.group != 'undefined') {
                ad.group.id = ad.group._id;
                delete ad.group._id;
                delete ad.group_id;
                ad.ad_conversions = await this.formatAdConversionsCountData(ad.ad_conversions_count);
                delete ad.ad_conversions_count;
            }
            return ad;
        });
        return await Promise.all(data.map(async (i: any) => await i));
    }

    find = async (value: any, options: any = {}, column: string = "_id") => {
        value = column == "_id" ? new ObjectId(value) : value;
        const defaultOptions: any = { $match: { [column]: value } };
        if (["undefined", "object"].includes(typeof options['$match'])) {
            for (const key in options['$match']) {
                if (Object.prototype.hasOwnProperty.call(options['$match'], key)) {
                    defaultOptions['$match'][key] = options['$match'][key];
                }
            }
        }
        const pipeline = [...this.defaultPipeline, defaultOptions];
        let result = await this.aggregate(pipeline, 'single');
        if (result) {
            result.group.id = result.group._id;
            delete result.group._id;
            result.ad_conversions = await this.formatAdConversionsCountData(result.ad_conversions_count);
            delete result.ad_conversions_count;
        }
        return result;
    }

    getShowAd = async () => {
        const options = { $match: { status: "publish" } };
        let notShowedAd = await this.find(false, options, "showed");
        if (!notShowedAd) {
            await this._updateMany({
                showed: false
            });
            notShowedAd = await this.find(false, options, "showed");
        }
        if (notShowedAd) {
            await this.update(notShowedAd.id.toString(), {
                showed: true
            });
        }
        return notShowedAd;
    }

    formatAdConversionsCountData = async (data: any = []) => {
        let adConversionData: any = {
            view: {},
            click: {}
        };
        if (typeof data != "undefined" && data.length) {
            const themeSettingModel = new Theme(this.request, this.response);
            let adConversionPriceData = await themeSettingModel.getAdConversionPriceData();
            for (let i = 0; i < data.length; i++) {
                let price = 0;
                if (data[i]._id == "view") {
                    adConversionData.view = {
                        count: data[i].count,
                        amount_used: (adConversionPriceData.per_view || 0) * data[i].count
                    }
                } else {
                    adConversionData.click = {
                        count: data[i].count,
                        amount_used: (adConversionPriceData.per_click || 0) * data[i].count
                    }
                }
            }
        }
        return adConversionData;
    }



}