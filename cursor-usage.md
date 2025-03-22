# Cursor Usage Guide for Mini Games AI

This document provides guidelines for AI agents working on the Mini Games AI project.

## Project Overview

Mini Games AI is a collection of browser-based mini-games built with JavaScript frameworks. The project is entirely frontend-focused, using client-side storage for game data and leaderboards.

## Repository Structure

```
mini-games-ai/
├── public/                # Static assets 
├── src/
│   ├── components/
│   │   ├── Dashboard/     # Dashboard components
│   │   │   ├── Dashboard.jsx  # Main dashboard layout
│   │   │   ├── GameTile.jsx   # Individual game tile component
│   │   │   └── index.js       # Export file
│   │   ├── Header.jsx     # Application header with navigation
│   │   └── Footer.jsx     # Application footer
│   ├── games/             # Individual game implementations
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main application component with routing
│   └── main.jsx           # Entry point
├── package.json           # Dependencies and scripts
└── vite.config.js         # Build configuration
```

## Development Guidelines

1. **Component Structure**: 
   - Each game should be implemented as a standalone component in the `src/games/` directory
   - Common UI elements should be placed in `src/components/`

2. **Game Implementation**:
   - Each game should handle its own state and logic
   - Implement a consistent leaderboard interface
   - Use localStorage for persisting game data

3. **Code Style**:
   - Use functional components with hooks
   - Use descriptive variable and function names
   - Add comments for complex logic

4. **Leaderboard Implementation**:
   - Use a consistent format for leaderboard data
   - Implement sorting and filtering capabilities
   - Limit entries to prevent localStorage overflow

5. **Adding New Games**:
   - Create a new folder in src/games/ for the game
   - Add the game component to the games array in App.jsx
   - Provide a thumbnail image for the game tile
   - Implement a Route in App.jsx for the game

6. **Responsive Design**:
   - Use media queries for different screen sizes (breakpoints at 768px and 480px)
   - Ensure all components adapt to mobile and desktop views
   - Test on various device sizes
   - Use relative units (rem, %, vh/vw) instead of fixed pixel values when possible

## Contribution Log

- **Initial Setup**: Created README.md and cursor-usage.md to establish project documentation
- **Dashboard Implementation**: Created a responsive dashboard that displays game tiles with a "Games coming soon" placeholder when no games are available
- **UI Enhancements**: Added Header and Footer components, improved layout with centered content, and updated the color scheme to a more soothing palette
- **Responsive Design**: Implemented responsive design across all components with proper breakpoints for mobile, tablet, and desktop devices, including a mobile-friendly navigation menu

## Troubleshooting Common Issues

- **localStorage limits**: Be aware of browser storage limits (typically 5MB)
- **React component lifecycle**: Ensure cleanup of event listeners and timers
- **Performance**: Optimize render cycles for game animations
- **Browser compatibility**: Test across different browsers and devices
- **Mobile responsiveness**: Check for touch interactions and ensure sufficient tap target sizes

---

*This document will be updated as the project evolves. Last updated: [Current Date]*