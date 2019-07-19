import React, { Component } from 'react';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Modal from './components/Modal/Modal';
import Profile from './components/Profile/Profile';
import { apiCall } from './services/ApiCall';
import './App.css';


const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  boxes: [],
  route: 'signin',
  isSignedIn: false,
  isProfileOpen: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '',
    pet: '',
    age: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  componentDidMount() {
    const token = window.sessionStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token
    }
    if (token) {
      apiCall('post', 'signin', headers)
      .then(data => {
        if (data && data.id) {
          let endpoint = `profile/${data.id}`;
          apiCall('get', endpoint, headers)
          .then(user => {
            if (user && user.email) {
              this.loadUser(user);
              this.onRouteChange('home');
            }
          })
        }
      })
      .catch(console.log)
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    if (data && data.outputs) {
      const image = document.getElementById('inputimage');
      const width = Number(image.width);
      const height = Number(image.height);

      const faceData = data.outputs[0].data.regions;
      return faceData.map(faceData => {
        return {
          leftCol: faceData.region_info.bounding_box.left_col * width,
          topRow: faceData.region_info.bounding_box.top_row * height,
          rightCol: width - (faceData.region_info.bounding_box.right_col * width),
          bottomRow: height - (faceData.region_info.bounding_box.bottom_row * height)
        }
      })
    }
    return
  }


  displayFaceBox = (boxes) => {
    if (boxes) {
      this.setState({boxes: boxes});
    }
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }


  onButtonSubmit = () => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': window.sessionStorage.getItem('token')
    }
    this.setState({imageUrl: this.state.input});
    let body = JSON.stringify({ input: this.state.input });
    apiCall('post', 'imageurl', headers, body)
    .then(response => {
      if (response) {
        let body = JSON.stringify({ id: this.state.user.id });
        apiCall('put', 'image', headers, body)
        .then(count => {
          this.setState(Object.assign(this.state.user, { entries: count}))
        })
        .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'logout') {
      return this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    } 
    this.setState({route: route});
  }

  toggleModal = () => {
    this.setState(prevState => ({
      ...prevState, 
      isProfileOpen: !prevState.isProfileOpen
    }))
  }

  render() {
    const { isSignedIn, imageUrl, route, boxes, isProfileOpen, user } = this.state;
    return (
      <div className="App">
         <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation 
          isSignedIn={isSignedIn} 
          onRouteChange={this.onRouteChange}
          toggleModal={this.toggleModal} 
        />
        { isProfileOpen &&
          <Modal>
            <Profile 
              user={user} 
              isProfileOpen={isProfileOpen} 
              toggleModal={this.toggleModal}
              loadUser={this.loadUser}
            />
          </Modal>
        }
        { route === 'home'
          ? <div>
              <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition boxes={boxes} imageUrl={imageUrl} />
            </div>
          : (
             route === 'signin'
             ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
             : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        }
      </div>
    );
  }
}

export default App;
