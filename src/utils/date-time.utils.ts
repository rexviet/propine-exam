export class DateTimeUtils {
    public static getEpocTimestamp(stringDate: string): number {
        const d = new Date(stringDate);
        if (Number.isNaN(d)) {
            throw new Error('Invalid date');
        }
        const utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(),
        d.getUTCDate(), d.getUTCHours(),
        d.getUTCMinutes(), d.getUTCSeconds());
        return utc / 1000;
    }
}
