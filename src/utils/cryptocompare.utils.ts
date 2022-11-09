import { Axios } from 'axios';

interface IPriceResponseData  {[symbol: string]: {[toSymbol: string]: number}};

export class CryptoCompareUtils {
    private static readonly cryptoCompareInstance = new Axios({baseURL: 'https://min-api.cryptocompare.com/data', headers: {Apikey: process.env.CRYPTO_COMPARE_API_KEY}})
    
    public static async getLatestPrices(fromSymbols: string[], toSymbol: string): Promise<IPriceResponseData> {
        const { data } = await CryptoCompareUtils.cryptoCompareInstance.get<string>('/pricemulti', {
            params: {
                fsyms: fromSymbols.join(','),
                tsyms: toSymbol
            }
        });
        const formatedData: IPriceResponseData = JSON.parse(data);
        return formatedData;
    }

    public static async getPriceHistorical(fromSymbols: string[], toSymbol: string, timestamp: number): Promise<IPriceResponseData> {
        const promises = fromSymbols.map(symbol => {
            return CryptoCompareUtils.cryptoCompareInstance.get<string>('/pricehistorical', {
                params: {
                    fsym: symbol,
                    tsyms: toSymbol,
                    ts: timestamp,
                }
            });
        });

        const responses = await Promise.all(promises);
        const formatedData = responses.reduce((aggregate, response) => {
            return {...aggregate, ...JSON.parse(response.data)}
        }, {});
        
        return formatedData;
    }
}