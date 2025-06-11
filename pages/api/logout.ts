// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { removeCookies } from 'cookies-next'

import { SECRET } from 'utils'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "PUT") {
        removeCookies(SECRET, { req, res });
        res.status(200).json({
            status: "success",
            message: "User logout"
        })
    } else {
        res.status(403)
            .json({
                status: "error",
                message: "Invalid method"
            });
    }
}
