import type { DSVParsedArray } from "d3-dsv"

import RQ1 from "./charts/rq1";
import RQ2 from "./charts/rq2";
import RQ3 from "./charts/rq3";

export interface DashboardContainerProps {
   data: DSVParsedArray<{
        entity: string;
        year: number;
        records: number;
        organization_type: string;
        method: string;
    }>
}

export default function DashboardContainer({ data } : DashboardContainerProps) {
    return (
        <div className="flex flex-col">
            <div className="flex">
                <RQ1 data={data} />
            </div>
            <div className="flex">
                <RQ2 data={data} />
            </div>
            <div className="flex">
                <RQ3 data={data} />
            </div>
        </div>
    )
}