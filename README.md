# GameChanger Stats Analyzer

A React web application for analyzing youth baseball statistics exported from GameChanger. This tool helps coaches quickly identify player performance trends and areas needing attention.

![GameChanger Stats Analyzer](https://img.shields.io/badge/React-18.2.0-blue) ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.0-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

### 📊 **Team Overview Dashboard**
- Team batting average, OBP, SLG, OPS
- Team strikeout rate (K%) and walk rate (BB%)
- Ground ball percentage (GB%)
- Total player count

### 👤 **Individual Player Analysis**
- **Batting Stats**: AVG, OBP, OPS, hit distribution, BB%, K%, PS/PA
- **Pitching Stats**: ERA, WHIP, innings pitched, BB%, K%
- **Fielding Stats**: Fielding percentage, total chances, errors

### 🚨 **Needs Attention Tab**
Automatically flags players with concerning statistics:
- AVG < .250 (High severity)
- SLG < .350 (Medium severity)
- OPS < .700 (High severity)
- GB% > 66% (Medium severity)
- K% > 30% (High severity)

### 📈 **Advanced Analytics**
- Percentage-based metrics for fair player comparisons
- Color-coded severity indicators
- Smart prioritization of problem areas
- One-click detailed analysis navigation

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gamechanger-stats-analyzer.git
   cd gamechanger-stats-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser to** `http://localhost:3000`

## 📋 Usage

1. **Export your team stats from GameChanger**
   - Go to your GameChanger team page
   - Navigate to "Stats" → "Export"
   - Download the CSV file

2. **Upload the CSV file**
   - Click "Upload GameChanger CSV File"
   - Select your downloaded CSV file

3. **Analyze your team**
   - View team overview statistics
   - Select individual players for detailed analysis
   - Check the "Needs Attention" tab for players requiring focus

## 📁 Project Structure

```
gamechanger-stats-analyzer/
├── public/
│   └── index.html          # Main HTML template
├── src/
│   ├── components/
│   │   └── GameChangerAnalyzer.jsx  # Main analyzer component
│   ├── App.js              # Main App component
│   ├── App.css             # App-specific styles
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🎯 Key Statistics Explained

### Batting Metrics
- **AVG**: Batting Average (Hits ÷ At Bats)
- **OBP**: On-Base Percentage ((H + BB + HBP) ÷ (AB + BB + HBP + SF))
- **OPS**: On-Base Plus Slugging (OBP + SLG)
- **BB%**: Walk Rate (Walks ÷ Plate Appearances × 100)
- **K%**: Strikeout Rate (Strikeouts ÷ Plate Appearances × 100)
- **PS/PA**: Pitches Seen per Plate Appearance

### Pitching Metrics
- **ERA**: Earned Run Average (Earned Runs × 9 ÷ Innings Pitched)
- **WHIP**: Walks + Hits per Inning Pitched
- **BB%**: Walk Rate (Walks ÷ Batters Faced × 100)
- **K%**: Strikeout Rate (Strikeouts ÷ Batters Faced × 100)

## 🚨 Warning Thresholds

The "Needs Attention" feature flags players based on these thresholds:
- **Batting Average**: < .250
- **Slugging**: < .350
- **OPS**: < .700
- **Ground Ball %**: > 66%
- **Strikeout Rate**: > 30%

## 🔧 Technologies Used

- **React 18.2.0** - Frontend framework
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **JavaScript ES6+** - Programming language

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GameChanger for providing comprehensive youth sports statistics
- Youth baseball coaches who inspired this tool
- The React and Tailwind CSS communities

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/gamechanger-stats-analyzer/issues) page
2. Create a new issue with detailed information
3. Include your CSV file structure (with sensitive data removed)

---

**Made with ⚾ for youth baseball coaches and parents**
