import { sign, verify } from 'jsonwebtoken'

export class JWT {

    private secret: string = "diamond-verse-secret";
    private expiresIn: string = "3h";

    constructor(
        secret?: string | undefined,
        expiresIn?: string | undefined,
    ) {
        if(typeof expiresIn !== "undefined") this.expiresIn = expiresIn;
        if(typeof secret !== "undefined") this.secret = secret;
    }

    createToken = (data: string | object | Buffer) => {
        const token = sign(data, this.secret, { expiresIn: this.expiresIn });
        return token;
    }

    varifyToken = (token: string) => {
        try {
            var decoded = verify(token, this.secret);
            return decoded;
        } catch (error: any) {
            console.error(error.message)
            return false;
        }
    }

    // getTokenData = () => {
    //     const token = getCookie(this.csrfToken);
    //     if(typeof token === "string") {
    //         return this.varifyToken(token);
    //     }
    //     return false;
    // }

    deleteToken = () => {
        
    }
}