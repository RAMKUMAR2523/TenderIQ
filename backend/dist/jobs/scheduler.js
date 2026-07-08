"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const setupScheduler = () => {
    console.log('Initializing background job scheduler...');
    // Run scraper every 6 hours
    node_cron_1.default.schedule('0 */6 * * *', async () => {
        console.log('Running scheduled tender scraping job...');
        try {
            // TODO: Call scraper functions here
            console.log('Tender scraping job completed.');
        }
        catch (error) {
            console.error('Error in tender scraping job:', error);
        }
    });
    // Check for expired tenders every day at midnight
    node_cron_1.default.schedule('0 0 * * *', async () => {
        console.log('Running expired tenders cleanup job...');
        try {
            // TODO: Update tender statuses in database
            console.log('Expired tenders cleanup job completed.');
        }
        catch (error) {
            console.error('Error in expired tenders cleanup job:', error);
        }
    });
};
exports.setupScheduler = setupScheduler;
