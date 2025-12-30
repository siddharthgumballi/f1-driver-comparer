# F1 Driver Comparer 🏎️

A modern web application for comparing Formula 1 drivers' statistics and head-to-head performance. Built with React, TypeScript, Vite, and Tailwind CSS.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/siddharthgumballi/f1-driver-comparer?style=social)](https://github.com/siddharthgumballi/f1-driver-comparer/stargazers)

## 🚀 Features

- Compare any two F1 drivers' career statistics
- Head-to-head race performance comparison
- **Enhanced Constructor History**: Visual timeline showing team stints with specific statistics for each period
- **Stint-Specific Statistics**: Each constructor stint shows only the stats from that specific time period
- **Responsive Driver Stats Table**: Clean, organized table format for driver statistics
- **Dark/Light Theme Support**: Toggle between dark and light modes
- Visual progress bars for easy comparison
- Responsive design that works on all devices
- Fast and efficient data loading with caching

## 📊 Data Sources

- [Ergast API](http://ergast.com/mrd/) - Primary source for driver and constructor data
- [OpenF1 API](https://theoehrly.github.io/OpenF1/) - Additional race data and statistics
- Official F1 media for team car images (placeholder/fallback images)

## 🛠️ Tech Stack

- ⚛️ React 18
- 🌈 TypeScript
- ⚡ Vite
- 🎨 Tailwind CSS (with dark mode support)
- 🎭 Framer Motion (animations)
- 📦 LocalStorage for caching

## 🎨 Recent Major Updates

### Constructor History Enhancement
- **Split Constructor Stints**: Automatically breaks down continuous periods when drivers switch teams and return
- **Stint-Specific Stats**: Each stint displays only the statistics from that particular time period
- **Visual Timeline**: Clean card-based layout showing team transitions
- **Team Car Images**: Placeholder images for constructor identification (uses fallback images)

### Theme System
- **Dark/Light Mode Toggle**: Full theme switching capability
- **Persistent Theme Preference**: Saves user's theme choice in localStorage
- **Consistent Styling**: Proper dark/light mode support across all components

### UI Improvements
- **Table-Based Driver Stats**: Replaced grid layout with clean, organized table format
- **Enhanced Visual Design**: Improved borders, backgrounds, and spacing
- **Better Color Scheme**: Consistent color usage in both light and dark modes

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/siddharthgumballi/f1-driver-comparer.git
   cd f1-driver-comparer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Open the URL shown in the terminal (usually http://localhost:5173)

## 🌍 Production Build

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 📝 Notes

- The application uses browser's localStorage for caching API responses with a 24-hour TTL
- All driver selections are reflected in the URL for easy sharing
- The app is designed to be fully responsive and works on mobile devices
- **Constructor Images**: Currently uses fallback placeholder images from F1 media (not actual car photos)
- **Theme Persistence**: Dark/light mode preference is saved and restored on revisit

## 🐛 Known Issues

- **Car Images**: F1 media car images show placeholder/fallback images instead of actual car photos due to authentication restrictions
- **Image URL Structure**: F1's actual car images require authentication or use a different CDN structure

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ergast API](http://ergast.com/mrd/) for the F1 data
- [OpenF1](https://theoehrly.github.io/OpenF1/) for additional race data
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
