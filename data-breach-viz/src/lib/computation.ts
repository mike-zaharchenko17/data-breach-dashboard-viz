import type { DSVParsedArray } from "d3-dsv";
import { sumBy, countBy } from "./data-processing";

export function computeKPIs(data: DSVParsedArray<{
    entity: string;
    year: number;
    records: number;
    organization_type: string;
    method: string;
}>) : {
    totalBreaches: number,
    totalRecords: number,
    peakYear: string,
    mostCommonMethod: string,
} {
    const totalBreaches = data.length
    const totalRecords = data.reduce((s, d) => s + d.records, 0)
    
    const summedYears = sumBy(data, 'year', 'records')
    const peakYear = Object.keys(summedYears).reduce((a, b) => summedYears[a] > summedYears[b] ? a : b)

    const countedMethods = countBy(data, 'method')
    const mostCommonMethod = Object.keys(countedMethods).reduce((a, b) => countedMethods[a] > countedMethods[b] ? a : b)

    return {
        totalBreaches,
        totalRecords,
        peakYear,
        mostCommonMethod
    }
}