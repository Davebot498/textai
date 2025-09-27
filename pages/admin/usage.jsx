import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { BarChart, TrendingUp, Users, DollarSign, AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Admin Usage Dashboard for Texti AI
 * 
 * This page provides insights into usage patterns, costs, and system health.
 * In production, this should be protected with authentication.
 */
export default function AdminUsagePage() {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch usage data from API
  const fetchUsageData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/usage');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUsageData(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch usage data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchUsageData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchUsageData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading && !usageData) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-muted-text">Loading usage data...</p>
        </div>
      </div>
    );
  }

  if (error && !usageData) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-headline-white mb-2">Error Loading Data</h1>
          <p className="text-muted-text mb-4">{error}</p>
          <button onClick={fetchUsageData} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Mock data if API endpoint doesn't exist yet
  const mockData = {
    today: {
      requests: 42,
      characters: 15420,
      estimatedCost: 4.63,
      errors: 2,
      voices: ['Dave', 'Chisom', 'Alex'],
      languages: ['en', 'pidgin'],
    },
    thisMonth: {
      requests: 1250,
      characters: 456780,
      estimatedCost: 137.03,
      errors: 23,
    },
    allTime: {
      requests: 5680,
      characters: 2134560,
      estimatedCost: 640.37,
      errors: 89,
    },
    dailyBreakdown: [
      { date: '2024-01-15', requests: 35, characters: 12400, estimatedCost: 3.72 },
      { date: '2024-01-14', requests: 28, characters: 9800, estimatedCost: 2.94 },
      { date: '2024-01-13', requests: 52, characters: 18900, estimatedCost: 5.67 },
      { date: '2024-01-12', requests: 41, characters: 15200, estimatedCost: 4.56 },
      { date: '2024-01-11', requests: 33, characters: 11700, estimatedCost: 3.51 },
    ],
  };

  const data = usageData || mockData;

  return (
    <>
      <Head>
        <title>Admin Usage Dashboard - Texti AI</title>
        <meta name="description" content="Usage analytics and monitoring for Texti AI" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-headline-white">Usage Dashboard</h1>
                <p className="text-muted-text">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={fetchUsageData}
                disabled={loading}
                className="flex items-center gap-2 btn-secondary disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today's Requests */}
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-500 bg-opacity-20 rounded-lg">
                  <BarChart className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs text-green-400">Today</span>
              </div>
              <h3 className="text-2xl font-bold text-headline-white">{formatNumber(data.today.requests)}</h3>
              <p className="text-muted-text text-sm">Requests</p>
            </div>

            {/* Today's Characters */}
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-500 bg-opacity-20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-xs text-green-400">Today</span>
              </div>
              <h3 className="text-2xl font-bold text-headline-white">{formatNumber(data.today.characters)}</h3>
              <p className="text-muted-text text-sm">Characters</p>
            </div>

            {/* Today's Cost */}
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-accent-orange bg-opacity-20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-accent-orange" />
                </div>
                <span className="text-xs text-green-400">Today</span>
              </div>
              <h3 className="text-2xl font-bold text-headline-white">{formatCurrency(data.today.estimatedCost)}</h3>
              <p className="text-muted-text text-sm">Estimated Cost</p>
            </div>

            {/* Error Rate */}
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-red-500 bg-opacity-20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <span className="text-xs text-red-400">Today</span>
              </div>
              <h3 className="text-2xl font-bold text-headline-white">{data.today.errors}</h3>
              <p className="text-muted-text text-sm">Errors ({((data.today.errors / data.today.requests) * 100).toFixed(1)}%)</p>
            </div>
          </div>

          {/* Period Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-headline-white mb-4">Today</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-text">Requests:</span>
                  <span className="text-headline-white font-medium">{formatNumber(data.today.requests)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text">Characters:</span>
                  <span className="text-headline-white font-medium">{formatNumber(data.today.characters)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text">Cost:</span>
                  <span className="text-headline-white font-medium">{formatCurrency(data.today.estimatedCost)}</span>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-headline-white mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-text">Requests:</span>
                  <span className="text-headline-white font-medium">{formatNumber(data.thisMonth.requests)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text">Characters:</span>
                  <span className="text-headline-white font-medium">{formatNumber(data.thisMonth.characters)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text">Cost:</span>
                  <span className="text-headline-white font-medium">{formatCurrency(data.thisMonth.estimatedCost)}</span>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-headline-white mb-4">All Time</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-text">Requests:</span>
                  <span className="text-headline-white font-medium">{formatNumber(data.allTime.requests)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text">Characters:</span>
                  <span className="text-headline-white font-medium">{formatNumber(data.allTime.characters)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text">Cost:</span>
                  <span className="text-headline-white font-medium">{formatCurrency(data.allTime.estimatedCost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Breakdown Chart */}
          {data.dailyBreakdown && (
            <div className="glass-effect rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-headline-white mb-6">Daily Breakdown (Last 5 Days)</h3>
              <div className="space-y-4">
                {data.dailyBreakdown.slice(-5).reverse().map((day, index) => {
                  const maxRequests = Math.max(...data.dailyBreakdown.map(d => d.requests));
                  const barWidth = (day.requests / maxRequests) * 100;
                  
                  return (
                    <div key={day.date} className="flex items-center gap-4">
                      <div className="w-20 text-sm text-muted-text">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-700 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="bg-accent-orange h-full rounded-full transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                          <div className="absolute inset-0 flex items-center px-3 text-xs text-white font-medium">
                            {day.requests} requests
                          </div>
                        </div>
                      </div>
                      <div className="w-20 text-sm text-muted-text text-right">
                        {formatCurrency(day.estimatedCost)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Voice and Language Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Voices */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-headline-white mb-4">Popular Voices (Today)</h3>
              <div className="space-y-3">
                {data.today.voices?.map((voice, index) => (
                  <div key={voice} className="flex items-center justify-between">
                    <span className="text-muted-text">{voice}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-accent-orange h-2 rounded-full"
                          style={{ width: `${100 - (index * 20)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-text w-8 text-right">
                        {Math.max(1, Math.floor((data.today.requests / data.today.voices.length) * (1 - index * 0.2)))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Usage */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-headline-white mb-4">Language Usage (Today)</h3>
              <div className="space-y-3">
                {data.today.languages?.map((language, index) => {
                  const langNames = {
                    'en': 'English',
                    'pidgin': 'Nigerian Pidgin',
                    'yo': 'Yoruba'
                  };
                  
                  return (
                    <div key={language} className="flex items-center justify-between">
                      <span className="text-muted-text">{langNames[language] || language}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-accent-orange h-2 rounded-full"
                            style={{ width: `${100 - (index * 30)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-text w-8 text-right">
                          {Math.max(1, Math.floor((data.today.requests / data.today.languages.length) * (1 - index * 0.3)))}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* System Health Alerts */}
          {data.today.errors > 5 && (
            <div className="mt-8 bg-red-900 bg-opacity-50 border border-red-500 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-lg font-semibold text-red-200">High Error Rate Detected</h3>
                  <p className="text-red-300">
                    {data.today.errors} errors today ({((data.today.errors / data.today.requests) * 100).toFixed(1)}% error rate). 
                    Consider investigating API connectivity or configuration issues.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}