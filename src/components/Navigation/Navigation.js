import React from 'react';
import ProfileIcon from '../Profile/ProfileIcon';
import { apiCall } from '../../services/ApiCall';

const Navigation = ({ onRouteChange, isSignedIn, toggleModal }) => {
    
    const handleLogout = () => {
      const token = window.sessionStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token
      }
      apiCall('delete', 'logout', headers)
        .then((res) => {
          if (res.success === 'true') {
            window.sessionStorage.removeItem('token');
            onRouteChange('logout');
          }
        })
        .catch(err => console.log(err));
    }

    if (isSignedIn) {
      return (
        <nav style={{display: 'flex', justifyContent: 'flex-end'}}>
          <ProfileIcon onRouteChange={onRouteChange} toggleModal={toggleModal} />
          <p onClick={handleLogout} className='f3 link dim black underline pa3 pointer'>Logout</p>
        </nav>
      );
    } else {
      return (
        <nav style={{display: 'flex', justifyContent: 'flex-end'}}>
          <p onClick={() => onRouteChange('signin')} className='f3 link dim black underline pa3 pointer'>Sign In</p>
          <p onClick={() => onRouteChange('register')} className='f3 link dim black underline pa3 pointer'>Register</p>
        </nav>
      );
    }
}

export default Navigation;

// <p onClick={() => onRouteChange('logout')} className='f3 link dim black underline pa3 pointer'>Logout</p>