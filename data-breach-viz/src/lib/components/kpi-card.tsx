interface KPICardProps {
    label: string
    value: string | number
}

export default function KPICard({ label, value } : KPICardProps) {
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-semibold text-slate-800">{value}</p>
        </div>
    )
}