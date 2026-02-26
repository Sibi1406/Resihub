import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function FundsChart({ entries = [] }) {
    // aggregate by date
    const map = {};
    entries.forEach((e) => {
        const d = e.createdAt?.seconds ? new Date(e.createdAt.seconds * 1000) : new Date(e.createdAt || Date.now());
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2,'0')}`;
        if (!map[key]) map[key] = { income: 0, expense: 0 };
        if (e.type === 'income') map[key].income += Number(e.amount) || 0;
        else map[key].expense += Number(e.amount) || 0;
    });

    const labels = Object.keys(map).sort();
    const incomeData = labels.map((l) => map[l].income);
    const expenseData = labels.map((l) => map[l].expense);

    const data = {
        labels,
        datasets: [
            {
                label: 'Income',
                data: incomeData,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16,185,129,0.12)',
                tension: 0.3,
            },
            {
                label: 'Expense',
                data: expenseData,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59,130,246,0.08)',
                tension: 0.3,
            },
        ],
    };

    const opts = { responsive: true, plugins: { legend: { position: 'top' } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(15,23,42,0.04)' } } } };

    return (
        <div className="card p-4">
            <h4 className="text-sm text-slate-600 mb-2">Funds (Monthly)</h4>
            <Line data={data} options={opts} />
        </div>
    );
}
