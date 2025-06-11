import { NextApiRequest, NextApiResponse } from "next";
import { NftComments } from "backend/models";
import { ObjectId } from "mongodb";
import { getSession } from "utils/server/getSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const comment: any = new NftComments(req, res);
        const { id }: any = req.query;
        const { status } = await getSession(req, res, true);
        if (!status) {
            throw new Error("You are not authenticated!");
        }
        if (req.method === "PUT") {
            const inputData: any = req.query.comment;
            const result = await comment.updateComment(id, inputData);
            res.status(200).json({
                status: 'success',
                data: result
            })
        } else if (req.method === "DELETE") {
            const result = await comment.deleteComment(id);
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

