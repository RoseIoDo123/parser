import Downloader, { LOGTYPE_SM } from './Downloader.js'
import args from './Args.js'
import LogParser from './LogParser.js'
import JoinPluginParser from './PluginParser/JoinPluginParser.js'
import CheatDetectPluginParser from './PluginParser/CheatDetectPluginParser.js'
import IdentityUtils from './IdentityUtils.js'
import LogSearch from './LogSearch.js'
import DateFormat from 'date-format'
import { PLUGIN_CHEAT_DETECT } from './PluginsIdentity.js'

const serverTypeIds = {
    'jail': [
        1016,
        2525,
        2622,
        4663,
        6186,
        6285,
        7414,
        7688,
        8334,
        11385
    ],
    'public': [
        3043,
        3107,
        4770,
        5408,
        6990,
        7898,
        8264
    ],
    'zombie': [
        409,
        5069,
        1912,
        2641,
        6274
    ]
}

const serverIds = [
    ...serverTypeIds['jail'],
    ...serverTypeIds['public'],
    ...serverTypeIds['zombie']
]

const getSelectedServerId = () => {
    if(typeof args["serverid"] === 'number') {
        const serverId = args["serverid"];
        if(serverIds.includes(serverId)) {
            return [serverId];
        }
    }

    const serverType = args['servertype'];
    if(!serverType) {
        return serverIds;
    }

    const ids = serverTypeIds[serverType];
    if(!ids) {
        console.log(`Unknown server type "${serverType}", force all server ids`)
        return serverIds;
    }

    return ids;
}

const cheatSteamId = [
    "STEAM_0:0:249420174",
"STEAM_0:0:448761569",
"STEAM_0:0:595639167",
"STEAM_0:0:107523318",
"STEAM_0:0:375140522",
"STEAM_0:0:948329049",
"STEAM_0:0:958111863",
"STEAM_0:0:388069841",
"STEAM_0:0:923658762",
"STEAM_0:0:590697123",
"STEAM_0:0:829750174",
"STEAM_0:0:981424275",
"STEAM_0:0:120993423",
"STEAM_0:0:724647572",
"STEAM_0:0:362060269",
"STEAM_0:0:259365811",
"STEAM_0:0:435476791",
"STEAM_0:0:933574283",
"STEAM_0:0:161171771",
"STEAM_0:0:607164703",
"STEAM_0:0:564594347",
"STEAM_0:0:987834708",
"STEAM_0:0:501279712",
"STEAM_0:0:210831131",
"STEAM_0:0:861391410",
"STEAM_0:0:768588403",
"STEAM_0:0:674284441",
"STEAM_0:0:115718568",
"STEAM_0:0:753823034",
"STEAM_0:0:577614241",
"STEAM_0:0:373852681",
"STEAM_0:0:104352830",
"STEAM_0:0:987772703",
"STEAM_0:0:617504670",
"STEAM_0:0:521292089",
"STEAM_0:0:422193454",
"STEAM_0:0:891963882",
"STEAM_0:0:727499360",
"STEAM_0:0:566242464",
"STEAM_0:0:304769888",
"STEAM_0:0:687620983",
"STEAM_0:0:967884365",
"STEAM_0:0:168271725",
"STEAM_0:0:651330929",
"STEAM_0:0:750394769",
"STEAM_0:0:975457503",
"STEAM_0:0:114050322",
"STEAM_0:0:130317506",
"STEAM_0:0:280808075",
"STEAM_0:0:771443106",
"STEAM_0:0:487228756",
"STEAM_0:0:695798082",
"STEAM_0:0:140937200",
"STEAM_0:0:109347705",
"STEAM_0:0:311485309",
"STEAM_0:0:476085422",
"STEAM_0:0:296750259",
"STEAM_0:0:938566849",
"STEAM_0:0:706411813",
"STEAM_0:0:504648348",
"STEAM_0:0:649474639",
"STEAM_0:0:649889731",
"STEAM_0:0:359910447",
"STEAM_0:0:712503490",
"STEAM_0:0:638341484",
"STEAM_0:0:379607350",
"STEAM_0:0:266393098",
"STEAM_0:0:256830253",
"STEAM_0:0:179438678",
"STEAM_0:0:713974655",
"STEAM_0:0:149611733",
"STEAM_0:0:717706316",
"STEAM_0:0:911897690",
"STEAM_0:0:657641911",
"STEAM_0:0:313768841",
"STEAM_0:0:350949640",
"STEAM_0:0:367766216",
"STEAM_0:0:345997038",
"STEAM_0:0:879023507",
"STEAM_0:0:493465219",
"STEAM_0:0:681361350",
"STEAM_0:0:691769133",
"STEAM_0:0:563029223",
"STEAM_0:0:277202461",
"STEAM_0:0:472533666",
"STEAM_0:0:172880399",
"STEAM_0:0:262060021",
"STEAM_0:0:954391302",
"STEAM_0:0:172180444",
"STEAM_0:0:470772937",
"STEAM_0:0:222528239",
"STEAM_0:0:730428856",
"STEAM_0:0:900568695",
"STEAM_0:0:111555067",
"STEAM_0:0:118150833",
"STEAM_0:0:113498994",
"STEAM_0:0:865206113",
"STEAM_0:0:455491251",
"STEAM_0:0:538990777",
"STEAM_0:0:887595991",
"STEAM_0:0:202735829",
"STEAM_0:0:341459404",
"STEAM_0:0:118307237",
"STEAM_0:0:708709356",
"STEAM_0:0:458770348",
"STEAM_0:0:746516139",
"STEAM_0:0:361656694",
"STEAM_0:0:660170063",
"STEAM_0:0:334071368",
"STEAM_0:0:727088686",
"STEAM_0:0:773613199",
"STEAM_0:0:707482213",
"STEAM_0:0:345115790",
"STEAM_0:0:445858944",
"STEAM_0:0:134639412",
"STEAM_0:0:411065610",
"STEAM_0:0:748078577",
"STEAM_0:0:463448223",
"STEAM_0:0:121153970",
"STEAM_0:0:929580476",
"STEAM_0:0:128681845",
"STEAM_0:0:556034023",
"STEAM_0:0:216910247",
"STEAM_0:0:933306821",
"STEAM_0:0:651967675",
"STEAM_0:0:932048143",
"STEAM_0:0:905706032",
"STEAM_0:0:513195233",
"STEAM_0:0:377869424",
"STEAM_0:0:113134360",
"STEAM_0:0:127153526",
"STEAM_0:0:207943030",
"STEAM_0:0:306860059",
"STEAM_0:0:199243728",
"STEAM_0:0:977777185",
"STEAM_0:0:757300723",
"STEAM_0:0:142237221",
"STEAM_0:0:772637726",
"STEAM_0:0:548986942",
"STEAM_0:0:604731063",
"STEAM_0:0:198296856",
"STEAM_0:0:293329616",
"STEAM_0:0:877723008",
"STEAM_0:0:315158924",
"STEAM_0:0:282074891",
"STEAM_0:0:722140211",
"STEAM_0:0:884748186",
"STEAM_0:0:433360317",
"STEAM_0:0:943001209",
"STEAM_0:0:352374903",
"STEAM_0:0:954723985",
"STEAM_0:0:257711267",
"STEAM_0:0:111761723",
"STEAM_0:0:212795739",
"STEAM_0:0:305709234",
"STEAM_0:0:155492407",
"STEAM_0:0:347973244",
"STEAM_0:0:185697111",
"STEAM_0:0:881908594",
"STEAM_0:0:539821689",
"STEAM_0:0:278997352",
"STEAM_0:0:975631105",
"STEAM_0:0:116748924",
"STEAM_0:0:892225567",
"STEAM_0:0:647456057",
"STEAM_0:0:703133684",
"STEAM_0:0:948410690",
"STEAM_0:0:297776783",
"STEAM_0:0:840272015",
"STEAM_0:0:113266802",
"STEAM_0:0:576815026",
"STEAM_0:0:794406765",
"STEAM_0:0:397018842",
"STEAM_0:0:598191693",
"STEAM_0:0:503217654",
"STEAM_0:0:533652979",
"STEAM_0:0:175112690",
"STEAM_0:0:584671830",
"STEAM_0:0:981332706",
"STEAM_0:0:144805561",
"STEAM_0:0:716278618",
"STEAM_0:0:673959849",
"STEAM_0:0:203006014",
"STEAM_0:0:770541009",
"STEAM_0:0:682650366",
"STEAM_0:0:176252152",
"STEAM_0:0:375881813",
"STEAM_0:0:379435370",
"STEAM_0:0:203356433",
"STEAM_0:0:277140010",
"STEAM_0:0:995502740",
"STEAM_0:0:835034186",
"STEAM_0:0:561184608",
"STEAM_0:0:695300086",
"STEAM_0:0:876721220",
"STEAM_0:0:424155703",
"STEAM_0:0:771029289",
"STEAM_0:0:676870218",
"STEAM_0:0:499814238",
"STEAM_0:0:571737903",
"STEAM_0:0:156868575",
"STEAM_0:0:968889084",
"STEAM_0:0:843159799",
"STEAM_0:0:201510468",
"STEAM_0:0:286541328",
"STEAM_0:0:378433395",
"STEAM_0:0:163354454",
"STEAM_0:0:687652749",
"STEAM_0:0:487331111",
"STEAM_0:0:795329615",
"STEAM_0:0:943921123",
"STEAM_0:0:916592350",
"STEAM_0:0:536767898",
"STEAM_0:0:366490360",
"STEAM_0:0:615990092",
"STEAM_0:0:769582551",
"STEAM_0:0:578323625",
"STEAM_0:0:495079756",
"STEAM_0:0:236973492",
"STEAM_0:0:164694138",
"STEAM_0:0:392410454",
"STEAM_0:0:793442057",
"STEAM_0:0:661156171",
"STEAM_0:0:356991909",
"STEAM_0:0:629241885",
"STEAM_0:0:553978026",
"STEAM_0:0:805257062",
"STEAM_0:0:937530574",
"STEAM_0:0:690552369",
"STEAM_0:0:315537386",
"STEAM_0:0:236886395",
"STEAM_0:0:990438901",
"STEAM_0:0:385086301",
"STEAM_0:0:877353129",
"STEAM_0:0:900399635",
"STEAM_0:0:329371041",
"STEAM_0:0:689332786",
"STEAM_0:0:164596052",
"STEAM_0:0:360702623",
"STEAM_0:0:849759380",
"STEAM_0:0:457445914",
"STEAM_0:0:151552544"

]

const logToString = (log) => {
    return `${DateFormat.asString('MM/dd/yyyy', log.date)}: <${log.name}><${IdentityUtils.steamIdIntToString(log.steamid)}><${IdentityUtils.ipIntToString(log.ip)}>`;
}

const searchSteamIds = (logSearch) => {
    for(const steamId of cheatSteamId) {
        const cheatJoinLogs = logSearch.searchJoinBySteamId(steamId);
        console.log(`"${steamId}":`)
        for(const cheatJoinLog of cheatJoinLogs) {
            /*const joinLogs = logSearch.searchJoinByIp(cheatJoinLog.ip);
            for(const joinLog of joinLogs) {
                if(joinLog.donate) {
                    console.log(`\t\t${logToString(joinLog)}`)
                }
            }*/

            if(cheatJoinLog.donate) {
                console.log(`\t${logToString(cheatJoinLog)}`)
            }
        }
    }
}

/**
 * 
 * @param {LogSearch} logSearch 
 */
const searchDetects = (logSearch) => {
    const detects = logSearch.searchPluginLogs(PLUGIN_CHEAT_DETECT);
    for(const detect of detects) {
        console.log(`Detect "${detect.name}", reason "${detect.reason}"`)
        const joinLog = logSearch.searchJoinPrevJoin(detect);
        if(!joinLog) {
            console.log(detect, 'error')
            continue;
        }

        console.log(`\t${logToString(joinLog)}`)
        const logsByIp = logSearch.searchJoinByIp(joinLog.ip);
        for(const log of logsByIp) {
            if(log.donate) {
                console.log(`\t\t${logToString(log)}`)
            }
        }
    }
}

const main = async() => {
    const selectedServerIds = getSelectedServerId();

    if(args["download"]) {
        const count = typeof args["download"] === 'number' ? args["download"] : 10;

        const downloader = new Downloader(selectedServerIds);
        await downloader.download(count, LOGTYPE_SM);
    }
	else
	{
		const logParser = new LogParser();
		logParser.setPluginParser('pcmds_cheat_detect.smx', new CheatDetectPluginParser())
		logParser.setPluginParser('interi_playerip.smx', new JoinPluginParser())
		await logParser.parseLogs(selectedServerIds);
		
		const logs = logParser.getLogs();

		const logSearch = new LogSearch(logs);
		
		if(args["search-detects"]) {
			searchDetects(logSearch);
		}
		
		if(args["search-steamids"]) {
			searchSteamIds(logSearch)
		}
		
	}
}

if(args["test"]) {
    test().catch(console.error);
} else {
    main().catch(console.error);
}