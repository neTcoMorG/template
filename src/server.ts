
import express, { Express, Request, Response } from 'express';
import { Queue } from 'bullmq';

const app: Express = express()

const que = new Queue('CrwalQueue')

app.get('/run', async (req: Request, res: Response) => {
    const { url }: {url: string} = req.query
    
    const split = url.replace('//', '/').split('/')
    const shining = `https://${split[1]}/${split[2]}`
    const result = await que.add('wtf', {url})

    try   { res.json(result) }
    catch { res.send('url is not valid') }
})

app.listen(4522, () => {
    console.log("server is running")
})