import fs from 'fs'
import readline from 'readline';
import { BSON, Binary } from 'bson'
import crypto from 'crypto';
import args from './Args.js'
import PluginsIdentity from './PluginsIdentity.js';

class LogParser {
    constructor() {
        this.pluginParsers = { }
        this.logs = []
    }

    parseDateString(dateString) {
        const matchs = [...dateString.matchAll(/(\d{2})\/(\d{2})\/(\d{4}) \- (\d{2}):(\d{2}):(\d{2})/g)];
        if(matchs.length < 1) {
            if(args["verbose"]) {
                console.error(`LogParser::parseDateString: wrong date format #1 (${dateString})`)
            }
            return null;
        }
    
        const match = matchs[0]
        if(match.length < 7) {
            if(args["verbose"]) {
                console.error(`LogParser::parseDateString: wrong date format #2 (${dateString})`)
            }
            return null;
        }
    
        const date = new Date();
        date.setUTCMonth(parseInt(match[1]) - 1);
        date.setUTCDate(parseInt(match[2]));
        date.setUTCFullYear(parseInt(match[3]))
    
        date.setUTCHours(parseInt(match[4]))
        date.setUTCMinutes(parseInt(match[5]))
        date.setUTCSeconds(parseInt(match[6]))
        
        return date
    }

    async getHashFile(path) {
        if(args["update-hash"]) {
            return await this.makeHashFile(path);
        }

        try {
            const hash = await fs.readFileSync(`${path}.hash`);
            return hash;
        } catch(e) {
            return await this.makeHashFile(path);
        }
    }

    async makeHashFile(path) {
        const fileBuffer = await fs.readFileSync(path);
        const hashSum = crypto.createHash('sha1');
        hashSum.update(fileBuffer);
        const hash = hashSum.digest();
        await fs.writeFileSync(`${path}.hash`, hash)
        return hash;
    }

    async tryLoadIndexedLogs(serverId, path) {
        try {
            if(!(await fs.existsSync(`${path}.index`))) {
                return null;
            }

            const buffer = await fs.readFileSync(`${path}.index`);
            const doc = BSON.deserialize(buffer);
            const fileHash = await this.getHashFile(path);
            if(typeof doc.hash.value !== 'function') {
                console.log(doc.hash, fileHash)
            }
            if(Buffer.compare(doc.hash.value(true), fileHash) !== 0) {
                if(args["verbose"]) {
                    console.error(`LogParser::tryLoadIndexedLogs: File "${path}" updated`)
                }
                return null;
            }
            return doc.logs;
        } catch(e) {
            if(e.errno === -4058 /* no such file*/) {
                return null;
            }
            console.error(`LogParser::tryLoadIndexedLogs: ${e.message} (${path})`)
            return null;
        }
    }

    async parseServerLogs(serverId, path) {
        const fileStream = fs.createReadStream(path);
    
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        const logs = [];
    
        for await (const line of rl) {
            if(line.length < 26) {
                //console.error(`wrong line length: "${line}"`)
                continue;
            }
    
            const finishPluginName = line.indexOf(']', 26);
            const plugin = line.substring(26, finishPluginName);
            const pluginParser = this.getPluginParser(plugin);
            if(!pluginParser) {
                if(args["verbose"]) {
                    if(plugin.endsWith('.smx')) {
                        console.log(`No parser for plugin "${plugin}"`)
                    }
                }
                continue;
            }
    
            const logContent = line.substring(finishPluginName + 2);
            const result = pluginParser.parse(this, logContent);
            if(result) {
                const dateString = line.substring(2, 23);
                const date = this.parseDateString(dateString);

                result.sid = serverId;
                result.date = date;
                //result.date_ = dateString;
                
                result.plugin = PluginsIdentity[plugin]
                logs.push(result);
            }
        }
        return logs;
    }

    async saveIndexedLog(path, logs) {
        const fileHash = await this.getHashFile(path);
        const serializedLogs = BSON.serialize({ 'logs': logs, 'hash': fileHash });

        const indexPath = `${path}.index`;
        await fs.writeFileSync(indexPath, serializedLogs);

        //console.log(`LogParser::saveIndexedLog: indexed "${path}"`)
    }

    async parseLogs(ids) {
        for(const serverId of ids) {
            console.log(`[S-${serverId}]: parsing...`)
            const filenames = await fs.readdirSync(`logs/${serverId}`);
            for(const filename of filenames) {
                const path = `logs/${serverId}/${filename}`
                if(!path.endsWith('.log')) {
                    if(args["verbose"]) {
                        if(!path.endsWith('.index') && !path.endsWith('.hash')) {
                            console.log(`LogParser::parseLogs: ignored path "${path}"`);
                        }
                    }
                    continue;
                }

                //console.log(`[S-${serverId}]: parse "${path}"...`)

                if(!args["no-cache"]) {
                    const indexedLogs = await this.tryLoadIndexedLogs(serverId, path);
                    if(indexedLogs) {
                        this.logs.push(...indexedLogs);
                        continue;
                    }
                }

                const logs = await this.parseServerLogs(serverId, path);
                await this.saveIndexedLog(path, logs);
                this.logs.push(...logs);
            }
        }
    } 

    getPluginParser(plugin) {
        const pluginParser = this.pluginParsers[plugin];
        if(!pluginParser) {
            return null;
        }
        return pluginParser;
    }

    setPluginParser(plugin, parser) {
        this.pluginParsers[plugin] = parser;
    }

    getLogs() {
        const maxDays = typeof args["max-days"] === 'number' ? args["max-days"] : 7;
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() - maxDays);
        
        return this.logs.filter(log => {
            if(log.date.getTime() < maxDate.getTime()) {
                return false;
            }
            return true;
        }).sort((a, b) => {
            if(a.date > b.date) {
                return -1;
            } else if(a.date < b.date) {
                return 1
            } else {
                return 0;
            }
        });
    }
}

export default LogParser;