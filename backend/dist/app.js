"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
const cppp_crawler_1 = require("./crawlers/cppp-crawler");
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.post('/api/crawl/cppp', async (req, res) => {
    try {
        // Fire and forget, or await. We'll await for testing.
        await (0, cppp_crawler_1.scrapeCPPP)();
        res.status(200).json({ message: 'CPPP scrape completed.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Scrape failed' });
    }
});
exports.default = app;
