import type { DashboardContainerProps } from "../container";
import Plotly from "plotly.js-dist-min"
import { useRef, useEffect } from "react";

interface RQ2Props extends DashboardContainerProps {}

export default function RQ2({ data } : RQ2Props) {
    const methods  = [...new Set(data.map(d => d.method))].filter(Boolean)
    const boxPlotRef = useRef<HTMLDivElement | null>(null)

    const traces = methods.map(method => ({
        type: 'box' as const,
        name: method,
        y: data.filter(d => d.method === method).map(d => d.records),
        boxpoints: 'outliers' as const
    }))

    useEffect(() => {
        if (boxPlotRef.current) {
            Plotly.newPlot(
                boxPlotRef.current, traces, {
                title: { text: 'Records Lost by Breach Method' },
                yaxis: { 
                    title: { text: 'Records' },
                    type: 'log'  // log scale helps with extreme outliers
                },
                xaxis: { title: { text: 'Method' } }
            })
        }
    }, [])



    return (
        <div className="flex">
            <div ref={boxPlotRef} style={{ width: 600, height: 500 }}/>
        </div>
    )
}