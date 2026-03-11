import type { DashboardContainerProps } from "../container";
import { Tabs } from "radix-ui";
import Plotly from "plotly.js-dist-min"
import { useEffect, useRef, useState } from "react"
import { consolidateLongTail, pivotToTraces, sumBy } from "../../data-processing";

interface RQ1Props extends DashboardContainerProps {}

export default function RQ1({ data } : RQ1Props) {
    const sumRecordsStackedBarChartRef = useRef<HTMLDivElement | null>(null)
    const sumRecordsBarChartRef = useRef<HTMLDivElement | null>(null)

    const sumRecordsByYear = sumBy(data, 'year', 'records')

    const sumRecordsByYearAndOrgTypeTrace = pivotToTraces(
        consolidateLongTail(data, 'organization_type', 5),
        'year',
        'organization_type',
        items => items.reduce((sum, item) => sum + item.records, 0),
        {
            type: "bar",
            hovertemplate: '%{fullData.name}<br>Year: %{x}<br>Count: %{y}<extra></extra>'
        },
    )

    const [activeTab, setActiveTab] = useState("tab1")

    useEffect(() => {
        if (activeTab === "tab1" && sumRecordsStackedBarChartRef.current) {
            Plotly.newPlot(
                sumRecordsStackedBarChartRef.current, 
                sumRecordsByYearAndOrgTypeTrace,
                {
                    title: {
                        text: "Records Lost by Year and Organization Type"
                    },
                    barmode: "stack",
                    colorway: [
                        "#1A365D",
                        "#2B6CB0",
                        "#4299E1",
                        "#63B3ED",
                        "#4FD1C5",
                        "#81E6D9"
                    ],
                    yaxis: {
                        type: 'log',
                        title: {
                            text: 'Records (log scale)'
                        },
                        dtick: 1
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
    }, [activeTab])


    return (
        <div className="flex">
            <Tabs.Root defaultValue="tab1" orientation="vertical" onValueChange={setActiveTab}>
                <Tabs.List aria-label="tabs example">
                    <Tabs.Trigger value="tab1">One</Tabs.Trigger>
                    <Tabs.Trigger value="tab2">Two</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="tab1">
                    <div ref={sumRecordsStackedBarChartRef} style={{ width: 900, height: 650 }} />
                </Tabs.Content>
                <Tabs.Content value="tab2">
                    <div ref={sumRecordsBarChartRef} style={{ width: 900, height: 650 }} />
                </Tabs.Content>
            </Tabs.Root>
        </div>
    )
}