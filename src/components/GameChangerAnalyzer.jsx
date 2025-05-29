import React, { useState } from 'react';
import { Upload, BarChart3, Users, Trophy, Target, TrendingUp } from 'lucide-react';

const GameChangerAnalyzer = () => {
  const [csvData, setCsvData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [analysisView, setAnalysisView] = useState('overview');

  // Function to identify players with concerning hitting stats
  const getPlayersNeedingAttention = () => {
    return players.map(player => {
      const stats = player.batting;
      const flags = [];
      
      const avg = parseFloat(stats.AVG) || 0;
      const slg = parseFloat(stats.SLG) || 0;
      const ops = parseFloat(stats.OPS) || 0;
      const gbPercent = parseFloat(stats['GB%']) || 0;
      
      // Calculate K% (strikeouts / plate appearances)
      const so = parseInt(stats.SO) || 0;
      const pa = parseInt(stats.PA) || 0;
      const kPercent = pa > 0 ? (so / pa) * 100 : 0;
      
      // Check for concerning stats
      if (avg < 0.250 && avg > 0) flags.push({ type: 'AVG', value: avg.toFixed(3), threshold: '.250', severity: 'high' });
      if (slg < 0.350 && slg > 0) flags.push({ type: 'SLG', value: slg.toFixed(3), threshold: '.350', severity: 'medium' });
      if (ops < 0.700 && ops > 0) flags.push({ type: 'OPS', value: ops.toFixed(3), threshold: '.700', severity: 'high' });
      if (gbPercent > 66) flags.push({ type: 'GB%', value: gbPercent.toFixed(1) + '%', threshold: '66%', severity: 'medium' });
      if (kPercent > 30) flags.push({ type: 'K%', value: kPercent.toFixed(1) + '%', threshold: '30%', severity: 'high' });
      
      return {
        player,
        flags,
        hasFlags: flags.length > 0,
        flagCount: flags.length,
        highSeverityFlags: flags.filter(f => f.severity === 'high').length
      };
    }).filter(p => p.hasFlags);
  };

  // Parse GameChanger CSV data
  const parseGameChangerCSV = (csvText) => {
    const lines = csvText.split('\n');
    const headerLine = lines[1]; // Second line contains actual headers
    const headers = headerLine.split(',').map(h => h.replace(/"/g, '').trim());
    
    // Define section boundaries
    const battingStart = 0;
    const pitchingStart = 54;
    const fieldingStart = 142;
    
    const battingHeaders = headers.slice(battingStart, pitchingStart);
    const pitchingHeaders = headers.slice(pitchingStart, fieldingStart);
    const fieldingHeaders = headers.slice(fieldingStart);
    
    // Parse player data (skip first 2 rows - section headers and column headers)
    const playerRows = lines.slice(2).filter(line => line.trim());
    
    const parsedPlayers = playerRows.map(row => {
      const values = row.split(',').map(v => v.replace(/"/g, '').trim());
      
      const batting = {};
      const pitching = {};
      const fielding = {};
      
      battingHeaders.forEach((header, i) => {
        const value = values[battingStart + i];
        batting[header] = value === '-' || value === '' ? null : value;
      });
      
      pitchingHeaders.forEach((header, i) => {
        const value = values[pitchingStart + i];
        pitching[header] = value === '-' || value === '' ? null : value;
      });
      
      fieldingHeaders.forEach((header, i) => {
        const value = values[fieldingStart + i];
        fielding[header] = value === '-' || value === '' ? null : value;
      });
      
      return { batting, pitching, fielding };
    }).filter(player => player.batting.First && player.batting.Last);
    
    return parsedPlayers;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target.result;
        setCsvData(csvText);
        const parsedPlayers = parseGameChangerCSV(csvText);
        setPlayers(parsedPlayers);
        if (parsedPlayers.length > 0) {
          setSelectedPlayer(parsedPlayers[0]);
        }
      };
      reader.readAsText(file);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value || '-'}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {Icon && <Icon className="h-8 w-8 text-blue-500" />}
      </div>
    </div>
  );

  const PlayerBattingAnalysis = ({ player }) => {
    const stats = player.batting;
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Batting Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Batting Avg" value={stats.AVG} />
            <StatCard title="On-Base %" value={stats.OBP} />
            <StatCard title="OPS" value={stats.OPS} />
            <StatCard title="Hits" value={stats.H} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard title="Games" value={stats.GP} subtitle="Games Played" />
          <StatCard title="Plate App." value={stats.PA} subtitle="Total PA" />
          <StatCard title="At Bats" value={stats.AB} />
          <StatCard title="Runs" value={stats.R} subtitle="Scored" />
          <StatCard title="RBIs" value={stats.RBI} subtitle="Runs Batted In" />
          <StatCard 
            title="BB%" 
            value={stats.PA && stats.BB ? ((parseInt(stats.BB) / parseInt(stats.PA)) * 100).toFixed(1) + '%' : '-'} 
            subtitle="Walk Rate" 
          />
          <StatCard 
            title="K%" 
            value={stats.PA && stats.SO ? ((parseInt(stats.SO) / parseInt(stats.PA)) * 100).toFixed(1) + '%' : '-'} 
            subtitle="Strikeout Rate" 
          />
          <StatCard 
            title="PS/PA" 
            value={stats['PS/PA'] || '-'} 
            subtitle="Pitches per PA" 
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Hit Distribution</h4>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats['1B'] || 0}</p>
              <p className="text-sm text-gray-600">Singles</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats['2B'] || 0}</p>
              <p className="text-sm text-gray-600">Doubles</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats['3B'] || 0}</p>
              <p className="text-sm text-gray-600">Triples</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.HR || 0}</p>
              <p className="text-sm text-gray-600">Home Runs</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PlayerPitchingAnalysis = ({ player }) => {
    const stats = player.pitching;
    const hasSignificantPitching = parseFloat(stats.IP) > 0;
    
    if (!hasSignificantPitching) {
      return (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">No significant pitching statistics recorded</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Pitching Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="ERA" value={stats.ERA} />
            <StatCard title="WHIP" value={stats.WHIP} />
            <StatCard title="Innings" value={stats.IP} />
            <StatCard title="Strikeouts" value={stats.SO} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard title="Wins" value={stats.W} />
          <StatCard title="Losses" value={stats.L} />
          <StatCard title="Games" value={stats.GP} subtitle="Pitched" />
          <StatCard title="Starts" value={stats.GS} />
          <StatCard title="Batters Faced" value={stats.BF} />
          <StatCard 
            title="BB%" 
            value={stats.BF && stats.BB ? ((parseInt(stats.BB) / parseInt(stats.BF)) * 100).toFixed(1) + '%' : '-'} 
            subtitle="Walk Rate" 
          />
          <StatCard 
            title="K%" 
            value={stats.BF && stats.SO ? ((parseInt(stats.SO) / parseInt(stats.BF)) * 100).toFixed(1) + '%' : '-'} 
            subtitle="Strikeout Rate" 
          />
        </div>
      </div>
    );
  };

  const PlayerFieldingAnalysis = ({ player }) => {
    const stats = player.fielding;
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-yellow-50 to-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Trophy className="mr-2 h-5 w-5" />
            Fielding Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Fielding %" value={stats.FPCT} />
            <StatCard title="Total Chances" value={stats.TC} />
            <StatCard title="Putouts" value={stats.PO} />
            <StatCard title="Assists" value={stats.A} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard title="Errors" value={stats.E} />
          <StatCard title="Double Plays" value={stats.DP} />
          <StatCard title="Innings" value={stats.INN} subtitle="Fielded" />
        </div>
      </div>
    );
  };

  const PlayerNeedsAttentionTab = () => {
    const playersNeedingAttention = getPlayersNeedingAttention();
    
    if (playersNeedingAttention.length === 0) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <Trophy className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Great News! 🎉
          </h3>
          <p className="text-green-700">
            No players currently have concerning hitting statistics based on the defined thresholds.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Players Needing Attention ({playersNeedingAttention.length})
          </h3>
          <p className="text-red-700 text-sm">
            Players with hitting statistics below recommended thresholds. Click on a player for detailed analysis.
          </p>
        </div>

        <div className="grid gap-4">
          {playersNeedingAttention
            .sort((a, b) => b.highSeverityFlags - a.highSeverityFlags || b.flagCount - a.flagCount)
            .map((playerData, index) => {
              const { player, flags } = playerData;
              const stats = player.batting;
              
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        #{stats.Number} {stats.First} {stats.Last}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {stats.GP} games • {stats.PA} plate appearances
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        playerData.highSeverityFlags > 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {flags.length} issue{flags.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700">Current Stats</h5>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">AVG</p>
                          <p className="font-semibold">{stats.AVG || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">SLG</p>
                          <p className="font-semibold">{stats.SLG || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">OPS</p>
                          <p className="font-semibold">{stats.OPS || '-'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700">Additional Metrics</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">GB%</p>
                          <p className="font-semibold">{stats['GB%'] || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">K%</p>
                          <p className="font-semibold">
                            {stats.PA && stats.SO ? ((parseInt(stats.SO) / parseInt(stats.PA)) * 100).toFixed(1) + '%' : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h5 className="font-medium text-gray-700 mb-2">Areas for Improvement</h5>
                    <div className="flex flex-wrap gap-2">
                      {flags.map((flag, flagIndex) => (
                        <div key={flagIndex} className={`px-3 py-1 rounded-full text-xs ${
                          flag.severity === 'high' 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          <span className="font-semibold">{flag.type}:</span> {flag.value} (target: ≥{flag.threshold})
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      onClick={() => {
                        setSelectedPlayer(player);
                        setAnalysisView('batting');
                      }}
                    >
                      View Detailed Analysis →
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Summary Statistics */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Issue Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-600">
                {playersNeedingAttention.filter(p => p.flags.some(f => f.type === 'AVG')).length}
              </p>
              <p className="text-xs text-gray-600">Low AVG (&lt;.250)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {playersNeedingAttention.filter(p => p.flags.some(f => f.type === 'SLG')).length}
              </p>
              <p className="text-xs text-gray-600">Low SLG (&lt;.350)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {playersNeedingAttention.filter(p => p.flags.some(f => f.type === 'OPS')).length}
              </p>
              <p className="text-xs text-gray-600">Low OPS (&lt;.700)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {playersNeedingAttention.filter(p => p.flags.some(f => f.type === 'GB%')).length}
              </p>
              <p className="text-xs text-gray-600">High GB% (&gt;66%)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {playersNeedingAttention.filter(p => p.flags.some(f => f.type === 'K%')).length}
              </p>
              <p className="text-xs text-gray-600">High K% (&gt;30%)</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-blue-600" />
              GameChanger Stats Analyzer
            </h1>
            <p className="mt-2 text-gray-600">
              Upload your GameChanger CSV export to analyze player statistics
            </p>
          </div>
        </div>

        {/* File Upload */}
        {!csvData && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload GameChanger CSV File
              </h3>
              <p className="text-gray-600 mb-4">
                Select your exported GameChanger statistics CSV file
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        )}

        {/* Player Analysis */}
        {csvData && players.length > 0 && (
          <div className="space-y-6">
            {/* Player Selection */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Select Player ({players.length} total)
              </h2>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedPlayer ? `${selectedPlayer.batting.First} ${selectedPlayer.batting.Last}` : ''}
                onChange={(e) => {
                  const playerName = e.target.value;
                  const player = players.find(p => `${p.batting.First} ${p.batting.Last}` === playerName);
                  setSelectedPlayer(player);
                }}
              >
                {players.map((player, index) => (
                  <option key={index} value={`${player.batting.First} ${player.batting.Last}`}>
                    #{player.batting.Number} - {player.batting.First} {player.batting.Last}
                  </option>
                ))}
              </select>
            </div>

            {/* Analysis Tabs */}
            {selectedPlayer && (
              <div className="bg-white shadow rounded-lg">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6">
                    {['batting', 'pitching', 'fielding', 'attention'].map((tab) => (
                      <button
                        key={tab}
                        className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                          analysisView === tab
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setAnalysisView(tab)}
                      >
                        {tab === 'attention' ? (
                          <span className="flex items-center">
                            Needs Attention
                            {getPlayersNeedingAttention().length > 0 && (
                              <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {getPlayersNeedingAttention().length}
                              </span>
                            )}
                          </span>
                        ) : tab}
                      </button>
                    ))}
                  </nav>
                </div>
                
                <div className="p-6">
                  {analysisView !== 'attention' && (
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedPlayer.batting.First} {selectedPlayer.batting.Last}
                      </h2>
                      <p className="text-gray-600">#{selectedPlayer.batting.Number}</p>
                    </div>
                  )}
                  
                  {analysisView === 'batting' && <PlayerBattingAnalysis player={selectedPlayer} />}
                  {analysisView === 'pitching' && <PlayerPitchingAnalysis player={selectedPlayer} />}
                  {analysisView === 'fielding' && <PlayerFieldingAnalysis player={selectedPlayer} />}
                  {analysisView === 'attention' && <PlayerNeedsAttentionTab />}
                </div>
              </div>
            )}

            {/* Team Overview */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Team Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <div className="text-center bg-blue-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{players.length}</p>
                  <p className="text-sm text-gray-600">Total Players</p>
                </div>
                <div className="text-center bg-green-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {(() => {
                      const totalHits = players.reduce((sum, p) => sum + (parseInt(p.batting.H) || 0), 0);
                      const totalAB = players.reduce((sum, p) => sum + (parseInt(p.batting.AB) || 0), 0);
                      return totalAB > 0 ? (totalHits / totalAB).toFixed(3) : '.000';
                    })()}
                  </p>
                  <p className="text-sm text-gray-600">Team AVG</p>
                </div>
                <div className="text-center bg-blue-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {(() => {
                      const totalH = players.reduce((sum, p) => sum + (parseInt(p.batting.H) || 0), 0);
                      const totalBB = players.reduce((sum, p) => sum + (parseInt(p.batting.BB) || 0), 0);
                      const totalHBP = players.reduce((sum, p) => sum + (parseInt(p.batting.HBP) || 0), 0);
                      const totalAB = players.reduce((sum, p) => sum + (parseInt(p.batting.AB) || 0), 0);
                      const totalSF = players.reduce((sum, p) => sum + (parseInt(p.batting.SF) || 0), 0);
                      const obp = (totalH + totalBB + totalHBP) / (totalAB + totalBB + totalHBP + totalSF);
                      return obp > 0 ? obp.toFixed(3) : '.000';
                    })()}
                  </p>
                  <p className="text-sm text-gray-600">Team OBP</p>
                </div>
                <div className="text-center bg-purple-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {(() => {
                      const totalTB = players.reduce((sum, p) => sum + (parseInt(p.batting.TB) || 0), 0);
                      const totalAB = players.reduce((sum, p) => sum + (parseInt(p.batting.AB) || 0), 0);
                      return totalAB > 0 ? (totalTB / totalAB).toFixed(3) : '.000';
                    })()}
                  </p>
                  <p className="text-sm text-gray-600">Team SLG</p>
                </div>
                <div className="text-center bg-green-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {(() => {
                      const totalH = players.reduce((sum, p) => sum + (parseInt(p.batting.H) || 0), 0);
                      const totalBB = players.reduce((sum, p) => sum + (parseInt(p.batting.BB) || 0), 0);
                      const totalHBP = players.reduce((sum, p) => sum + (parseInt(p.batting.HBP) || 0), 0);
                      const totalAB = players.reduce((sum, p) => sum + (parseInt(p.batting.AB) || 0), 0);
                      const totalSF = players.reduce((sum, p) => sum + (parseInt(p.batting.SF) || 0), 0);
                      const totalTB = players.reduce((sum, p) => sum + (parseInt(p.batting.TB) || 0), 0);
                      const obp = (totalH + totalBB + totalHBP) / (totalAB + totalBB + totalHBP + totalSF);
                      const slg = totalTB / totalAB;
                      return (obp + slg).toFixed(3);
                    })()}
                  </p>
                  <p className="text-sm text-gray-600">Team OPS</p>
                </div>
                <div className="text-center bg-red-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {(() => {
                      const totalSO = players.reduce((sum, p) => sum + (parseInt(p.batting.SO) || 0), 0);
                      const totalPA = players.reduce((sum, p) => sum + (parseInt(p.batting.PA) || 0), 0);
                      return totalPA > 0 ? ((totalSO / totalPA) * 100).toFixed(1) + '%' : '0.0%';
                    })()}
                  </p>
                  <p className="text-sm text-gray-600">Team K%</p>
                </div>
                <div className="text-center bg-blue-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {(() => {
                      const totalBB = players.reduce((sum, p) => sum + (parseInt(p.batting.BB) || 0), 0);
                      const totalPA = players.reduce((sum, p) => sum + (parseInt(p.batting.PA) || 0), 0);
                      return totalPA > 0 ? ((totalBB / totalPA) * 100).toFixed(1) + '%' : '0.0%';
                    })()}
                  </p>
                  <p className="text-sm text-gray-600">Team BB%</p>
                </div>
                <div className="text-center bg-yellow-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {(() => {
                      const gbValues = players.map(p => parseFloat(p.batting['GB%']) || 0).filter(val => val > 0);
                      if (gbValues.length === 0) return '0.0%';
                      const avgGB = gbValues.reduce((sum, val) => sum + val, 0) / gbValues.length;
                      return avgGB.toFixed(1) + '%';
                    })()}
                  </p>
                  <p className="text-sm text-gray-600">Team GB%</p>
                </div>
              </div>
            </div>

            {/* Quick Stats Table */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Stats Comparison</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        AVG
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        OBP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        OPS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RBI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ERA
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {players.slice(0, 10).map((player, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{player.batting.Number} {player.batting.First} {player.batting.Last}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {player.batting.AVG || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {player.batting.OBP || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {player.batting.OPS || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {player.batting.RBI || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {player.pitching.ERA || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameChangerAnalyzer;
