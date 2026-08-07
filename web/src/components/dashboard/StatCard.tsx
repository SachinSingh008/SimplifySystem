import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: number; // positive = up, negative = down
  trendLabel?: string;
  color?: "green" | "blue" | "yellow" | "red";
}

const colorMap = {
  green: "bg-green-brand-100 text-green-brand-600",
  blue: "bg-blue-100 text-blue-600",
  yellow: "bg-yellow-100 text-yellow-600",
  red: "bg-red-100 text-red-600",
};

export default function StatCard({
  title, value, icon: Icon,
  trend, trendLabel, color = "green",
}: StatCardProps) {
  return (
    <div className="card p-6 flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 mb-1">{title}</p>
        <p className="font-poppins font-bold text-2xl text-slate-900">{value}</p>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? "text-green-brand-600" : "text-red-500"}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(trend)}% {trendLabel ?? "vs last month"}</span>
          </div>
        )}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}
