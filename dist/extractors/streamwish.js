"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../utils");
const serverName = "streamwish";
let sources = [];
const extract = async (videoUrl) => {
    try {
        const options = {
            headers: {
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "max-age=0",
                Priority: "u=0, i",
                "Sec-Ch-Ua": 'Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126',
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": "Windows",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1",
                "Referrer-Policy": "no-referrer-when-downgrade",
                Referer: videoUrl.href,
                "User-Agent": utils_1.USER_AGENT,
            },
        };
        const { data } = await axios_1.default.get(videoUrl.href, options);
        const links = data.match(/file:\s*"([^"]+)"/);
        let lastLink = null;
        links.forEach((link) => {
            if (link.includes('file:"')) {
                link = link.replace('file:"', "").replace(new RegExp('"', "g"), "");
            }
            sources.push({
                quality: lastLink ? "backup" : "default",
                url: link,
                isM3U8: link.includes(".m3u8"),
            });
            lastLink = link;
        });
        const m3u8Content = await axios_1.default.get(links[1], options);
        if (m3u8Content.data.includes("EXTM3U")) {
            const videoList = m3u8Content.data.split("#EXT-X-STREAM-INF:");
            for (const video of videoList !== null && videoList !== void 0 ? videoList : []) {
                if (!video.includes("m3u8"))
                    continue;
                const url = links[1].split("master.m3u8")[0] + video.split("\n")[1];
                const quality = video
                    .split("RESOLUTION=")[1]
                    .split(",")[0]
                    .split("x")[1];
                sources.push({
                    url: url,
                    quality: `${quality}p`,
                    isM3U8: url.includes(".m3u8"),
                });
            }
        }
        return sources;
    }
    catch (err) {
        throw new Error(err.message);
    }
};
//# sourceMappingURL=streamwish.js.map