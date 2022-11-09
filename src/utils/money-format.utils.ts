export class MoneyFormatUtils {
    private static formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    public static formatToUSD(value: number | bigint): string {
        return MoneyFormatUtils.formatter.format(value);
    }
}
