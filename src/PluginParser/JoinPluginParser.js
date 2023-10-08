import IdentityUtils from '../IdentityUtils.js'
import { PLUGIN_JOIN } from '../PluginsIdentity.js';

class JoinPluginParser {

    /**
     * 
     * @param {string} content 
     * @returns
     */
    parse(logParser, content) {
        
        const startIp = content.lastIndexOf('<') + 1;
        const finishIp = content.lastIndexOf('>');
        const ip = content.substring(startIp, finishIp)
        
        const finishSteamId = startIp - 6;
        const startSteamId = content.substring(0, finishSteamId).lastIndexOf('<') + 1;

        const steamid = content.substring(startSteamId, startIp - 6)
        const name = content.substring(6, startSteamId - 2);

        const info = {
            name,
            'steamid': IdentityUtils.steamIdStringToInt(steamid),
            'ip': IdentityUtils.ipStringToInt(ip)
        };

        if(finishIp + 1 !== content.length) {
            info.donate = true;
            if(content.substring(finishIp + 2) === 'с паролем') {
                info.password = true;
            } else {
                info.password = false;
            }
        }

        return info;
    }
}

export default JoinPluginParser;
