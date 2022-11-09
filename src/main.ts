require('dotenv').config();
import { Command } from "commander";
import figlet from "figlet";
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';
import { DateTimeUtils } from './utils/date-time.utils';
import { CryptoCompareUtils } from './utils/cryptocompare.utils';
import { MoneyFormatUtils } from './utils/money-format.utils';

console.log(figlet.textSync("Rexviet"));

const program = new Command();
program.version('1.0.0')
    .description('This is the home assesment to apply to Propine Company')
    .option('-d, --date <value>', 'Date in format YYYY-MM-DD. Ex: 2022-11-08')
    .option('-s, --symbol <value>', 'Token symbol. Ex: BTC')
    .parse(process.argv);
const options = program.opts();
const {date, symbol} = options;

const latestAmountMapper: {[token: string]: number} = {};

let epocTimestamp = Number.MAX_SAFE_INTEGER;
if (date) {
    epocTimestamp = DateTimeUtils.getEpocTimestamp(date);
}

const onData = (row: any) => {
    if (Number(row.timestamp) <= epocTimestamp) {
        const amount = row.transaction_type === 'DEPOSIT' ? Number(row.amount) : - Number(row.amount);
        
        if (!latestAmountMapper[row.token]) {
            latestAmountMapper[row.token] = amount;
        } else {
            latestAmountMapper[row.token] += amount;
        }
    }
}

const onEnd = async (rowCount: number) => {
    console.log(`Parsed ${rowCount} rows`);
    const tokens = Object.keys(latestAmountMapper);

    if (!date) {
        const latestPricesData = await CryptoCompareUtils.getLatestPrices(tokens, 'USD');
        if (!symbol) {
            console.log('Latest portfolio value per token in USD:');
            tokens.map(token => {
                console.log(`${token}: ${MoneyFormatUtils.formatToUSD(latestAmountMapper[token] * latestPricesData[token]['USD'])}`);
            });
        } else {
            console.log(`Latest portfolio value of ${symbol} in USD: ${MoneyFormatUtils.formatToUSD(latestAmountMapper[symbol] * latestPricesData[symbol]['USD'])}`);
        }
    } else {
        const priceHistoricalData = await CryptoCompareUtils.getPriceHistorical(tokens, 'USD', epocTimestamp);
        if (!symbol) {
            console.log(`Portfolio value per token in USD on ${date}:`);
            tokens.map(token => {
                console.log(`${token}: ${MoneyFormatUtils.formatToUSD(latestAmountMapper[token] * priceHistoricalData[token]['USD'])}`);
            });
        } else {
            console.log(`Portfolio value of ${symbol} in USD on ${date}: ${MoneyFormatUtils.formatToUSD(latestAmountMapper[symbol] * priceHistoricalData[symbol]['USD'])}`);
        }
    }
}

const filePath = path.resolve(__dirname, '../transactions.csv');
console.log('filePath:', filePath);
const readStream = fs.createReadStream(filePath);
readStream
    .pipe(csv.parse({ headers: true }))
    .on('error', console.error)
    .on('data', onData)
    .on('end', onEnd);