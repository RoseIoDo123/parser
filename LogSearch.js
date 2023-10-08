import IdentityUtils from './IdentityUtils.js';
import { PLUGIN_JOIN } from './PluginsIdentity.js'

class LogSearch {
    constructor(logs) {
        this.logs = logs;
        this.joinLogs = this.searchPluginLogs(PLUGIN_JOIN);
    }

    searchPluginLogs(pluginId, serverId) {
        return this.logs.filter(log => {
            if(serverId !== undefined && log.sid !== serverId) {
                return false;
            }
            return log.plugin === pluginId;
        })
    }

    searchJoinPrevJoin(targetLog) {
        for(const log of this.joinLogs) {
            if(!targetLog.date || !log.date) {
                console.log(log, targetLog)
            }
            if(log.sid === targetLog.sid && log.date.getTime() <= targetLog.date.getTime() && log.name === targetLog.name) {
                return log;
            }
        }
        return null;
    }

    searchJoinByIp(ip) {
        const ipInt = typeof ip === "string" ? IdentityUtils.ipStringToInt(ip) : ip;
        return this.joinLogs.filter(log => log.ip === ipInt);
    }

    searchJoinBySteamId(steamid) {
        const steamIdInt = typeof steamid === "string" ? IdentityUtils.steamIdStringToInt(steamid) : steamid;
        return this.joinLogs.filter(log => log.steamid === steamIdInt);
    }
}

export default LogSearch;