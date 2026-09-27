import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function ChartCard({ title, data, dataKey, unit, color = '#0e94e3', height = 260 }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-navy-900">{title}</h3>
        {unit && <span className="text-xs text-navy-800/50">{unit}</span>}
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f1fe" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              tick={{ fontSize: 11, fill: '#0f294299' }}
              minTickGap={40}
            />
            <YAxis tick={{ fontSize: 11, fill: '#0f294299' }} width={40} domain={['auto', 'auto']} />
            <Tooltip
              labelFormatter={(t) => new Date(t).toLocaleString()}
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #bae3fd',
                fontSize: 13,
                fontFamily: 'Poppins, sans-serif',
              }}
            />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
