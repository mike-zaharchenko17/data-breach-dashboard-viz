import type { DashboardContainerProps } from "../container";

interface RQ3Props extends DashboardContainerProps {}

export default function RQ3({ data } : RQ3Props) {
    console.log(data)
    return (
        <div className="flex">
            <p>RQ3</p>
        </div>
    )
}