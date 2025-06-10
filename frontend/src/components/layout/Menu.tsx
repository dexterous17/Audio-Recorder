import { useState } from 'react'
import './Menu.css'

function Menu() {
  const [activeItem, setActiveItem] = useState<string | null>(null)

  const handleMenuItemClick = (itemName: string) => {
    setActiveItem(itemName)
    
    switch (itemName) {
      case 'home':
        window.location.reload()
        break
      case 'recordings': {
        const recordingsList = document.querySelector('.recordings-list-container')
        if (recordingsList) {
          recordingsList.scrollIntoView({ behavior: 'smooth' })
        }
        break
      }
      case 'recorder': {
        const recorder = document.querySelector('.audio-recorder-container')
        if (recorder) {
          recorder.scrollIntoView({ behavior: 'smooth' })
        }
        break
      }
      case 'about':
        alert('Audio Recording App v1.0\nRecord, save, and manage your audio recordings.')
        break
      case 'settings':
        alert('Settings feature coming soon!')
        break
    }
    
    setTimeout(() => setActiveItem(null), 200)
  }

  return (
    <nav className="simple-menu">
      <div className="menu-brand">
        <span className="brand-icon">🎙️</span>
        <span className="brand-text">Audio Recorder</span>
      </div>
      
      <ul className="menu-items">
        <li>
          <button 
            onClick={() => handleMenuItemClick('home')}
            className={`menu-button ${activeItem === 'home' ? 'active' : ''}`}
          >
            🏠 Home
          </button>
        </li>
        
        <li>
          <button 
            onClick={() => handleMenuItemClick('recorder')}
            className={`menu-button ${activeItem === 'recorder' ? 'active' : ''}`}
          >
            🎤 Recorder
          </button>
        </li>
        
        <li>
          <button 
            onClick={() => handleMenuItemClick('recordings')}
            className={`menu-button ${activeItem === 'recordings' ? 'active' : ''}`}
          >
            🎵 Recordings
          </button>
        </li>
        
        <li>
          <button 
            onClick={() => handleMenuItemClick('about')}
            className={`menu-button ${activeItem === 'about' ? 'active' : ''}`}
          >
            ℹ️ About
          </button>
        </li>
        
        <li>
          <button 
            onClick={() => handleMenuItemClick('settings')}
            className={`menu-button ${activeItem === 'settings' ? 'active' : ''}`}
          >
            ⚙️ Settings
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Menu 