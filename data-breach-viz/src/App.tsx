import './App.css'
import rawCsv from "./assets/data-breach-set-clean.csv?raw"
import { csvParse } from 'd3-dsv'
import Plotly from "plotly.js-dist-min"

import { countBy, sumBy, pivotToTraces, consolidateLongTail } from './lib/data-processing'

import { useRef, useEffect, useMemo } from "react" 

export default function App() {

  const basicBarChartRef = useRef<HTMLDivElement | null>(null)
  const stackedBarChartRef = useRef<HTMLDivElement | null>(null)
  const sumRecordsLineChartRef = useRef<HTMLDivElement | null>(null)
  const sumRecordsBarChartRef = useRef<HTMLDivElement | null>(null)

  const data = useMemo(() => {
      return csvParse(rawCsv, (d) => {
        const formatted = {
            entity: d.entity,
            year: +d.year,
            records: +d.records,
            organization_type: d.organization_type,
            method: d.method
        }

        return formatted
    })
  }, [])

  const countIncidentsByYear = countBy(data, "year")

  const sumRecordsByYear = sumBy(data, 'year', 'records')

  console.log(sumRecordsByYear)
  
  const countByYearAndOrgTypeTrace = pivotToTraces(
    consolidateLongTail(data, 'organization_type', 4), 
    'year', 
    'organization_type', 
    items => items.length,
    {
      type: "bar",
      hovertemplate: '%{fullData.name}<br>Year: %{x}<br>Count: %{y}<extra></extra>'
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
      }], 
      {
        title: { 
          text: "Incident Count by Year"
        },
      }
    )}
  }, [])

  useEffect(() => {
    if (stackedBarChartRef.current) {
      Plotly.newPlot(
        stackedBarChartRef.current, 
        countByYearAndOrgTypeTrace,
        {
          title: { 
            text: "Incident Count by Year and Organization Type"
          },
          barmode: "stack",
          colorway: [
            "#1A365D",
            "#2B6CB0",
            "#4299E1",
            "#63B3ED",
            "#4FD1C5",
            "#81E6D9"
          ]
        }
      )
    }
  })

  useEffect(() => {
    if (sumRecordsLineChartRef.current) {
      Plotly.newPlot(
        sumRecordsLineChartRef.current, [{
          x: Object.keys(sumRecordsByYear),
          y: Object.values(sumRecordsByYear),
          type: 'scatter',
          mode: 'lines+markers'
        }],
        {
          title: {
            text: "Sum by year"
          }
        }
      )
    }
  }, [])

  useEffect(() => {
    if (sumRecordsBarChartRef.current) {
      Plotly.newPlot(
        sumRecordsBarChartRef.current, [{
          x: Object.keys(sumRecordsByYear),
          y: Object.values(sumRecordsByYear),
          type: 'bar',
          textposition: 'auto',
          opacity: 0.8
        }],
        {
          title: {
            text: "Sum by year"
          },
          yaxis: { 
            type: 'log',
            title: {
              text: 'Records (log scale)'
            }
          }
        }
      )
    }
  }, [])

  return (
    <>
      <div ref={basicBarChartRef} />
      <div ref={stackedBarChartRef} />
      <div ref={sumRecordsLineChartRef} />
      <div ref={sumRecordsBarChartRef} />
    </>

  )
}

