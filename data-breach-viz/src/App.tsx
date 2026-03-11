import './App.css'
import rawCsv from "./assets/data-breach-set-clean.csv?raw"
import { csvParse } from 'd3-dsv'
import { newPlot } from 'plotly.js-dist-min'

import { flattenByKey } from './lib/data-processing'

import { useRef, useEffect } from "react" 

export default function App() {

  const plotRef = useRef<HTMLDivElement | null>(null)

  const methodMap : Record<string, number> = {}

  const industryMap : Record<string, number> = {}

  const data = csvParse(rawCsv, (d) => {
      const formatted = {
          entity: d.entity,
          year: +d.year,
          records: +d.records,
          organization_type: d.organization_type,
          method: d.method
      }

      methodMap[formatted.method] = methodMap[formatted.method] ? methodMap[formatted.method] += 1 : 1

      industryMap[formatted.organization_type] = industryMap[formatted.organization_type] ? industryMap[formatted.organization_type] += 1 : 1

      return formatted
  })

  console.log("FBK:")
  console.log(JSON.stringify(flattenByKey(data, "year")))

  useEffect(() => {
    if (plotRef.current) {
      newPlot(plotRef.current, [{
        x: flattenByKey(data, "year"),
        y: flattenByKey(data, "records"),
      }], { margin: { t: 0 } })
    }
  }, [])

  return (
    <div ref={plotRef}>
    </div>
  )
}

