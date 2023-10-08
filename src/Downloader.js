import fetch from "node-fetch";
import fs from "fs";
import htmlparser from 'node-html-parser';
import Bottleneck from "bottleneck";
import args from './Args.js'

export const LOGTYPE_SM = 2;


const MYARENA_COOKIES = `PHPSESSID=6h80kk51thu5sslkkk0rs202l7`
const MYARENA_USERAGENT = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 OPR/97.0.0.0`;

class Downloader {
    constructor(serverIds) {
        this.serverIds = serverIds;
        this.downloadLimiter = new Bottleneck({
            maxConcurrent: 1
        })
    }

    async download(maxFiles, logType, startFilesOffset) {
        if(logType === undefined) logType = LOGTYPE_SM;

        if(startFilesOffset === undefined) startFilesOffset = 0;

        for(const serverId of this.serverIds) {
            const filenames = await this.fetchServerLogList(serverId, logType)
            if(filenames.length < 1)
            {
                console.error(`[S-${serverId}]: no many logs files`)
                continue;
            }

            console.log(`[S-${serverId}]: found ${filenames.length} files`);

            const filesCount = filenames.length - startFilesOffset;
            const filesEnd = filesCount <= maxFiles ? filesCount : maxFiles;
            const limitedFileNames = filenames.slice(startFilesOffset, startFilesOffset + filesEnd);
            for(const fileIndex in limitedFileNames) {
                const filename = limitedFileNames[fileIndex];
                this.limitedDownloadLogFile(serverId, filename, logType)
            }
        }
    }

    async fetchServerLogList(serverId, logType) {
        const url = new URL('https://www.myarena.ru/home.php');
        const params = url.searchParams;
        params.set('m', 'gamemanager');
        params.set('p', 'logs');
        params.set('log', logType == LOGTYPE_SM ? 'sm' : '???');
        params.set('home', serverId);
        
        const referrerUrl = new URL('https://www.myarena.ru/home.php')
        const referrerParams = referrerUrl.searchParams;
        referrerParams.set('m', 'gamemanager');
        referrerParams.set('p', 'logs');
        referrerParams.set('home', serverId);
    
        const res = await fetch(url.toString(), {
            headers: {
                'Cookie': MYARENA_COOKIES,
                'User-Agent': MYARENA_USERAGENT
            },
            referrer: referrerUrl.toString()
        });
    
        const text = await res.text();
    
        const root = htmlparser.parse(text);
        const elements = root.querySelectorAll(`a[href^="?m=gamemanager&p=logs&home=${serverId}&log="]`);
        
        const filenames = [];
        for(const element of elements) {
            filenames.push(element.textContent)
        }
        return filenames;
    }

    async downloadLogFile(serverId, filename, logType) {
        const logsDir = 'logs'
        if(!(await fs.existsSync(logsDir))) {
            await fs.mkdirSync(logsDir)
        }
    
        const serverLogsDir = `${logsDir}/${serverId}`
        if(!(await fs.existsSync(serverLogsDir))) {
            await fs.mkdirSync(serverLogsDir)
        }
    
        const path = `${serverLogsDir}/${filename}`
        if(args["skip-exists"]) {
            if(await fs.existsSync(path)) {
                return;
            }
        }

        const hashPath = `${path}.hash`
        if(await fs.existsSync(hashPath)) {
            fs.unlinkSync(hashPath);
        }
        
        console.log(`[S-${serverId}]: downloading "${filename}"...`)
    
        const url = new URL('https://www.myarena.ru/ajax.php');
        const params = url.searchParams;
        params.set('home', serverId);
        params.set('logtype', logType);
        params.set('getlog', filename);
        
        const referrerUrl = new URL('https://www.myarena.ru/home.php')
        const referrerParams = referrerUrl.searchParams;
        referrerParams.set('m', 'gamemanager');
        referrerParams.set('p', 'logs');
        referrerParams.set('log', logType == LOGTYPE_SM ? 'sm' : '???');
        referrerParams.set('home', serverId);
    
        const res = await fetch(url.toString(), {
            headers: {
                'Cookie': MYARENA_COOKIES,
                'User-Agent': MYARENA_USERAGENT
				'X-Requested-With': 'XMLHttpRequest'
            },
            referrer: referrerUrl.toString()
        });

        const fileStream = fs.createWriteStream(path);
        await new Promise((resolve, reject) => {
            res.body.pipe(fileStream);
            res.body.on("error", reject);
            fileStream.on("finish", resolve);
        });
    }

    async limitedDownloadLogFile(serverId, filename, logType) {
        this.downloadLimiter.schedule((async() => {
            await this.downloadLogFile(serverId, filename, logType)
        }).bind(this))
    }
}

export default Downloader; 