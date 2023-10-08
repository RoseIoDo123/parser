
import IdentityUtils from '../IdentityUtils.js'

class CheatDetectPluginParser {
    parse(logParser, content) {
        const startSteamId = content.lastIndexOf('STEAM_');
        const finishSteamId = content.indexOf('>', startSteamId);
        const steamid = content.substring(startSteamId, finishSteamId)
        const name = content.substring(1, content.substring(0, startSteamId - 1).lastIndexOf('<'))
        const reason = content.substring(content.indexOf("\"", finishSteamId + 4) + 1, content.length - 1)
        const banned = content.indexOf('banned', finishSteamId) == -1 ? false : true;
        return {
            name,
            steamid: IdentityUtils.steamIdStringToInt(steamid),
            reason,
            banned
        };
    }
}

export default CheatDetectPluginParser;
