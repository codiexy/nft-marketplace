import { NextApiRequest, NextApiResponse } from "next";
import { NftComments } from "backend/models";
import { IsJsonString } from "helpers";
import { getSession } from "utils/server/getSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const comment = new NftComments(req, res);
        if (req.method === "POST") {
            const formData: any = req.body;
            const { status } = await getSession(req, res);
            if (!status) {
                throw new Error("You are not authenticated!");
            }
            const result = await comment.saveNftComment(formData);
            res.status(200).json({
                status: 'success',
                data: result
            })
        } else if (req.method === "GET") {
            const nftId: any = req.query.nftId
            const options: any = getOptions(req)
            const result = await comment.getCommentByNftId(nftId, options);
            res.status(200).json({
                status: 'success',
                message: "",
                data: result
            })
        } else {
            throw new Error("Invalid method");
        }
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            message: error.message || "something went wrong."
        });
    }
}

const getOptions = (req: NextApiRequest) => {
    let {
        limit = 0,
        skip = 0,
        sort = { "updatedAt": -1 },

    }: any = req.query;

    sort = IsJsonString(sort) ? IsJsonString(sort) : { "updatedAt": -1 };

    const options: any = {
        limit: parseInt(limit.toString()),
        skip: parseInt(skip.toString()),
        sort,
        match: {}
    };

    return options;
}
