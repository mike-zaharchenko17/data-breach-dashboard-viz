import './App.css'
import rawCsv from "./assets/data-breach-set-clean.csv?raw"
import { csvParse } from 'd3-dsv'
import { useMemo } from "react" 
import DashboardContainer from './lib/components/container'

export default function App() {
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

  return (
    <>
      <DashboardContainer data={data} />
    </>

  )
}

