import './App.css'
import rawCsv from "./assets/data-breach-set-clean.csv?raw"
import { csvParse } from 'd3-dsv'
import Plotly from "plotly.js-dist-min"

import { countBy, pivotToTraces, consolidateLongTail } from './lib/data-processing'

import { useRef, useEffect } from "react" 

export default function App() {

  const basicBarChartRef = useRef<HTMLDivElement | null>(null)
  const stackedBarChartRef = useRef<HTMLDivElement | null>(null)

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


  const countByYearAndOrgTypeTrace = pivotToTraces(
    consolidateLongTail(data, 'organization_type', 4), 
    'year', 
    'organization_type', 
    items => items.length,
    {
      type: "bar",
      colorscale: "Picnic"
    },
    { otherLast: true }
  )

  useEffect(() => {
    if (basicBarChartRef.current) {
      Plotly.newPlot(basicBarChartRef.current, [{
        x: Object.keys(countIncidentsByYear),
        y: Object.values(countIncidentsByYear),
        type: 'bar',
        text: Object.values(countIncidentsByYear).map(String),
        textposition: 'auto',
        opacity: 0.8
      }], { margin: { t: 0 } })
    }
  }, [])

  useEffect(() => {
    if (stackedBarChartRef.current) {
      Plotly.newPlot(
        stackedBarChartRef.current, 
        countByYearAndOrgTypeTrace,
        {
          barmode: "stack"
        }
      )
    }
  })

  return (
    <>
      <div ref={basicBarChartRef} />
      <div ref={stackedBarChartRef} />
    </>

  )
}

