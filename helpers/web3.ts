import { IsJsonString } from "helpers";
import { INFURA_IPFS_BASE_URL } from "utils";

export const truncateAddress = (address: string | null | undefined, limit: number = 2) => {
    if (!address) return "";
    const match = address.match(
        /^(0x[a-zA-Z0-9]{2})[a-zA-Z0-9]+([a-zA-Z0-9]{2})$/
    );
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
};

export const toHex = (num: number) => {
    const val = Number(num);
    return "0x" + val.toString(16);
};

export const getKeyByValue = (value: any, array: any) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === value) return i;
    }
}

export const followStepError = (slug: string, message: string, defaultModal: any) => {
    var newModal: any = {};
    var count = 0;
    for (const key in defaultModal) {
        if (Object.prototype.hasOwnProperty.call(defaultModal, key)) {
            var modalValue = defaultModal[key];
            if (slug === key) {
                modalValue = {
                    ...modalValue,
                    isError: true,
                    errorMessage: message || "Something went wrong!"
                };
            } else {
                const slugKey = getKeyByValue(slug, Object.keys(defaultModal)) || 0;
                if (count < slugKey) {
                    modalValue = {
                        ...modalValue,
                        isComplete: true
                    }
                }
            }
            newModal[key] = modalValue;
        }
        count++;
    }
    return newModal;
}

export const getIPFSBaseUrl = (url: any = "") => {
    if(!url) return "";    
    const ipfsBaseUrl = INFURA_IPFS_BASE_URL.slice(-1) === "/" ? INFURA_IPFS_BASE_URL.slice(0, -1) : INFURA_IPFS_BASE_URL.trim();
    return `${ipfsBaseUrl}/${url}`;
}

export const formatSolidityError = (str: string) => {
    let message = "Something went wrong!";
    if (!str.trim()) return { message }
    if (typeof IsJsonString(str) === "object") return IsJsonString(str);

    var errorObjKeys: any = [];
    let errorObj: any = {};

    let firstIndexOfSimpleBrace = str.indexOf("(");
    let lastIndexOfSimpleBrace = str.indexOf(")");

    if (firstIndexOfSimpleBrace >= 0 && lastIndexOfSimpleBrace >= 0) {
        str = str.slice(firstIndexOfSimpleBrace + 1, lastIndexOfSimpleBrace);
        str = str.replace(/(\w+=)|(\w+ =)/g, function (matchedStr) {
            matchedStr = matchedStr.trim().slice(0, -1);
            errorObjKeys.push(matchedStr)
            return matchedStr.substring(0, matchedStr.length) + ":";
        });

        let splitTxt = str;
        for (let i = 0; i <= errorObjKeys.length; i++) {
            let key = errorObjKeys[i];
            if (typeof splitTxt !== "undefined") {
                let splitData = splitTxt.split(`${key}:`);
                if (i > 0) {
                    let data = splitData[0].trim() || "";
                    if (data.charAt(0) !== "{") {
                        data = data.slice(-1) == "," ? data.slice(0, -1) : data;
                    } else {
                        let splitText = data.slice(data.lastIndexOf("}") + 1).trim();
                        splitData[0] = splitText.charAt(0) == "," ? splitText.slice(1).trim() : splitText;
                        data = data.slice(0, data.lastIndexOf("}") + 1);
                    }
                    errorObj[errorObjKeys[i - 1]] = IsJsonString(data);
                }
                splitData = splitData.filter(data => data);
                splitTxt = i > 0 ? splitData[0] : splitData[splitData.length - 1];
            }
        }
        if (errorObj.hasOwnProperty("error") && typeof errorObj.error === "object") {
            let error = errorObj.error;
            error.message = error.message || message;
            delete errorObj.error;
            errorObj = {
                ...errorObj,
                ...error
            }
        }
        errorObj.message = errorObj.message || message;
    } else {
        errorObj.message = str;
    }
    if (errorObj.code === "ACTION_REJECTED") {
        errorObj.message = "You have reject the action!";
    }
    message = errorObj.message;
    message = message.replace("MetaMask Message Signature:", "")?.trim();
    message = message.replace("execution reverted:", "")?.trim();
    
    return {
        ...errorObj,
        message
    };
}
