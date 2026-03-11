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

export function sumBy<T, K extends keyof T, V extends keyof T>(
    array: T[],
    groupKey: K,
    sumKey: V
) {
    return sumGrouped(groupBy(array, groupKey), sumKey)
}

export function countBy<T, K extends keyof T, V extends keyof T>(
    array: T[],
    groupKey: K,
    countKey: V
) {
    return sumGrouped(groupBy(array, groupKey), countKey)
}

  