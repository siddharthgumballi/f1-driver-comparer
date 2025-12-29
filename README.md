# F1 Driver Comparer 🏎️

A modern web application for comparing Formula 1 drivers' statistics and head-to-head performance. Built with React, TypeScript, Vite, and Tailwind CSS.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/siddharthgumballi/f1-driver-comparer?style=social)](https://github.com/siddharthgumballi/f1-driver-comparer/stargazers)

## 🚀 Features

- Compare any two F1 drivers' career statistics
- Head-to-head race performance comparison
- Visual progress bars for easy comparison
- Responsive design that works on all devices
- Dark theme by default
- Fast and efficient data loading with caching

## 📊 Data Sources

- [Ergast API](http://ergast.com/mrd/)
- [OpenF1 API](https://theoehrly.github.io/OpenF1/)
- Official F1 media for team car images

## 🛠️ Tech Stack

- ⚛️ React 18
- 🌈 TypeScript
- ⚡ Vite
- 🎨 Tailwind CSS
- 🎭 Framer Motion
- 📦 LocalStorage for caching

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ergast API](http://ergast.com/mrd/) for the F1 data
- [OpenF1](https://theoehrly.github.io/OpenF1/) for additional race data
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
