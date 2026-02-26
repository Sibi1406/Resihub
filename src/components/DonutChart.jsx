import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function DonutChart({ data, colors }) {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                    {data.map((entry, idx) => (
                        <Cell key={idx} fill={colors[idx % colors.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
}
