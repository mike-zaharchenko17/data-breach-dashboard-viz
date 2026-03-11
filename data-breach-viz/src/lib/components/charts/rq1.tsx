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
                type: 'bar'
            }], { title: { text: "Bar Chart" } })
        }
        
        if (activeTab === "tab2" && sumRecordsLineChartRef.current) {
            Plotly.newPlot(sumRecordsLineChartRef.current, [{
                x: Object.keys(sumRecordsByYear),
                y: Object.values(sumRecordsByYear),
                type: 'scatter',
                mode: 'lines+markers'
            }], { title: { text: "Line Chart" } })
        }
    }, [activeTab])


    return (
        <div className="flex">
            <Tabs.Root defaultValue="tab1" orientation="vertical" onValueChange={setActiveTab}>
                <Tabs.List aria-label="tabs example">
                    <Tabs.Trigger value="tab1">One</Tabs.Trigger>
                    <Tabs.Trigger value="tab2">Two</Tabs.Trigger>
                    <Tabs.Trigger value="tab3">Three</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="tab1">
                    <div ref={sumRecordsBarChartRef} />
                </Tabs.Content>
                <Tabs.Content value="tab2">
                    <div ref={sumRecordsLineChartRef} />
                </Tabs.Content>
                <Tabs.Content value="tab3">
                    <div id="sum-record-scatter" />
                </Tabs.Content>
            </Tabs.Root>
        </div>
    )
}