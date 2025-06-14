import { ASSET_BASE_URL } from 'utils';
import { getBaseUrl } from './axios';

export * from './metamask'
export * from './web3'

export const trimString = (address: string, length = 4) => {
    const double = length * 2;
    address = typeof address == "string" && address.trim() ? address.trim() : '';
    if (address) {
        return address.length > double ? `${address.substring(0, double - 1)}...${address.substr(address.length - length - 1)}` : address;
    }
    return '';
}

export const trimUrl = (url = "") => {
    url = typeof url === "string" && url.trim() ? url.trim() : "";
    return url = url.charAt(0) == "/" ? `/${url.slice(1)}` : `/${url}`;
}

export const subString = (str: string, length = 25) => {
    str = str && str.trim() ? str.trim() : '';
    if (str) {
        return str.length > (length - 3) ? `${str.substring(0, length - 3)}...` : str;
    }
    return '';
}

export const toCaptalize = (str: string) => {
    if (str) { return str.charAt(0).toUpperCase() + str.slice(1) }
    return "";
}

export const slugify = (text: string) => {
    if (typeof text !== "string") return "";
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

export const getUiAvatar = (name: string, options = {}) => {
    name = name && name.trim() ? name.trim().replace(" ", "+") : "D+V";
    return `https://ui-avatars.com/api/?format=png&name=${name}&rounded=true&size=124`;
}

export const getColors = (length: number = 1) => {
    const colors = [];
    for (let index = 0; index < length; index++) {
        var randomColor = Math.floor(Math.random() * 16777215).toString(16);
        colors.push(`#${randomColor}`);
    }
    return colors;
}

export const IsJsonString = (str: string | any) => {
    try {
        return JSON.parse(str);
    } catch (e) {
        return str;
    }
}

export const checkYouOrNot = (loginUser: any, user: any) => {
    const isYou = loginUser?.id === user?.id;
    const href = `/creators/${isYou ? loginUser.id : user.id}`;
    return {
        href: href,
        text: isYou ? "you" : subString(user.username)
    }
}

export async function getBase64FromFile(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

export async function fileExist(src: string) {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', assetUrl(src), false);
    xhr.send();
     
    return xhr.status !== 404;
}

export const assetUrl = (url: string = "") => {
    let baseURL = ASSET_BASE_URL.trim() || "";
    url = typeof url === "string" ? url.trim() : "";
    baseURL = baseURL.slice(-1) === "/" ? baseURL : `${baseURL}/`;
    return url.charAt(0) == "/" ? `${baseURL}${url.substring(1)}` : `${baseURL}${url}`;
}


export default {
    trimString,
    trimUrl,
    subString,
    toCaptalize,
    slugify,
    getUiAvatar,
    getColors,
    IsJsonString,
    fileExist,
    assetUrl
};
