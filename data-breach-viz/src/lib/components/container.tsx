import type { DSVParsedArray } from "d3-dsv"
import { formatNumber } from "../utils";
import { computeKPIs } from "../computation";
import KPICard from "./kpi-card";
import { useMemo } from "react";

import RQ1 from "./charts/rq1-alternate";
import RQ2 from "./charts/rq2";
import RQ3 from "./charts/rq3";
import RQ1FrequencySeverity from "./charts/frequency-severity-chart";
import HeatmapManager from "./charts/heatmap-manager";

export interface DashboardContainerProps {
   data: DSVParsedArray<{
        entity: string;
        year: number;
        records: number;
        organization_type: string;
        method: string;
    }>
}

export default function DashboardContainer({ data }: DashboardContainerProps) {
    const computedKPIs  = useMemo(() => {
        return computeKPIs(data)
    }, [])

    const {
        totalBreaches,
        totalRecords,
        peakYear,
        mostCommonMethod
    } = computedKPIs

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    Data Breach Dashboard
                </h1>
                <p className="text-slate-500">2004 - 2022</p>
            </header>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KPICard label="Total Breaches" value={totalBreaches} />
                <KPICard label="Total Records" value={formatNumber(totalRecords)} />
                <KPICard label="Peak Year" value={peakYear} />
                <KPICard label="Top Method" value={mostCommonMethod} />
            </div>

            <div className="mb-6">
                 <h2 className="text-xl font-semibold text-slate-700 mb-3">
                    Breach Volume Over Time
                </h2>
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <RQ1 data={data} />
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-700 mb-3">
                    Industry Impact
                </h2>
                <div className="flex bg-white rounded-lg shadow p-4 mb-6">
                    <RQ1FrequencySeverity data={data} />
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-700 mb-3">
                    Breach Methods & Severity
                </h2>
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex justify-between gap-6">
                        <div className="flex-1">
                            <RQ2 data={data} />
                        </div>
                        <div className="flex-1">
                            <RQ3 data={data} />
                        </div>
                    </div>
                    <div className="mt-10">
                        <HeatmapManager data={data} />
                    </div>
                    {/* <div className="bg-white rounded-lg shadow p-4 mb-6">
                        <MethodPieChart data={data} />
                    </div> */}
                </div>
            </div>
        </div>
    )
}