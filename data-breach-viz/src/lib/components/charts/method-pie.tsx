import { useEffect, useRef, useState, useMemo } from "react";
import type { DashboardContainerProps } from "../container";
import Plotly from "plotly.js-dist-min"

interface PieChartProps extends DashboardContainerProps {}

export default function MethodPieChart({ data }: PieChartProps) {
    const pieChartRef = useRef<HTMLDivElement | null>(null)
    
    const cleanData = data.filter(d => d.method)
    const methods = useMemo(() => 
        [...new Set(cleanData.map(d => d.method))].sort(),
        [cleanData]
    )
    
    const [selectedMethod, setSelectedMethod] = useState('hacked')
    const [displayedMethod, setDisplayedMethod] = useState('hacked')
    const [isFading, setIsFading] = useState(false)

    const handleMethodChange = (newMethod: string) => {
        setIsFading(true)
        setTimeout(() => {
            setSelectedMethod(newMethod)
            setDisplayedMethod(newMethod)
            setTimeout(() => setIsFading(false), 50)
        }, 200)
    }

    useEffect(() => {
        if (!pieChartRef.current) return

        const summed = cleanData.reduce((acc, d) => {
            const key = d.method === displayedMethod ? displayedMethod : 'other'
            acc[key] = (acc[key] || 0) + d.records
            return acc
        }, {} as Record<string, number>)

        const labels = [displayedMethod.charAt(0).toUpperCase() + displayedMethod.slice(1), 'Other']
        const values = [summed[displayedMethod] || 0, summed['other'] || 0]

        Plotly.react(pieChartRef.current, [{
            type: 'pie',
            values: values,
            labels: labels,
            hole: 0.4,
            textinfo: 'label+percent' as const,
            hovertemplate: '<b>%{label}</b><br>%{value:,.0f} records<br>%{percent}<extra></extra>',
            marker: {
                colors: ['#3b82f6', '#dbeafe']
            }
        }], {
            title: { text: `Records Lost: ${labels[0]} vs Other Methods` },
            showlegend: false
        })
    }, [displayedMethod, cleanData])

    return (
        <div className="mt-2">
            <div className="flex justify-center mb-4">
                <select 
                    value={selectedMethod} 
                    onChange={e => handleMethodChange(e.target.value)}
                    className="px-3 py-2 rounded border border-slate-300 bg-white text-slate-700"
                >
                    {methods.map(m => (
                        <option key={m} value={m}>
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            <div 
                ref={pieChartRef} 
                className={`transition-opacity duration-200 ${isFading ? 'opacity-0' : 'opacity-100'}`}
                style={{ width: '100%', height: 400 }} 
            />
        </div>
    )
}
