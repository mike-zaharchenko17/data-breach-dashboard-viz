import type { DashboardContainerProps } from "../container";
import { Tabs } from "radix-ui";
import Plotly from "plotly.js-dist-min"
import { useEffect, useRef, useState } from "react"
import { sumBy } from "../../data-processing";

interface RQ1Props extends DashboardContainerProps {}

export default function RQ1({ data } : RQ1Props) {
    const sumRecordsBarChartRef = useRef<HTMLDivElement | null>(null)
    const sumRecordsLineChartRef = useRef<HTMLDivElement | null>(null)

    const sumRecordsByYear = sumBy(data, 'year', 'records')

    const [activeTab, setActiveTab] = useState("tab1")

    useEffect(() => {
        if (activeTab === "tab1" && sumRecordsBarChartRef.current) {
            Plotly.newPlot(sumRecordsBarChartRef.current, [{
                x: Object.keys(sumRecordsByYear),
                y: Object.values(sumRecordsByYear),
                type: 'bar',
                textposition: 'auto',
                opacity: 0.8
            }], { 
                title: { 
                    text: "Records Exposed by Year" 
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
        
        if (activeTab === "tab2" && sumRecordsLineChartRef.current) {
            Plotly.newPlot(sumRecordsLineChartRef.current, [{
                x: Object.keys(sumRecordsByYear),
                y: Object.values(sumRecordsByYear),
                type: 'scatter',
                mode: 'lines+markers'
            }], { title: { text: "Records Exposed by Year" } })
        }
    }, [activeTab])


    return (
        <div className="flex">
            <Tabs.Root defaultValue="tab1" orientation="vertical" onValueChange={setActiveTab}>
                <Tabs.List aria-label="tabs example">
                    <Tabs.Trigger value="tab1">One</Tabs.Trigger>
                    <Tabs.Trigger value="tab2">Two</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="tab1">
                    <div ref={sumRecordsBarChartRef} style={{ width: 900, height: 600 }} />
                </Tabs.Content>
                <Tabs.Content value="tab2">
                    <div ref={sumRecordsLineChartRef} style={{ width: 900, height: 600 }} />
                </Tabs.Content>
            </Tabs.Root>
        </div>
    )
}