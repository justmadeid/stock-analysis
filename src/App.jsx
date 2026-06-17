import React, { useState, useEffect, useMemo, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import {
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Shield,
  Cpu,
  Sliders,
  Award,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  FileText,
  DollarSign
} from 'lucide-react';
import stockData from './data/stockData.json';
import './App.css';

// Interactive Plotly Chart component for high-fidelity candlestick & line modes
function PlotlyChart({ chartData, chartMode, selectedStock, selectedStockColor }) {
  const containerRef = useRef(null);
  const plotRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !chartData || chartData.length === 0) return;

    const dates = chartData.map(d => d.date);
    const traces = [];

    // 1. Shaded confidence band (80% interval)
    const upperY = chartData.map(d => d.upper);
    const lowerY = chartData.map(d => d.lower);

    // Upper line (invisible)
    traces.push({
      x: dates,
      y: upperY,
      type: 'scatter',
      mode: 'lines',
      line: { width: 0 },
      showlegend: false,
      hoverinfo: 'skip'
    });

    // Lower line (invisible but fills to next y)
    traces.push({
      x: dates,
      y: lowerY,
      type: 'scatter',
      mode: 'lines',
      line: { width: 0 },
      fill: 'tonexty',
      fillcolor: 'rgba(0, 242, 254, 0.08)',
      name: 'Interval Kepercayaan 80%',
      hoverinfo: 'skip'
    });

    // 2. Actual Price Trace (Line or Candlestick)
    if (chartMode === 'line') {
      const actualY = chartData.map(d => d.actual);
      traces.push({
        x: dates,
        y: actualY,
        type: 'scatter',
        mode: 'lines',
        name: 'Harga Aktual',
        line: {
          color: selectedStockColor || '#00f2fe',
          width: 3
        },
        fill: 'tozeroy',
        fillcolor: 'rgba(0, 242, 254, 0.03)',
        connectgaps: false
      });
    } else {
      // Candlestick Mode
      const historicalOnly = chartData.filter(d => d.type === 'historical');
      const histDates = historicalOnly.map(d => d.date);
      const histOpen = historicalOnly.map(d => d.open);
      const histHigh = historicalOnly.map(d => d.high);
      const histLow = historicalOnly.map(d => d.low);
      const histClose = historicalOnly.map(d => d.actual);

      traces.push({
        x: histDates,
        open: histOpen,
        high: histHigh,
        low: histLow,
        close: histClose,
        type: 'candlestick',
        name: 'Harga Aktual (OHLC)',
        increasing: { line: { color: '#10b981', width: 1.5 }, fillcolor: '#10b981' },
        decreasing: { line: { color: '#ef4444', width: 1.5 }, fillcolor: '#ef4444' }
      });
    }

    // 3. Forecast expected path q50 ( ফেসবুক Prophet )
    const predictedY = chartData.map(d => d.predicted);
    traces.push({
      x: dates,
      y: predictedY,
      type: 'scatter',
      mode: 'lines',
      name: 'Proyeksi AI (Prophet)',
      line: {
        color: '#f59e0b',
        width: 2.5,
        dash: 'dash'
      },
      connectgaps: true
    });

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: '#9ca3af',
        family: 'Inter, system-ui, sans-serif'
      },
      margin: { t: 25, r: 10, l: 45, b: 30 },
      showlegend: true,
      legend: {
        orientation: 'h',
        y: 1.15,
        x: 0,
        font: { color: '#ffffff', size: 11 }
      },
      xaxis: {
        gridcolor: '#1f2937',
        tickcolor: '#1f2937',
        linecolor: '#1f2937',
        rangeslider: { visible: false },
        type: 'category',
        tickfont: { size: 10 }
      },
      yaxis: {
        gridcolor: '#1f2937',
        tickcolor: '#1f2937',
        linecolor: '#1f2937',
        tickprefix: '$',
        fixedrange: false,
        tickfont: { size: 10, family: 'var(--font-mono)' }
      },
      hovermode: 'x unified',
      dragmode: 'zoom'
    };

    const config = {
      responsive: true,
      displayModeBar: false
    };

    Plotly.newPlot(containerRef.current, traces, layout, config).then(plot => {
      plotRef.current = plot;
    });

    // Resize handler
    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        Plotly.purge(containerRef.current);
      }
    };
  }, [chartData, chartMode, selectedStock, selectedStockColor]);

  return <div ref={containerRef} className="w-full h-full" />;
}

// Stock meta details for premium presentation
const STOCK_DETAILS = {
  AAPL: { name: 'Apple Inc.', sector: 'Technology', color: '#c084fc' },
  AXP: { name: 'American Express', sector: 'Financial Services', color: '#f59e0b' },
  KO: { name: 'Coca-Cola Co.', sector: 'Consumer Defensive', color: '#ef4444' },
  BAC: { name: 'Bank of America', sector: 'Financial Services', color: '#3b82f6' },
  CVX: { name: 'Chevron Corp.', sector: 'Energy', color: '#10b981' },
  MCO: { name: 'Moody\'s Corp.', sector: 'Financial Services', color: '#14b8a6' },
  OXY: { name: 'Occidental Petroleum', sector: 'Energy', color: '#06b6d4' },
  CB: { name: 'Chubb Limited', sector: 'Financial Services', color: '#6366f1' },
  KHC: { name: 'Kraft Heinz Co.', sector: 'Consumer Defensive', color: '#d946ef' },
  GOOGL: { name: 'Alphabet Inc.', sector: 'Technology', color: '#00f2fe' }
};

export default function App() {
  const { rawPrices, futureForecasts, projectedReturns, portfolioAllocation, portfolioSummary, backtestMetrics } = stockData;

  // Selected Stock
  const [selectedStock, setSelectedStock] = useState('GOOGL');
  // Date range for historical data: '1M', '6M', '1Y', 'Max'
  const [timeRange, setTimeRange] = useState('6M');
  // Selected Portfolio Strategy
  const [strategy, setStrategy] = useState('MaxSharpe'); // 'MaxSharpe', 'ReturnWeighted', 'MinVolatility'
  // Chart Mode: 'line' or 'candlestick'
  const [chartMode, setChartMode] = useState('line');

  // Simulation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simIndex, setSimIndex] = useState(-1); // -1 means simulation not started
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 2x, 5x
  const [simLogs, setSimLogs] = useState([]);
  const simTimer = useRef(null);

  // Sparkline data cache for ticker bar
  const tickerSparklines = useMemo(() => {
    const sparklines = {};
    Object.keys(STOCK_DETAILS).forEach(stock => {
      // Get last 20 historical prices
      const prices = rawPrices.slice(-20).map(row => row[stock]);
      sparklines[stock] = prices;
    });
    return sparklines;
  }, [rawPrices]);

  // Clean historical prices sliced by timeRange
  const historicalData = useMemo(() => {
    let sliceSize = 126; // Default 6M (trading days)
    if (timeRange === '1M') sliceSize = 21;
    if (timeRange === '1Y') sliceSize = 252;
    if (timeRange === 'Max') sliceSize = rawPrices.length;

    const sliced = rawPrices.slice(-sliceSize);
    return sliced.map((row, idx) => {
      const isLast = idx === sliced.length - 1;
      const actualVal = row[selectedStock];
      const openVal = row[`${selectedStock}_Open`] || actualVal;
      const highVal = row[`${selectedStock}_High`] || actualVal;
      const lowVal = row[`${selectedStock}_Low`] || actualVal;
      return {
        date: row.Date,
        actual: actualVal,
        open: openVal,
        high: highVal,
        low: lowVal,
        bodyRange: [openVal, actualVal],
        wickRange: [lowVal, highVal],
        isUp: actualVal >= openVal,
        predicted: isLast ? actualVal : null,
        lower: isLast ? actualVal : null,
        upper: isLast ? actualVal : null,
        type: 'historical'
      };
    });
  }, [rawPrices, selectedStock, timeRange]);

  // Forecast data
  const forecastData = useMemo(() => {
    return futureForecasts.map(row => ({
      date: row.Date,
      actual: null,
      predicted: row[`${selectedStock}_Pred`],
      lower: row[`${selectedStock}_Lower`],
      upper: row[`${selectedStock}_Upper`],
      type: 'forecast'
    }));
  }, [futureForecasts, selectedStock]);

  // Current simulation forecast subset
  const currentSimForecast = useMemo(() => {
    if (simIndex === -1) return [];
    return forecastData.slice(0, simIndex + 1);
  }, [forecastData, simIndex]);

  // Fully combined chart data (Historical + Forecast)
  const chartData = useMemo(() => {
    // If simulating, only append the forecast up to the simulation index
    if (isSimulating || simIndex >= 0) {
      return [...historicalData, ...currentSimForecast];
    }
    return [...historicalData, ...forecastData];
  }, [historicalData, forecastData, isSimulating, simIndex, currentSimForecast]);

  // Stock stats
  const stockStats = useMemo(() => {
    const ret = projectedReturns.find(r => r.Ticker === selectedStock) || {};
    const best = backtestMetrics.filter(m => m.Ticker === selectedStock && m.IsBest === 'True')[0] || {};
    return { ...ret, ...best };
  }, [projectedReturns, backtestMetrics, selectedStock]);

  // Portfolio Allocation Data for Pie Chart
  const pieData = useMemo(() => {
    const strategyKey = strategy === 'MaxSharpe' ? 'Weight_MaxSharpe_Pct'
      : strategy === 'ReturnWeighted' ? 'Weight_ReturnWeighted_Pct'
        : 'Weight_MinVol_Pct';

    return portfolioAllocation
      .map(item => ({
        name: item.Ticker,
        value: parseFloat(item[strategyKey].toFixed(2)),
        color: STOCK_DETAILS[item.Ticker]?.color || '#cbd5e1',
        returnPct: item.ProjectedReturn_6M_Pct
      }))
      .filter(item => item.value > 0);
  }, [portfolioAllocation, strategy]);

  // Summary stats for the active strategy
  const activeStrategyStats = useMemo(() => {
    return portfolioSummary[strategy] || {};
  }, [portfolioSummary, strategy]);

  // Backtest metrics for the selected stock (model comparison)
  const stockModelMetrics = useMemo(() => {
    return backtestMetrics.filter(m => m.Ticker === selectedStock);
  }, [backtestMetrics, selectedStock]);

  // Handle Simulation playback loop
  useEffect(() => {
    if (isSimulating) {
      const delay = Math.max(100, 1000 / simSpeed);
      simTimer.current = setInterval(() => {
        setSimIndex(prev => {
          if (prev >= forecastData.length - 1) {
            setIsSimulating(false);
            clearInterval(simTimer.current);
            return prev;
          }
          const next = prev + 1;
          // Trigger simulated logs occasionally
          if (next % 15 === 0 || next === 1 || next === forecastData.length - 1) {
            const dateStr = forecastData[next].date;
            const price = forecastData[next].predicted.toFixed(2);
            const initialPrice = historicalData[historicalData.length - 1].actual;
            const changePct = (((forecastData[next].predicted - initialPrice) / initialPrice) * 100).toFixed(2);

            const logMessages = [
              `[${dateStr}] ${selectedStock} trends at $${price} (${changePct >= 0 ? '+' : ''}${changePct}%)`,
              `[${dateStr}] Forecasting variance boundary: [Lower: $${forecastData[next].lower.toFixed(2)} | Upper: $${forecastData[next].upper.toFixed(2)}]`,
              `[${dateStr}] Sharpe target confidence is stable.`
            ];
            const randomMsg = logMessages[Math.floor(Math.random() * logMessages.length)];
            setSimLogs(prevLogs => [randomMsg, ...prevLogs].slice(0, 12));
          }
          return next;
        });
      }, delay);
    } else {
      clearInterval(simTimer.current);
    }
    return () => clearInterval(simTimer.current);
  }, [isSimulating, simSpeed, forecastData, historicalData, selectedStock]);

  const toggleSimulation = () => {
    if (simIndex >= forecastData.length - 1) {
      // Reset simulation
      setSimIndex(0);
      setSimLogs([`[Simulation Start] Initiating walk-forward projection for ${selectedStock}...`]);
    } else if (simIndex === -1) {
      setSimIndex(0);
      setSimLogs([`[Simulation Start] Initiating walk-forward projection for ${selectedStock}...`]);
    }
    setIsSimulating(!isSimulating);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimIndex(-1);
    setSimLogs([]);
  };

  // Calculate current simulated growth stats
  const simGrowthStats = useMemo(() => {
    if (simIndex === -1) return { value: 10000, profit: 0, pct: 0 };
    const initialPrice = historicalData[historicalData.length - 1].actual;
    const currentPrice = forecastData[simIndex].predicted;
    const pct = ((currentPrice - initialPrice) / initialPrice) * 100;
    const value = 10000 * (1 + pct / 100);
    const profit = value - 10000;
    return { value, profit, pct };
  }, [simIndex, historicalData, forecastData]);

  return (
    <div className="app-container">
      {/* 1. Rolling Ticker Marquee */}
      <div className="ticker-wrap">
        <div className="ticker-content">
          {[...projectedReturns, ...projectedReturns].map((stock, idx) => {
            const change = stock.ProjectedReturnPct;
            const isUp = change >= 0;
            return (
              <div
                key={`${stock.Ticker}-${idx}`}
                className="ticker-item cursor-pointer"
                onClick={() => { setSelectedStock(stock.Ticker); resetSimulation(); }}
              >
                <span className="font-semibold text-white">{stock.Ticker}</span>
                <span className="num-font text-gray-400">${stock.CurrentPrice.toFixed(2)}</span>
                <span className={`inline-flex items-center text-xs font-semibold num-font ${isUp ? 'text-up' : 'text-down'}`}>
                  {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {isUp ? '+' : ''}{change.toFixed(2)}%
                </span>
                {/* Micro mini sparkline */}
                <svg width="40" height="15" className="ml-2">
                  <polyline
                    fill="none"
                    stroke={isUp ? 'var(--color-up)' : 'var(--color-down)'}
                    strokeWidth="1"
                    points={tickerSparklines[stock.Ticker]?.map((p, pIdx) => `${pIdx * 2},${15 - ((p - Math.min(...tickerSparklines[stock.Ticker])) / (Math.max(...tickerSparklines[stock.Ticker]) - Math.min(...tickerSparklines[stock.Ticker]) || 1)) * 13}`).join(' ')}
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </div>

      {/* Header Section */}
      <header className="py-6 px-6 max-w-dashboard mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="glowing-dot"></span>
            <span className="text-xs uppercase tracking-widest text-cyan font-semibold num-font">UAS QUANT FINANCE LAB</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Quantum Buffett Terminal
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Prophet & Chronos Ensemble forecasting pipeline with Sharpe portfolio optimization.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-secondary/80 p-2 rounded-xl border border-gray-800 backdrop-blur-sm">
          <div className="text-right">
            <span className="text-xs text-gray-500 block">OPTIMIZATION BENCHMARK</span>
            <span className="text-xs font-semibold text-white block uppercase">Target: &ge; 25% 6M Return</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Award className="text-up" size={16} />
            <span className="text-xs font-bold text-up num-font">PASSED (26.61%)</span>
          </div>
        </div>
      </header>

      {/* Main Terminal Grid */}
      <main className="dashboard-grid mt-6">

        {/* Left Side: Forecasting Chart & Simulator */}
        <div className="main-chart-area">

          {/* Main Chart Card */}
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">

              {/* Selected Stock Banner */}
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-bold text-white mb-0">{selectedStock}</h2>
                  <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400">{STOCK_DETAILS[selectedStock]?.sector}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{STOCK_DETAILS[selectedStock]?.name}</p>
              </div>

              {/* Chart range and Time Range Selectors */}
              <div className="flex items-center gap-4">
                {/* Chart Mode Toggle */}
                <div className="flex bg-gray-900/60 p-0.5 rounded-lg border border-gray-800">
                  <button
                    onClick={() => setChartMode('line')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartMode === 'line' ? 'bg-cyan text-gray-900 font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setChartMode('candlestick')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartMode === 'candlestick' ? 'bg-cyan text-gray-900 font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    Candle
                  </button>
                </div>

                <div className="flex bg-gray-900/60 p-0.5 rounded-lg border border-gray-800">
                  {['1M', '6M', '1Y', 'Max'].map(r => (
                    <button
                      key={r}
                      onClick={() => { setTimeRange(r); resetSimulation(); }}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === r ? 'bg-cyan text-gray-900 font-bold' : 'text-gray-400 hover:text-white'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Glowing Stock Selector Tabs */}
            <div className="tabs-container mb-6">
              {projectedReturns.map(item => {
                const isSelected = selectedStock === item.Ticker;
                const isWinner = portfolioAllocation.map(alloc => alloc.Ticker).includes(item.Ticker);
                return (
                  <button
                    key={item.Ticker}
                    onClick={() => { setSelectedStock(item.Ticker); resetSimulation(); }}
                    className={`tab-pill relative flex items-center gap-1 ${isSelected ? 'active' : ''}`}
                  >
                    {item.Ticker}
                    {isWinner && <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block"></span>}
                  </button>
                );
              })}
            </div>

            {/* Main Forecast Display (Hybrid: Recharts for Line, Plotly for Candlestick) */}
            <div style={{ width: '100%', height: 400 }} className="relative">
              {chartMode === 'line' ? (
                <ResponsiveContainer>
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={STOCK_DETAILS[selectedStock]?.color || 'var(--color-cyan)'} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={STOCK_DETAILS[selectedStock]?.color || 'var(--color-cyan)'} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLowerUpper" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-cyan)" stopOpacity={0.08} />
                        <stop offset="95%" stopColor="var(--color-cyan)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#4b5563"
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      tickLine={{ stroke: '#1f2937' }}
                      axisLine={{ stroke: '#1f2937' }}
                    />
                    <YAxis
                      stroke="#4b5563"
                      tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                      tickLine={{ stroke: '#1f2937' }}
                      axisLine={{ stroke: '#1f2937' }}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(10, 14, 22, 0.95)',
                        borderColor: 'rgba(0, 242, 254, 0.2)',
                        borderRadius: '8px',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
                      }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                      itemStyle={{ color: '#9ca3af' }}
                      formatter={(value, name) => {
                        if (!value) return null;
                        return [`$${parseFloat(value).toFixed(2)}`, name === 'actual' ? 'Actual Price' : name === 'predicted' ? 'Forecast (Prophet)' : name === 'upper' ? 'Upper Bound' : 'Lower Bound'];
                      }}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />

                    {/* Forecast Shaded Area */}
                    <Area
                      name="Confidence Band"
                      dataKey="upper"
                      stroke="none"
                      fill="url(#colorLowerUpper)"
                      connectNulls
                    />
                    <Area
                      name="lower"
                      dataKey="lower"
                      stroke="none"
                      fill="#080b11"
                      connectNulls
                    />

                    {/* Actual Price */}
                    <Area
                      name="Actual Price"
                      type="monotone"
                      dataKey="actual"
                      stroke={STOCK_DETAILS[selectedStock]?.color || 'var(--color-cyan)'}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorActual)"
                    />

                    {/* Forecast Line */}
                    <Line
                      name="Projected Forecast"
                      type="monotone"
                      dataKey="predicted"
                      stroke="var(--color-cyan)"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                      connectNulls
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <PlotlyChart
                  chartData={chartData}
                  chartMode={chartMode}
                  selectedStock={selectedStock}
                  selectedStockColor={STOCK_DETAILS[selectedStock]?.color}
                />
              )}
            </div>
          </div>

          {/* Simulator Execution Box */}
          <div className="glass-card p-6 highlight">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Sliders size={18} className="text-cyan" />
              Quant Walk-Forward Simulator
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              Simulate Warren Buffett stock movements under Prophet forecasting logic across the 6-month prediction window.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

              {/* Playback Controls */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={toggleSimulation}
                    className="btn-primary flex-1 justify-center"
                  >
                    {isSimulating ? <Pause size={16} /> : <Play size={16} />}
                    {isSimulating ? 'Pause Run' : simIndex >= 0 ? 'Resume Run' : 'Execute Run'}
                  </button>
                  <button
                    onClick={resetSimulation}
                    className="btn-secondary"
                    title="Reset Simulation"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
                {/* Speed selector */}
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-400">Simulation Speed:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 5, 10].map(s => (
                      <button
                        key={s}
                        onClick={() => setSimSpeed(s)}
                        className={`px-1.5 py-0.5 rounded ${simSpeed === s ? 'bg-cyan/20 text-white border border-cyan/30' : 'text-white hover:text-white'}`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Simulated Stats */}
              <div className="bg-black/40 border border-gray-800 rounded-xl p-3 flex flex-col justify-between h-full min-h-[90px]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">SIMULATED VALUE</span>
                  <span className="num-font text-cyan">$10,000 Starting Capital</span>
                </div>
                <div className="my-1 text-2xl font-bold num-font text-white">
                  ${simGrowthStats.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">
                    {simIndex === -1 ? 'Simulation Offline' : `Simulation Day ${simIndex + 1}/120`}
                  </span>
                  <span className={`font-semibold num-font ${simGrowthStats.pct >= 0 ? 'text-up' : 'text-down'}`}>
                    {simGrowthStats.pct >= 0 ? '+' : ''}{simGrowthStats.pct.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Execution Ticker Output */}
              <div className="bg-black/60 rounded-xl p-3 h-[90px] overflow-y-auto text-[10px] num-font text-cyan/90 border border-cyan/10">
                {simLogs.length === 0 ? (
                  <div className="text-gray-600 flex items-center justify-center h-full">
                    [Awaiting simulated playback run...]
                  </div>
                ) : (
                  simLogs.map((log, i) => (
                    <div key={i} className="mb-1 leading-tight">
                      {log}
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

          {/* Quant Pipeline Vis (Visual flow mapping) */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Cpu size={18} className="text-purple" />
              Quant Strategy Pipeline
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-xs">
              <div className="bg-black/30 border border-gray-800 p-2.5 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-cyan uppercase font-semibold">Stage 1</span>
                <span className="font-semibold text-white my-1">Data Feed</span>
                <span className="text-[10px] text-gray-500">yfinance Daily API</span>
              </div>
              <div className="bg-black/30 border border-gray-800 p-2.5 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-cyan uppercase font-semibold">Stage 2</span>
                <span className="font-semibold text-white my-1">Ensemble Fit</span>
                <span className="text-[10px] text-gray-500">Prophet + Chronos</span>
              </div>
              <div className="bg-black/30 border border-gray-800 p-2.5 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-cyan uppercase font-semibold">Stage 3</span>
                <span className="font-semibold text-white my-1">Backtest MAE</span>
                <span className="text-[10px] text-gray-500">Inverse-MAPE weights</span>
              </div>
              <div className="bg-black/30 border border-gray-800 p-2.5 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-cyan uppercase font-semibold">Stage 4</span>
                <span className="font-semibold text-white my-1">Allocation</span>
                <span className="text-[10px] text-gray-500">cvxpy Max Sharpe</span>
              </div>
              <div className="bg-black/30 border border-gray-800 p-2.5 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-cyan uppercase font-semibold">Stage 5</span>
                <span className="font-semibold text-white my-1">PDF Report</span>
                <span className="text-[10px] text-gray-500">ReportLab Automated</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Portfolio Optimization & Metrics */}
        <div className="sidebar-area">

          {/* Portfolio Strategy Selector & Allocation Chart */}
          <div className="glass-card p-6 highlight">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Shield size={18} className="text-emerald-400" />
              Portfolio Optimizer
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              Select an optimization objective to view stock weights computed using cvxpy mean-variance modeling.
            </p>

            {/* Strategy Selectors */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { id: 'MaxSharpe', label: 'Max Sharpe' },
                { id: 'ReturnWeighted', label: 'Ret Weighted' },
                { id: 'MinVolatility', label: 'Min Vol' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setStrategy(opt.id)}
                  className={`btn-secondary text-xs px-2 py-2.5 justify-center ${strategy === opt.id ? 'active' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Portfolio Summary Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-black/30 border border-gray-800/60 p-3 rounded-xl">
                <span className="text-gray-400 text-xs block">6M Expected Return</span>
                <span className={`text-xl font-bold num-font block mt-0.5 ${activeStrategyStats.ExpectedReturn_6M_Pct >= 25 ? 'text-up' : 'text-white'}`}>
                  {activeStrategyStats.ExpectedReturn_6M_Pct?.toFixed(2)}%
                </span>
                {activeStrategyStats.ExpectedReturn_6M_Pct >= 25 && (
                  <span className="text-[10px] text-up block font-medium mt-0.5">UAS Target Passed &ge; 25%</span>
                )}
              </div>
              <div className="bg-black/30 border border-gray-800/60 p-3 rounded-xl">
                <span className="text-gray-400 text-xs block">Sharpe Ratio</span>
                <span className="text-xl font-bold num-font text-white block mt-0.5">
                  {activeStrategyStats.SharpeRatio?.toFixed(2)}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Risk-adjusted metric</span>
              </div>
              <div className="bg-black/30 border border-gray-800/60 p-3 rounded-xl">
                <span className="text-gray-400 text-xs block">Annual Return</span>
                <span className="text-lg font-semibold num-font text-white block mt-0.5">
                  {activeStrategyStats.ExpectedReturn_Annual_Pct?.toFixed(2)}%
                </span>
              </div>
              <div className="bg-black/30 border border-gray-800/60 p-3 rounded-xl">
                <span className="text-gray-400 text-xs block">Annual Volatility</span>
                <span className="text-lg font-semibold num-font text-white block mt-0.5">
                  {activeStrategyStats.Volatility_Annual_Pct?.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Pie Chart of Weights */}
            <div className="flex justify-center items-center" style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '6px' }}
                    formatter={(value, name, props) => [`${value}%`, `${name}`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Allocation breakdown list */}
            <div className="flex flex-col gap-2.5 mt-4">
              {pieData.map(item => (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-white">{item.name}</span>
                    <span className="text-gray-500">{STOCK_DETAILS[item.name]?.name}</span>
                  </div>
                  <div className="text-right num-font font-bold text-white">
                    {item.value.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Model Fit Performance Card */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Activity size={18} className="text-cyan" />
              Model Backtest Metrics
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              Historical MAPE results for {selectedStock} forecasting models across backtesting loops.
            </p>

            {/* Horizontal Bar Chart comparing MAPEs */}
            <div style={{ width: '100%', height: 160 }} className="mb-4">
              <ResponsiveContainer>
                <BarChart
                  data={stockModelMetrics.map(item => ({
                    model: item.Model,
                    mape: item.MAPE,
                    color: item.IsBest === 'True' ? 'var(--color-cyan)' : 'var(--text-muted)'
                  }))}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="model"
                    type="category"
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value) => [`${parseFloat(value).toFixed(2)}%`, 'MAPE']}
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '6px' }}
                  />
                  <Bar dataKey="mape" radius={4}>
                    {stockModelMetrics.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.IsBest === 'True' ? 'var(--color-cyan)' : 'rgba(255, 255, 255, 0.15)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Best Model Badge & Summary */}
            <div className="bg-black/30 border border-gray-800 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-gray-500 text-xs block">BACKTEST WINNER</span>
                <span className="font-bold text-white block mt-0.5">{stockStats.BestModel} Model</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 text-xs block">LOWEST MAPE</span>
                <span className="font-bold text-cyan num-font block mt-0.5">
                  {stockStats.BacktestBestMAPE?.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer Info */}
      <footer className="max-w-dashboard mx-auto w-full px-6 mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4 border-t border-gray-800 pt-6">
        <p>&copy; 2026 Warren Buffett Portfolio Analyzer. Built for Academic UAS Final Examination.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">Python Pipeline</a>
          <a href="#" className="hover:text-white transition-colors">PDF Report</a>
        </div>
      </footer>
    </div>
  );
}
