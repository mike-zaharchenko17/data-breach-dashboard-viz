import type { DashboardContainerProps } from "../container";
import { Tabs } from "radix-ui";
import Plotly from "plotly.js-dist-min"
import { useEffect, useRef, useState } from "react"
import { consolidateLongTail, pivotToTraces, sumBy } from "../../data-processing";

interface RQ1Props extends DashboardContainerProps {}

export default function RQ1({ data } : RQ1Props) {
    const sumRecordsBarChartRef = useRef<HTMLDivElement | null>(null)
    const sumRecordsAreaChartRef = useRef<HTMLDivElement | null>(null)

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
                        "#E57373",  // muted red
                        "#FFB74D",  // muted orange
                        "#FFF176",  // muted yellow
                        "#81C784",  // muted green
                        "#64B5F6",  // muted blue
                        "#BA68C8"   // muted purple
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
    }, [activeTab])


    return (
        <div className="flex justify-center w-full">
            <Tabs.Root defaultValue="tab1" onValueChange={setActiveTab}>
                <Tabs.Content value="tab1">
                    <div ref={sumRecordsAreaChartRef} style={{ width: 900, height: 580 }} />
                </Tabs.Content>
                <Tabs.Content value="tab2">
                    <div ref={sumRecordsBarChartRef} style={{ width: 900, height: 580 }} />
                </Tabs.Content>
                <Tabs.List className="flex justify-between w-[900px] mb-4 mt-2 px-18">
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
                </Tabs.List>
            </Tabs.Root>
        </div>
    )
}