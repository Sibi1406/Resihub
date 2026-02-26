export default function SecurityToast({ toast }) {
    if (!toast) return null;
    return (
        <div className="fixed right-4 bottom-6 bg-white p-3 rounded-lg shadow-md border" style={{ minWidth: 220 }}>
            <div className="text-sm font-medium">{toast.title}</div>
            <div className="text-xs text-slate-500 mt-1">{toast.message}</div>
        </div>
    );
}
