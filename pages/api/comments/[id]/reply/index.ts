import { NextApiRequest, NextApiResponse } from "next";
import { CommentReply } from "backend/models";
import { getSession } from "utils/server/getSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const replyComment: any = new CommentReply(req, res);
        const { id } = req.query
        if (req.method === "POST") {
            const { status } = await getSession(req, res);
            if (!status) {
                throw new Error("You are not authenticated!");
            }
            const formData: any = req.body;
            const result = await replyComment.saveReplyComment(id, formData);
            res.status(200).json({
                status: 'success',
                data: result
            })
        } else if (req.method === "GET") {
            const result = await replyComment.getReplyComment(id);
            res.status(200).json({
                status: 'success',
                message: "",
                data: result
            })

        }
        else {
            throw new Error("Invalid method");
        }
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            message: error.message || "something went wrong."
        });
    }
}

// const getOptions = (req: NextApiRequest) => {
//     let {
//         limit = 0,
//         skip = 0,
//         sort = { "updatedAt": -1 },

//     }: any = req.query;

//     sort = IsJsonString(sort) ? IsJsonString(sort) : { "updatedAt": -1 };

//     const options: any = {
//         limit: parseInt(limit.toString()),
//         skip: parseInt(skip.toString()),
//         sort,
//         match: {}
//     };

//     return options;
// }
