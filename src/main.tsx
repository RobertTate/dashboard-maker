import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@mdxeditor/editor/style.css'
import './index.css'

// Select the scrollable container
const scrollContainer: HTMLElement | null = document.querySelector('.scroll-container');

if (scrollContainer) {
    // Add event listener for scroll event
    window.addEventListener('scroll', () => {
      scrollContainer.classList.add('scrolling');

        // Clear the class after a delay
        clearTimeout((scrollContainer as any).scrollTimeout);
        (scrollContainer as any).scrollTimeout = setTimeout(() => {
            scrollContainer.classList.remove('scrolling');
        }, 300); // Timeout to remove class
    });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
