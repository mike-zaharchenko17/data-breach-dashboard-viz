import type { Data } from "plotly.js-dist-min"

/* This module handles data grouping and aggregation */

/*
TYPE SYSTEM

T is the type of each item in the array 

e.g., [ { year: 2020, records: 100, method: 'hacked' } ]

So T is inferred to { year: 2020, records: 100, method: 'hacked' }

K is evaluated to be "year" | "records" | "method"
*/

export function flattenByKey<T, K extends keyof T>(array: T[], key: K) {
    return array.map((v) => v[key])
} 

/*

GROUP BY

1. initialize with an empty object that expects shape { string: T[] }
2. extract the key from the item (parsed DSV) and key the accumulator w/ it
3. access the array at that group key and push the item onto it

transformation: 

const data = [
  { year: 2020, records: 100, method: 'hacked' },
  { year: 2020, records: 50, method: 'lost' },
  { year: 2021, records: 200, method: 'hacked' }
]

-->

acc = {
  "2020": [
    { year: 2020, records: 100, method: 'hacked' },
    { year: 2020, records: 50, method: 'lost' }
  ],
  "2021": [
    { year: 2021, records: 200, method: 'hacked' }
  ]
}

*/

export function groupBy<T, K extends keyof T>(
    array: T[],
    key: K,
) : Record<string, T[]> {
    return array.reduce((acc, item) => {
        const groupKey = String(item[key])
        acc[groupKey] = acc[groupKey] ?? []
        acc[groupKey].push(item)
        return acc
    }, {} as Record<string, T[]>)
}

export function groupBy2<T, K1 extends keyof T, K2 extends keyof T>(
    array: T[],
    key1: K1,
    key2: K2
): Record<string, Record<string, T[]>> {
    return array.reduce((acc, item) => {
        const k1 = String(item[key1])
        const k2 = String(item[key2])
        acc[k1] = acc[k1] ?? {}
        acc[k1][k2] = acc[k1][k2] ?? []
        acc[k1][k2].push(item)
        return acc
    }, {} as Record<string, Record<string, T[]>>)
}

/*

AGGREGATORS

<action>Grouped function takes the result of a groupByCall Record<string, T[]>
and performs a groupwise mapping into a new object that is { groupKey: aggregate }

*/
export function sumGrouped<T, K extends keyof T>(
    groupObj: Record<string, T[]>,
    field: K
) : Record<string, number> {
    const summed : Record<string, number> = {}
    for (const k of Object.keys(groupObj)) {
        summed[k] = 0
        groupObj[k].forEach((val) => {
            if (typeof val[field] === "number") {
                summed[k] = summed[k] + val[field]
            } else {
                throw new Error("Must be number")
            }
        })
    }
    return summed
}

export function countGrouped<T>(
    groupObj: Record<string, T[]>,
) : Record<string, number> {
    return Object.fromEntries(
        Object.entries(groupObj).map(([key, items]) => [
            key,
            items.length
        ])
    )
}

export function averageGrouped<T, K extends keyof T>(
    groupObj: Record<string, T[]>,
    field: K
) : Record<string, number> {
    const summed = sumGrouped(groupObj, field)
    return Object.fromEntries(
        Object.entries(groupObj).map(([key, items]) => [
            key,
            summed[key] / (items.length || 1)
        ])
    )
}

export function maxGrouped<T, K extends keyof T>(
    groupObj: Record<string, T[]>,
    field: K
) {
    return Object.fromEntries(
        Object.entries(groupObj).map(([key, items]) => [
            key,
            Math.max(...flattenByKey(items, field) as number[])
        ])
    )
}

export function minGrouped<T, K extends keyof T>(
    groupObj: Record<string, T[]>,
    field: K
) {
    return Object.fromEntries(
        Object.entries(groupObj).map(([key, items]) => [
            key,
            Math.min(...flattenByKey(items, field) as number[])
        ])
    )
}

/*
COMPOSERS

composers allow you to chain an group call and an aggregator call in one

CSV shape T[] 
-> 
Grouped Shape { groupKey: T[] } 
-> 
Aggregate Shape { groupKey: aggVal }

*/

export function sumBy<T, K extends keyof T, V extends keyof T>(
    array: T[],
    groupKey: K,
    sumKey: V
) : Record<string, number> {
    return sumGrouped(groupBy(array, groupKey), sumKey)
}

export function countBy<T, K extends keyof T>(
    array: T[],
    groupKey: K,
) : Record<string, number> {
    return countGrouped(groupBy(array, groupKey))
}

export function averageBy<T, K extends keyof T, V extends keyof T>(
    array: T[],
    groupKey: K,
    avgKey: V
) : Record<string, number> {
    return averageGrouped(groupBy(array, groupKey), avgKey)
}

export function maxBy<T, K extends keyof T, V extends keyof T>(
    array: T[],
    groupKey: K,
    maxKey: V
) {
    return maxGrouped(groupBy(array, groupKey), maxKey)
}

export function minBy<T, K extends keyof T, V extends keyof T>(
    array: T[],
    groupKey: K,
    minKey: V
) : Record<string, number> {
    return minGrouped(groupBy(array, groupKey), minKey)
}

/* Pivots for 2d groups */

export function pivotToTraces<T>(
    array: T[],
    xKey: keyof T,
    seriesKey: keyof T,
    aggregator: (items: T[]) => number,  // sum, count, avg, etc.
    dataParams?: Data,
    options?: { otherLast: boolean }
): Data[] {
    const grouped = groupBy2(array, seriesKey, xKey)
    const allXValues = [...new Set(array.map(item => String(item[xKey])))].sort()
    
    let traces = Object.entries(grouped).map(([seriesName, xGroups]) => ({
        name: seriesName,
        x: allXValues,
        y: allXValues.map(xVal => aggregator(xGroups[xVal] ?? [])),
        ...dataParams,
    }))

    if (options?.otherLast) {
        traces = traces.sort((a, b) => {
            if (a.name === "other") return -1
            if (b.name === "other") return 1
            return 0
        })
    }

    return traces
}

export function consolidateLongTail<T, K extends keyof T>(
    array: T[],
    categoryKey: K,
    topN: number,
    aggregator: (items: T[]) => number = items => items.length,
    otherLabel: string = 'other'
): T[] {
    const grouped = groupBy(array, categoryKey)
    const ranked = Object.entries(grouped)
        .map(([category, items]) => ({ category, value: aggregator(items) }))
        .sort((a, b) => b.value - a.value)
    
    const topCategories = new Set(ranked.slice(0, topN).map(r => r.category))
    
    return array.map(item => ({
        ...item,
        [categoryKey]: topCategories.has(String(item[categoryKey])) 
            ? item[categoryKey] 
            : otherLabel
    }))
}