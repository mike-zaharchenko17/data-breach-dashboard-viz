import type { DashboardContainerProps } from "../container";
import { useRef, useEffect } from "react";
import Plotly from "plotly.js-dist-min"

interface RQ3Props extends DashboardContainerProps {}

export default function RQ3({ data }: RQ3Props) {
    const violinRef = useRef<HTMLDivElement | null>(null)

    // Filter out invalid entries
    const cleanData = data.filter(d => d.method && d.records > 0)

    useEffect(() => {
        if (violinRef.current) {
            Plotly.newPlot(violinRef.current, [{
                type: 'box' as const,
                x: cleanData.map(d => d.method),
                y: cleanData.map(d => d.records),
                boxpoints: 'all',
                jitter: 0.4,
                pointpos: 0,
                marker: {
                    color: 'rgba(59, 130, 246, 0.6)',
                    size: 6
                },
                fillcolor: 'rgba(0,0,0,0)',
                line: { color: 'rgba(0,0,0,0)' }
            }], {
                title: { text: 'Records Distribution by Breach Method' },
                yaxis: { 
                    title: { text: 'Records' },
                    type: 'log'
                },
                xaxis: { title: { text: 'Method' } },
                autosize: true
            }, { responsive: true })
        }
    }, [])

    return (
        <div className="w-full">
            <div ref={violinRef} style={{ width: '100%', height: 450 }} />
        </div>
    )
}