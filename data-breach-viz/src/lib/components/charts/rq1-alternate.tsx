import type { DashboardContainerProps } from "../container";
import { Tabs } from "radix-ui";
import Plotly from "plotly.js-dist-min"
import { useEffect, useRef, useState } from "react"
import { consolidateLongTail, groupBy, pivotToTraces, sumBy } from "../../data-processing";

interface RQ1Props extends DashboardContainerProps {}

export default function RQ1({ data } : RQ1Props) {
    const sumRecordsBarChartRef = useRef<HTMLDivElement | null>(null)
    const sumRecordsAreaChartRef = useRef<HTMLDivElement | null>(null)
    const bubbleChartRef = useRef<HTMLDivElement | null>(null)

    const sumRecordsByYear = sumBy(data, 'year', 'records')
    const consolidatedData = consolidateLongTail(data, 'organization_type', 5)

    // Area chart trace
    const sumRecordsByYearAndOrgTypeAreaTrace = pivotToTraces(
        consolidatedData,
        'year',
        'organization_type',
        items => items.reduce((sum, item) => sum + item.records, 0),
        {
            type: "scatter",
            mode: "lines",
            stackgroup: "one",
            hovertemplate: '%{fullData.name}<br>Year: %{x}<br>Records: %{y}<extra></extra>'
        }
    )

    // Bubble chart data: incidents vs avg records by org type
    const orgStats = Object.entries(groupBy(data, 'organization_type')).map(([org, items]) => ({
        org,
        incidentCount: items.length,
        avgRecords: items.reduce((s, i) => s + i.records, 0) / items.length,
        totalRecords: items.reduce((s, i) => s + i.records, 0)
    }))

    const [activeTab, setActiveTab] = useState("tab1")

    useEffect(() => {
        if (activeTab === "tab1" && sumRecordsAreaChartRef.current) {
            Plotly.newPlot(
                sumRecordsAreaChartRef.current,
                sumRecordsByYearAndOrgTypeAreaTrace,
                {
                    title: {
                        text: "Records Lost by Year and Organization Type"
                    },
                    colorway: [
                        "#1A365D",
                        "#2B6CB0",
                        "#4299E1",
                        "#63B3ED",
                        "#4FD1C5",
                        "#81E6D9"
                    ],
                    xaxis: {
                        title: { text: 'Year' }
                    },
                    yaxis: {
                        title: { text: 'Records' }
                    }
                }
            )
        }

        if (activeTab === "tab2" && sumRecordsBarChartRef.current) {
            Plotly.newPlot(sumRecordsBarChartRef.current, [{
                x: Object.keys(sumRecordsByYear),
                y: Object.values(sumRecordsByYear),
                type: 'bar',
                textposition: 'auto',
                opacity: 0.8
            }], { 
                title: { 
                    text: "Records Lost by Year" 
                } ,
                yaxis: {
                    type: 'log',
                    title: {
                        text: 'Records (log scale)'
                    },
                    dtick: 1
                }
            })
        }

        if (activeTab === "tab3" && bubbleChartRef.current) {
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
                title: { text: 'Incident Count vs Severity by Organization Type' },
                xaxis: { title: { text: 'Number of Incidents' } },
                yaxis: { 
                    title: { text: 'Average Records per Incident' },
                    type: 'log'
                }
            })
        }
    }, [activeTab])


    return (
        <div className="flex justify-center w-full">
            <Tabs.Root defaultValue="tab1" onValueChange={setActiveTab}>
                <Tabs.List className="flex justify-between w-[900px] mb-4">
                    <Tabs.Trigger 
                        value="tab1" 
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-300 data-[state=active]:bg-sky-600 data-[state=active]:text-white rounded-md transition-colors"
                    >
                        Annual Loss by Industry
                    </Tabs.Trigger>
                    <Tabs.Trigger 
                        value="tab2" 
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-300 data-[state=active]:bg-sky-600 data-[state=active]:text-white rounded-md transition-colors"
                    >
                        Total Loss YoY
                    </Tabs.Trigger>
                    <Tabs.Trigger 
                        value="tab3" 
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-300 data-[state=active]:bg-sky-600 data-[state=active]:text-white rounded-md transition-colors"
                    >
                        Bubble
                    </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="tab1">
                    <div ref={sumRecordsAreaChartRef} style={{ width: 900, height: 650 }} />
                </Tabs.Content>
                <Tabs.Content value="tab2">
                    <div ref={sumRecordsBarChartRef} style={{ width: 900, height: 650 }} />
                </Tabs.Content>
                <Tabs.Content value="tab3">
                    <div ref={bubbleChartRef} style={{ width: 900, height: 650 }} />
                </Tabs.Content>
            </Tabs.Root>
        </div>
    )
}