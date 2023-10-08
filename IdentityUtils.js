

/**
 * 
 * @param {string} steamid 
 * @returns 
 */
export const steamIdStringToInt = (steamid) => {
    const matchs = [...steamid.matchAll(/STEAM_0:(\d):(\d+)/g)][0];
    if(!matchs) {
        return -1;
    }
    
    if(matchs.length < 3) {
        return -1;
    }

    const isSteam = parseInt(matchs[1]);
    const steamValue = parseInt(matchs[2]);
    return isSteam ? -steamValue : steamValue;
}

/**
 * 
 * @param {string} steamIdInt 
 * @returns 
 */
export const steamIdIntToString = (steamIdInt) => {
    if(steamIdInt < 0) {
        return `STEAM_0:1:${-steamIdInt}`
    } else {
        return `STEAM_0:0:${steamIdInt}`
    }
}

/**
 * 
 * @param {string} ip 
 * @returns 
 */
export const ipStringToInt = (ip) => {
    try {
        return ip.split('.').reduce(function(ipInt, octet) { return (ipInt<<8) + parseInt(octet, 10)}, 0) >>> 0;
    } catch(e) {
        console.log(`ipStringToInt: ${JSON.stringify(ip)}`)
        return -1;
    }
}

/**
 * 
 * @param {number} ipInt 
 * @returns 
 */
export const ipIntToString = (ipInt) => {
    return ( (ipInt>>>24) +'.' + (ipInt>>16 & 255) +'.' + (ipInt>>8 & 255) +'.' + (ipInt & 255) );
}

export default {
    ipStringToInt,
    ipIntToString,

    steamIdStringToInt,
    steamIdIntToString
}