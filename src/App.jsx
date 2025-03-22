import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import styled from 'styled-components';

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    min-height: 100vh;
    font-size: 16px;
    overflow-x: hidden;
    
    @media (max-width: 768px) {
      font-size: 15px;
    }
    
    @media (max-width: 480px) {
      font-size: 14px;
    }
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #e0f7fa; /* Soothing light blue */
    color: #333;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
  
  button {
    cursor: pointer;
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
  
  #root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
  }
  
  main {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  /* For devices with hover capability */
  @media (hover: hover) {
    a:hover {
      text-decoration: none;
    }
  }
`;

const MainContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function App() {
  // We'll initialize this as an empty array for now
  // Later, when we add games, we'll populate this array
  const games = [];

  return (
    <Router>
      <GlobalStyle />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard games={games} />} />
          {/* Add game routes here later */}
          <Route path="*" element={<Dashboard games={games} />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
