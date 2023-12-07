"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStore = void 0;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const urls_1 = require("./urls");
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
function getStore(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const brw = yield puppeteer_extra_1.default.launch({ headless: false, protocolTimeout: 0, });
        const pge = yield brw.newPage();
        const result = Array();
        yield pge.setViewport({ height: 1920, width: 1080 });
        yield performence(pge);
        let name = null;
        let today = null;
        let total = null;
        let rank = null;
        let interest = null;
        try {
            yield pge.goto(url + '/category/ALL?dt=LIST', { waitUntil: 'domcontentloaded' });
            yield pge.waitForSelector('#CategoryProducts > ul');
            yield pge.waitForSelector('#CategoryProducts > div._1HJarNZHiI._2UJrM31-Ry > a');
            yield pge.waitForSelector('#CategoryProducts > ul > li');
            try {
                name = yield getStoreName(pge);
                today = yield pge.evaluate(() => {
                    return document.querySelector('#pc-sellerInfoWidget > div > div > div:nth-child(2) > div > span > em') !== null ?
                        document.querySelector('#pc-sellerInfoWidget > div > div > div:nth-child(2) > div > span > em').textContent :
                        null;
                });
                rank = yield pge.$eval('#pc-sellerInfoWidget > div > div > div > div > span:nth-child(3)', ele => ele.textContent);
                interest = yield pge.evaluate(() => {
                    const element = document.querySelector('#header > div > div:nth-child(2) > div');
                    if (element) {
                        return element.innerHTML.split('<!-- -->')[1].split('<')[0];
                    }
                    if (document.querySelector('._3Te07yM0Z_ > div > div > div > div:nth-child(2) > div > span')) {
                        return document.querySelector('._3Te07yM0Z_ > div > div > div > div:nth-child(2) > div > span').innerHTML.split('<!-- -->')[1].split('<')[0];
                    }
                });
            }
            catch (err) {
                console.log(err);
            }
            while (true) {
                const numbers = yield pge.$$('#CategoryProducts .UWN4IvaQza');
                for (const num of numbers) {
                    const btnText = yield pge.evaluate(num => num.textContent, num);
                    if (btnText !== "이전" && btnText !== "다음") {
                        yield num.click();
                        yield delay(1500);
                    }
                    debugger;
                    const sells = yield pge.evaluate(() => {
                        const r = new Array();
                        const boxs = document.querySelectorAll('#CategoryProducts > ul > li');
                        for (const box of boxs) {
                            const childCnt = box.querySelector('div:nth-child(2) > div').childElementCount;
                            let title = "";
                            let price = "";
                            let dc = null;
                            let score = "";
                            let reviews = "";
                            if (childCnt >= 3) {
                                title = box.querySelector('div:nth-child(2) > strong').textContent;
                                price = box.querySelector('div:nth-child(2) > div > strong:nth-child(2) > span:nth-child(1)').textContent;
                                dc = box.querySelector('div:nth-child(2) > div > strong:nth-child(1)').textContent.replace('할인', '');
                            }
                            else {
                                title = box.querySelector('div:nth-child(2) > strong').textContent;
                                price = box.querySelector('div:nth-child(2) > div > strong > span:nth-child(1)').textContent;
                            }
                            const scoreElement = box.querySelector('div:nth-child(5) > div:nth-child(1) > em');
                            const reviewsElement = box.querySelector('div:nth-child(5) > div:nth-child(2) > em');
                            score = scoreElement !== null ? scoreElement.textContent : null;
                            reviews = reviewsElement != null ? reviewsElement.textContent : null;
                            r.push({
                                title, price, dc,
                                keywords: title.replace(/[\(\)\[\]\/_]/g, '').split(' ').filter(key => key !== ""),
                                score, reviews
                            });
                        }
                        return r;
                    });
                    result.push(...sells);
                }
                try {
                    const nextBtnElement = yield pge.$('#CategoryProducts > div._1HJarNZHiI._2UJrM31-Ry > a.fAUKm1ewwo._2Ar8-aEUTq');
                    if (nextBtnElement) {
                        yield nextBtnElement.click();
                        yield delay(2000);
                    }
                }
                catch (_a) {
                    break;
                }
            }
        }
        catch (_b) {
            brw.close();
        }
        finally {
            brw.close();
        }
        return { name, todayVisit: today, totalVisit: total, rank, cloud: [...createKeywordCloud(result, 0)], sells: result, interest };
    });
}
exports.getStore = getStore;
function getStoreName(pge) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield pge.evaluate(() => document.title);
    });
}
function createKeywordCloud(data, cond) {
    let map = new Map();
    for (const item of data) {
        for (const keyword of item.keywords) {
            if (!map.has(keyword)) {
                map.set(keyword, 1);
            }
            else {
                map.set(keyword, map.get(keyword) + 1);
            }
        }
    }
    return new Map(Array.from(map).filter(([_, value]) => value > cond));
}
function performence(page) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.setRequestInterception(true);
        page.on('request', (request) => __awaiter(this, void 0, void 0, function* () {
            if (request.resourceType() == 'image' || request.resourceType() == 'font' || request.resourceType() == 'stylesheet') {
                yield request.abort();
            }
            else {
                yield request.continue();
            }
        }));
    });
}
function getBestDailyKeywords(browser) {
    return __awaiter(this, void 0, void 0, function* () { return yield getKeywords(browser, urls_1.BEST_KEYWORD_DAILY_URL); });
}
function getBestWeeklyKeywords(browser) {
    return __awaiter(this, void 0, void 0, function* () { return yield getKeywords(browser, urls_1.BEST_KEYWORD_WEKKLY_URL); });
}
function getKeywords(browser, url) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const pge = yield browser.newPage();
        yield pge.goto(url, { waitUntil: 'domcontentloaded' });
        yield pge.waitForSelector('.category_category_contents__oVtaX > div.category_panel > div.category_keyword_wrap__r__vz > ul > li');
        const result = new Array();
        for (const item of yield pge.$$('.category_category_contents__oVtaX > div.category_panel > div.category_keyword_wrap__r__vz > ul > li')) {
            const ele = yield item.$('a');
            const arr = (_a = (yield (ele === null || ele === void 0 ? void 0 : ele.evaluate(ele => ele.innerText, ele)))) === null || _a === void 0 ? void 0 : _a.split('\n');
            const keyword = arr[2].includes('상승') ? arr[2].split('상승')[1] : arr[2].split('하락')[1];
            const rank = Number(arr[0]);
            result.push({ keyword, rank });
        }
        return result;
    });
}
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}
//# sourceMappingURL=crawl.js.map