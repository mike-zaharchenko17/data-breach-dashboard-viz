import { useEffect, useRef } from "react"
import type { DashboardContainerProps } from "../container";
import { groupBy } from "../../data-processing";
import Plotly from "plotly.js-dist-min"

interface RQ1FrequencySeverityProps extends DashboardContainerProps {}

export default function RQ1FrequencySeverity({ data } : RQ1FrequencySeverityProps) {
    const bubbleChartRef = useRef<HTMLDivElement | null>(null)

    // incidents vs. average records by org type
    const orgStats = Object.entries(groupBy(data, 'organization_type')).map(([org, items]) => ({
        org,
        incidentCount: items.length,
        avgRecords: items.reduce((s, i) => s + i.records, 0) / items.length,
        totalRecords: items.reduce((s, i) => s + i.records, 0)
    }))

    useEffect(() => {
        if (bubbleChartRef.current) {
            const sizes = orgStats.map(d => d.totalRecords)
            const desiredMaxSize = 60
            
            Plotly.newPlot(bubbleChartRef.current, [{
                x: orgStats.map(d => d.incidentCount),
                y: orgStats.map(d => d.avgRecords),
                text: orgStats.map(d => d.org),
                mode: 'markers',
                marker: {
                    size: sizes,
                    sizemode: 'area',
                    sizeref: 2.0 * Math.max(...sizes) / (desiredMaxSize ** 2),
                    color: orgStats.map((_, i) => i),
                    colorscale: 'Blues',
                    showscale: false
                },
                hovertemplate: '<b>%{text}</b><br>Incidents: %{x}<br>Avg Records: %{y:.2s}<br><extra></extra>'
            }], {
                title: { text: 'Incident Count vs Severity by Industry' },
                xaxis: { title: { text: 'Number of Incidents' } },
                yaxis: { 
                    title: { text: 'Average Records per Incident' },
                    type: 'log',
                    dtick: 1
                }
            })
        }
    }, [])

    return (
        <div ref={bubbleChartRef} style={{ width: 900, height: 650, margin: '0 auto' }} />
    )
}