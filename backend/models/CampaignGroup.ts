import { slugify } from 'helpers';
import type { NextApiRequest, NextApiResponse } from 'next'

import Model from "./Model";

export class CampaignGroup extends Model {

    constructor(req: NextApiRequest, res: NextApiResponse) {
        super("campaign_groups", req, res);
    }

    createOrFind = async (value: string, column: string = "name") => {
        let group = await this.first(value, {}, column);
        if(!group) {
            const res = await this.insert({
                name: value,
                slug: slugify(value),
                status: "publish"
            });
            group = await this.first(res._id);
        }
        return group;
    }

}