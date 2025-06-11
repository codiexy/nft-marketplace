import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'
import Model from "./Model";

export class Theme extends Model {

    constructor(req: NextApiRequest, res: NextApiResponse) {
        super("themes", req, res);
    }

    async createOrUpdate(key: string, value: string = "") {
        const isExist = await this.first(value, {}, key);
        if (!isExist) {
            const res = await this.insert({
                key,
                value,
                status: true
            });
            return res._id;
        }
        await this.update(isExist.id, { key, value });
        return isExist.id;
    }

    async getAdConversionPriceData() {
        let results = await this.aggregate([{ $match: { key: { $in: ['per_view', 'per_click'] } } }]);
        let data: any = {};
        if (results.length) {
            for (let i = 0; i < results.length; i++) {
                data[results[i].key] = parseFloat(results[i].value);
            }
        }
        return data;
    }

}