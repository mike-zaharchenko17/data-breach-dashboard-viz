import type { DashboardContainerProps } from "../container"
import { useState, useRef, useEffect } from "react"
import { pivotToHeatmap, consolidateLongTail } from "../../data-processing"
import Plotly from "plotly.js-dist-min"

interface HeatmapChartProps extends DashboardContainerProps {}

export default function HeatmapManager({ data }: HeatmapChartProps) {
    const [view, setView] = useState<'incidents' | 'records'>('incidents')
    const heatmapRef = useRef<HTMLDivElement | null>(null)

    const cleanData = data.filter(d => d.method && d.organization_type)
    const consolidatedData = consolidateLongTail(
        consolidateLongTail(cleanData, 'organization_type', 6),
        'method',
        6
    )

    useEffect(() => {
        if (!heatmapRef.current) return

        const heatmapData = pivotToHeatmap(
            consolidatedData,
            'organization_type',
            'method',
            view === 'incidents' 
                ? items => items.length 
                : items => items.reduce((sum, item) => sum + item.records, 0)
        )

        Plotly.react(heatmapRef.current, [{
            type: 'heatmap',
            x: heatmapData.x,
            y: heatmapData.y,
            z: heatmapData.z,
            colorscale: [
                [0, '#f1f5f9'],
                [0.001, '#b5d5fd'],
                [0.1, '#83b9fb'],
                [0.2, '#60a5fa'],
                [0.4, '#398ff9'],
                [0.6, '#2081f8'],
                [0.8, '#065cc6'],
                [1, '#054594']
            ],
            hoverongaps: false,
            hovertemplate: view === 'incidents'
                ? '<b>%{y}</b> × <b>%{x}</b><br>Incidents: %{z}<extra></extra>'
                : '<b>%{y}</b> × <b>%{x}</b><br>Records: %{z:,.0f}<extra></extra>',
            colorbar: {
                title: { text: view === 'incidents' ? 'Incidents' : 'Records' }
            }
        }], {
            title: { text: view === 'incidents' 
                ? 'Incidents by Breach Method & Organization Type'
                : 'Records Lost by Breach Method & Organization Type' 
            },
            margin: { l: 120, b: 100 },
            xaxis: { title: { text: 'Organization Type' }, tickangle: -45 },
            yaxis: { title: { text: 'Method' } }
        })
    }, [view])

    return (
        <div>
            <div className="flex justify-center mb-4">
                <div className="flex gap-1 bg-slate-400 rounded-full p-1">
                    <button 
                        onClick={() => setView('incidents')}
                        className={`px-4 py-1 rounded-full transition-all ${view === 'incidents' ? 'bg-white shadow' : ''}`}
                    >
                        Incidents
                    </button>
                    <button 
                        onClick={() => setView('records')}
                        className={`px-4 py-1 rounded-full transition-all ${view === 'records' ? 'bg-white shadow' : ''}`}
                    >
                        Records Lost
                    </button>
                </div>
            </div>
            <div ref={heatmapRef} style={{ width: 900, height: 500, margin: '0 auto' }} />
        </div>
    )
}