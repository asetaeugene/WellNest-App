import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { JournalEntry } from '../types';
import { useTheme } from '../context/ThemeContext';

interface MoodChartProps {
  entries: JournalEntry[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-border p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="label font-bold text-brand-dark dark:text-brand-light">{`${label}`}</p>
          <p className="intro text-text-primary dark:text-dark-text-primary">{`Mood Score : ${payload[0].value}`}</p>
          <p className="desc text-text-secondary dark:text-dark-text-secondary text-sm">A snapshot of your overall feeling.</p>
        </div>
      );
    }
  
    return null;
  };

const MoodChart: React.FC<MoodChartProps> = ({ entries }) => {
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridColor = theme === 'dark' ? '#374151' : '#e0e0e0';

  const data = entries
    .filter(entry => entry.analysis)
    .map(entry => {
        let sentimentScore = 50; // Neutral
        if (entry.analysis?.overallSentiment === 'Positive') {
            sentimentScore = 50 + (entry.analysis.emotions.find(e => e.emotion.toLowerCase() === 'joy' || e.emotion.toLowerCase() === 'happiness' || e.emotion.toLowerCase() === 'optimism')?.score || 50) / 2;
        } else if (entry.analysis?.overallSentiment === 'Negative') {
            sentimentScore = 50 - (entry.analysis.emotions.find(e => e.emotion.toLowerCase() === 'sadness' || e.emotion.toLowerCase() === 'anger' || e.emotion.toLowerCase() === 'stress')?.score || 50) / 2;
        }
        return {
            date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            sentiment: Math.max(0, Math.min(100, Math.round(sentimentScore))),
        };
    })
    .reverse(); 

  const averageSentiment = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.sentiment, 0) / data.length) : 0;

  if (data.length < 2) {
      return (
          <div className="flex flex-col items-center justify-center h-80 bg-white dark:bg-dark-surface rounded-xl shadow-md border-2 border-dashed border-gray-300 dark:border-dark-border p-4 text-center">
              <i className="fas fa-chart-pie text-4xl text-gray-400 dark:text-gray-500 mb-4"></i>
              <h3 className="font-bold text-text-primary dark:text-dark-text-primary">Not Enough Data Yet</h3>
              <p className="text-text-secondary dark:text-dark-text-secondary mt-1">Keep journaling to see your mood trends appear here!</p>
          </div>
      )
  }

  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border border-gray-200 dark:border-dark-border h-96">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34D399" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" stroke={axisColor} />
                <YAxis domain={[0, 100]} stroke={axisColor} label={{ value: 'Mood Score', angle: -90, position: 'insideLeft', fill: axisColor }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <ReferenceLine y={averageSentiment} label={{value: `Avg: ${averageSentiment}`, fill: '#065F46', position: 'insideTopLeft'}} stroke="#065F46" strokeDasharray="4 4" />
                <Area 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke="#065F46" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorSentiment)"
                  activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2, fill: '#065F46' }}
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};

export default MoodChart;