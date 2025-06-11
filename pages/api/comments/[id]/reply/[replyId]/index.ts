import { NextApiRequest, NextApiResponse } from "next";
import { CommentReply } from "backend/models";
import { getSession } from "utils/server/getSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const comment: any = new CommentReply(req, res);
        const { id, replyId }: any = req.query;
        if (req.method === "PUT") {
            const { status } = await getSession(req, res);
            if (!status) {
                throw new Error("You are not authenticated!");
            }
            const inputData: any = req.query.comment;
            const result = await comment.updateReplyComment(replyId, id, inputData);
            res.status(200).json({
                status: 'success',
                data: result
            })
        } else if (req.method === "DELETE") {
            const result = await comment.deleteReplyComment(replyId, id);
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