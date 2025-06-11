import type { NextApiRequest, NextApiResponse } from 'next'
import { Theme  } from 'backend/models'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const themeModel = new Theme(req, res);
        if (req.method === "POST") {
            const formData: any = req.body || {};
            let data: any = [];
            if(typeof formData.data == "object" && formData.data.length) {
                for (let i = 0; i < formData.data.length; i++) {
                    const element = formData.data[i];
                    data.push(await themeModel.createOrUpdate(element.key, element.value));
                }
            } else {
                data.push(await themeModel.createOrUpdate(formData.key, formData.value));
            }
            res.status(200).json({
                status: 'success',
                message: "Create or updated ad setting data!",
                data
            })
        } 
        else {
            const query: any = req.query || {};
            let data: any = {};
            if(typeof query.key != "undefined" && query.key) {
                data = await themeModel.first(query.key, {}, 'key');
            } else {
                let options: any = {};

                if((typeof query.keys == "object" && query.keys.length) || (typeof query['keys[]'] == "object" && query['keys[]'].length)){
                    const keys: Array<string> = typeof query.keys == "object" ? query.keys : typeof query["keys[]"] ? query["keys[]"] : [];
                    if(keys.length) {
                        options["$match"] = { key: { $in: keys} };
                    }
                }
                let theme = await themeModel.aggregate([options]);
                data = {
                    theme
                }
            }
            res.status(200).json({
                status: 'success',
                message: "",
                data: data
            })
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




