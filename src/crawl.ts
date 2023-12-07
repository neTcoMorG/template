
import puppeteer from "puppeteer-extra"
import stealth   from 'puppeteer-extra-plugin-stealth'
import { Keyword, Sell, Store } from "./types"
import { BEST_KEYWORD_DAILY_URL, BEST_KEYWORD_WEKKLY_URL } from "./urls"
import { Page } from "puppeteer";

puppeteer.use(stealth());

export async function getStore (url: string): Promise<Store> {
    const brw = await puppeteer.launch({ headless: false, protocolTimeout: 0, })
    const pge = await brw.newPage()
    const result: Array<Sell> = Array()
    await pge.setViewport({ height: 1920, width: 1080 })

    await performence(pge)

    let name:  string    = null
    let today: string    = null
    let total: string    = null
    let rank : string    = null
    let interest: string = null

    try {
        await pge.goto(url + '/category/ALL?dt=LIST', {waitUntil: 'domcontentloaded'})

        await pge.waitForSelector('#CategoryProducts > ul')
        await pge.waitForSelector('#CategoryProducts > div._1HJarNZHiI._2UJrM31-Ry > a')
        await pge.waitForSelector('#CategoryProducts > ul > li')
        


        try {
            name  = await getStoreName(pge)
            today = await pge.evaluate(() => {
                return document.querySelector('#pc-sellerInfoWidget > div > div > div:nth-child(2) > div > span > em') !== null ? 
                    document.querySelector('#pc-sellerInfoWidget > div > div > div:nth-child(2) > div > span > em').textContent : 
                    null
            }) 
            rank = await pge.$eval('#pc-sellerInfoWidget > div > div > div > div > span:nth-child(3)', ele => ele.textContent)
            interest = await pge.evaluate(() => {
                const element = document.querySelector('#header > div > div:nth-child(2) > div')
                if (element) {
                    return element.innerHTML.split('<!-- -->')[1].split('<')[0]
                }
                if (document.querySelector('._3Te07yM0Z_ > div > div > div > div:nth-child(2) > div > span')) {
                    return document.querySelector('._3Te07yM0Z_ > div > div > div > div:nth-child(2) > div > span').innerHTML.split('<!-- -->')[1].split('<')[0]
                }
            })
        }
        catch(err) { console.log(err) }

        while(true) {
            const numbers = await pge.$$('#CategoryProducts .UWN4IvaQza')
    
            for (const num of numbers) {    
                const btnText = await pge.evaluate(num => num.textContent, num)
                if (btnText !== "이전" && btnText !== "다음") {
                    await num.click()
                    await delay(1500)
                }
    
                debugger
                const sells = await pge.evaluate(() => {
                    const r = new Array()
                    const boxs = document.querySelectorAll('#CategoryProducts > ul > li')
    
                    for (const box of boxs) {
                        const childCnt = box.querySelector('div:nth-child(2) > div').childElementCount
                        let title   = ""
                        let price   = ""
                        let dc      = null
                        let score   = ""
                        let reviews = ""
    
                        if (childCnt >= 3) {
                            title = box.querySelector('div:nth-child(2) > strong').textContent                    
                            price = box.querySelector('div:nth-child(2) > div > strong:nth-child(2) > span:nth-child(1)').textContent
                            dc    = box.querySelector('div:nth-child(2) > div > strong:nth-child(1)').textContent.replace('할인', '')
                        }
                        else {
                            title = box.querySelector('div:nth-child(2) > strong').textContent
                            price = box.querySelector('div:nth-child(2) > div > strong > span:nth-child(1)').textContent
                        }

                        const scoreElement = box.querySelector('div:nth-child(5) > div:nth-child(1) > em')
                        const reviewsElement = box.querySelector('div:nth-child(5) > div:nth-child(2) > em')
                        score = scoreElement !== null ? scoreElement.textContent : null
                        reviews = reviewsElement != null ? reviewsElement.textContent : null
    
                        r.push({
                            title, price, dc, 
                            keywords: title.replace(/[\(\)\[\]\/_]/g, '').split(' ').filter(key => key !== ""), 
                            score, reviews})
                    }
                    return r
                })
    
                result.push(...sells)
            }
        
            try {
                const nextBtnElement = await pge.$('#CategoryProducts > div._1HJarNZHiI._2UJrM31-Ry > a.fAUKm1ewwo._2Ar8-aEUTq')
                if (nextBtnElement) {
                    await nextBtnElement.click()
                    await delay(2000)
                }
            }
    
            catch { break }
        }        
    }
    catch { brw.close() }
    finally { brw.close() }
    
    return {name, todayVisit: today, totalVisit: total, rank, cloud: [...createKeywordCloud(result, 0)], sells: result, interest}
}
async function getStoreName (pge: Page): Promise<string> {
    return await pge.evaluate(() => document.title)
}
function createKeywordCloud (data: Array<Sell>, cond: number): Map<any, any> {
    let map: Map<string, number> = new Map()
    for (const item of data) {
        for (const keyword of item.keywords) {
            if (!map.has(keyword)) { map.set(keyword, 1) }
            else { map.set(keyword, map.get(keyword) + 1) }
        }
    }
    
    return new Map(Array.from(map).filter(([_, value]) => value > cond))
}
async function performence (page) {
    await page.setRequestInterception(true)
    page.on('request', async (request) => {
     if (request.resourceType() == 'image' || request.resourceType() == 'font' || request.resourceType() == 'stylesheet') {
      await request.abort()
     } 
     else {
      await request.continue()
     }
    })
}
async function getBestDailyKeywords (browser): Promise<Array<Keyword>>  { return await getKeywords(browser, BEST_KEYWORD_DAILY_URL) }
async function getBestWeeklyKeywords (browser): Promise<Array<Keyword>> { return await getKeywords(browser, BEST_KEYWORD_WEKKLY_URL) }
async function getKeywords (browser, url: string): Promise<Array<Keyword>> {
    const pge = await browser.newPage()
    await pge.goto(url, {waitUntil: 'domcontentloaded'})

    await pge.waitForSelector('.category_category_contents__oVtaX > div.category_panel > div.category_keyword_wrap__r__vz > ul > li')

    const result: Array<Keyword> = new Array()
    for (const item of await pge.$$('.category_category_contents__oVtaX > div.category_panel > div.category_keyword_wrap__r__vz > ul > li')) {
        const ele = await item.$('a')
        const arr = (await ele?.evaluate(ele => ele.innerText, ele))?.split('\n')

        const keyword = arr[2].includes('상승') ? arr[2].split('상승')[1] : arr[2].split('하락')[1]
        const rank    = Number(arr[0])

        result.push({keyword, rank})
    }

    return result
}
function delay (time: number) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}



