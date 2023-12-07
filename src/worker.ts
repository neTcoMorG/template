

import { Worker } from 'bullmq'
import { getStore } from './crawl'

const options = {
    connection: { host: "my.redis-host.com" },
    limiter: { max: 300, duration: 1000 },
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
}

new Worker('crwal', async (job) => {
    return await getStore(job.data.url)
}, options)