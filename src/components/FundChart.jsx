import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function FundChart({ income, expense }) {
    const data = [
        { name: 'Income', value: income },
        { name: 'Expense', value: expense },
    ];
    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                <YAxis tick={{ fill: '#6B7280' }} />
                <Tooltip />
                <Bar dataKey="value" name="Amount" fill="#10B981" />
            </BarChart>
        </ResponsiveContainer>
    );
}
