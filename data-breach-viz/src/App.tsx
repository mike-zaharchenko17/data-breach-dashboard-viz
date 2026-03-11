import './App.css'
import rawCsv from "./assets/data-breach-set-clean.csv?raw"
import { csvParse } from 'd3-dsv'
import { newPlot } from 'plotly.js-dist-min'

import { countBy, flattenByKey } from './lib/data-processing'

import { useRef, useEffect } from "react" 

export default function App() {

  const plotRef = useRef<HTMLDivElement | null>(null)

  const data = csvParse(rawCsv, (d) => {
      const formatted = {
          entity: d.entity,
          year: +d.year,
          records: +d.records,
          organization_type: d.organization_type,
          method: d.method
      }

      return formatted
  })

  const countIncidentsByYear = countBy(data, "year")

  console.log(JSON.stringify(countIncidentsByYear))

  console.log("Total:")

  const totalIncidentsByYear = Object.values(countIncidentsByYear).reduce((a, c) => a + c, 0)

  console.log(totalIncidentsByYear)

  useEffect(() => {
    if (plotRef.current) {
      newPlot(plotRef.current, [{
        y: Object.values(countIncidentsByYear),
        x: Object.keys(countIncidentsByYear),
        type: 'bar'
      }], { margin: { t: 0 } })
    }
  }, [])

  return (
    <div ref={plotRef}>
    </div>
  )
}

