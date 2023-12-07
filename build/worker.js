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
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const crawl_1 = require("./crawl");
const options = {
    connection: { host: "my.redis-host.com" },
    limiter: { max: 300, duration: 1000 },
    attempts: 5,
    backoff: {
        type: "exponential",
        delay: 1000,
    },
};
new bullmq_1.Worker('crwal', (job) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, crawl_1.getStore)(job.data.url);
}), options);
//# sourceMappingURL=worker.js.map