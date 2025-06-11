import { User as Auth } from 'utils/api/user';
import { NextApiRequest, NextApiResponse } from 'next'


export async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authUser = new Auth(req, res)
    if (authUser.isAuthenticate()) {
        res.status(200).json({
            ...authUser.get(),
            isLoggedIn: true,
        })
    } else {
        res.status(200).json({
            isLoggedIn: false,
        })
    }
}