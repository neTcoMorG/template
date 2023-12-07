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
const express_1 = __importDefault(require("express"));
const bullmq_1 = require("bullmq");
const app = (0, express_1.default)();
const que = new bullmq_1.Queue('CrwalQueue');
app.get('/run', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.query;
    const split = url.replace('//', '/').split('/');
    const shining = `https://${split[1]}/${split[2]}`;
    const result = yield que.add('wtf', { url });
    try {
        res.json(result);
    }
    catch (_a) {
        res.send('url is not valid');
    }
}));
app.listen(4522, () => {
    console.log("server is running");
});
//# sourceMappingURL=server.js.map