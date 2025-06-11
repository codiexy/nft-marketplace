import type { NextApiRequest, NextApiResponse } from 'next'
import { ContentManagement } from 'backend/models'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const contentModel = new ContentManagement(req, res);
        if (req.method === "POST") {
            const formData: any = req.body || {};
            const result = await contentModel.createOrUpdateAndDelete(formData);
            res.status(200).json({
                status: 'success',
                message: "Updated data in order.",
                data: formData,
                result
            })

        } else {
            const orderType: any = req.query.orderType;
            const content = await contentModel.get({ 'orderType': orderType });
            res.status(200).json({
                status: 'success',
                message: "",
                data: {
                    content
                }
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




