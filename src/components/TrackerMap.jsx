/*
* The MIT License (MIT)
*
* Copyright (c) 2019 Sierra MacLeod
*
* Permission is hereby granted, free of charge, to any person obtaining a
* copy of this software and associated documentation files (the "Software"),
* to deal in the Software without restriction, including without limitation
* the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
* OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
* DEALINGS IN THE SOFTWARE.
*/

import React, {Component} from 'react'
import {withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow, Polyline, Circle, OverlayView} from "react-google-maps"
import {GOOGLE_MAPS_KEY} from '../api_keys'
import Image from 'react-bootstrap/Image'

import greenBalloon from '../images/greenBalloon.png'
import parachuteIcon from '../images/parachuteIcon45.png'
import greenIcon from '../images/greenIcon.png'
import orangeIcon from '../images/orangeIcon.png'

import balloonIcon1Diag from '../images/aurora_balloon_1diag.svg'
import balloonIcon2Diag from '../images/aurora_balloon_2diag.svg'
import balloonIcon3Diag from '../images/aurora_balloon_3diag.svg'
import balloonIconHorizArcs from '../images/aurora_balloon_horiz_arcs.svg'
import balloonIconVertArcs from '../images/aurora_balloon_vert_arcs.svg'
import balloonIconStar from '../images/aurora_balloon_star.svg'


const balloonIconSvgs = [
  balloonIcon1Diag,
  balloonIcon2Diag,
  balloonIcon3Diag,
  balloonIconHorizArcs,
  balloonIconVertArcs,
  balloonIconStar
];


const balloonColors = [
  '#0000FF',
  '#9932CC',
  '#228B22',
  '#DC143C',
  '#1E90FF',
  '#FFA500',
  '#FF4500',
  '#FA8072',
  '#C71585',
  '#4B0082'
];

const balloonColorTransforms = [
  {filter: `invert(8%) sepia(100%) saturate(7453%) hue-rotate(248deg) brightness(93%) contrast(142%)`},
  {filter: `invert(28%) sepia(84%) saturate(1833%) hue-rotate(263deg) brightness(83%) contrast(100%)`},
  {filter: `invert(34%) sepia(83%) saturate(479%) hue-rotate(70deg) brightness(105%) contrast(93%)`},
  {filter: `invert(28%) sepia(90%) saturate(7192%) hue-rotate(340deg) brightness(88%) contrast(96%);`},
  {filter: `invert(42%) sepia(87%) saturate(2378%) hue-rotate(193deg) brightness(103%) contrast(101%)`},
  {filter: `invert(63%) sepia(59%) saturate(1083%) hue-rotate(357deg) brightness(99%) contrast(107%)`},
  {filter: `invert(28%) sepia(74%) saturate(3343%) hue-rotate(5deg) brightness(106%) contrast(102%)`},
  {filter: `invert(63%) sepia(69%) saturate(523%) hue-rotate(313deg) brightness(92%) contrast(115%)`},
  {filter: `invert(20%) sepia(98%) saturate(2439%) hue-rotate(304deg) brightness(85%) contrast(104%)`},
  {filter: `invert(15%) sepia(53%) saturate(3657%) hue-rotate(264deg) brightness(88%) contrast(130%)`},
]


const format = require('string-format');
format.extend(String.prototype, {});

// Insert imported API key for security
const googleMapsAPI_URL = 'https://maps.googleapis.com/maps/api/js?v=3&key={}&libraries=geometry,drawing,places'.format(GOOGLE_MAPS_KEY);

/**
 * Displays altitude in `M m (F ft)` format
 * @param number
 * @returns {*}
 */
const dispMetersFeet = (number) => (
  '{} m ({} ft)'.format(number, (number * 3.28084).toFixed(2))
);

const calcGroupSelect = (uid, digits, groupSize) => (parseInt(uid.slice(-digits), 16) % groupSize);

const chooseRandomColor = (uid) => (balloonColors[calcGroupSelect(uid, 1, balloonColors.length)]);

const chooseRandomColorFilter = (uid) => (balloonColorTransforms[calcGroupSelect(uid, 1, balloonColors.length)]);

const chooseRandomSvg = (uid) => (balloonIconSvgs[calcGroupSelect(uid, 2, balloonIconSvgs.length)]);

class BalloonIcon extends React.Component {
  render() {
    const Icon = this.props.icon;
    return (
      <div className="BalloonIcon">
        <Icon style={{height: 48, width: 34}}/>
      </div>
    )
  }
}

class StarBalloonIcon extends React.Component {
  render() {
    //const svg = this.props.svg;
    const {filter} = chooseRandomColorFilter(this.props.uid);
    return (
      <img src={balloonIconStar} alt={'star balloon icon'} style={{height: 48, width: 34, filter: filter}}/>
    )
  }
}

class InfoMarker extends React.PureComponent {
  /*
  *   `Marker` with integrated `InfoWindow` displaying
  *   geospatial position.
  *
  *   Properties
  *   ----------
  *   altitude: point altitude in meters
  *   position { lat, lng }: point position in coords
  *   icon: marker icon url
  */

  /*
  *   STATE
  *   -----
  *   isInfoShown: `boolean`
  *   |   controls `InfoWindow` visibility
  */
  state = {
    isInfoShown: false
  };

  /*
  *   Info Windows
  *   ------------
  *   Each info window visibility is managed by `isInfoShown`. To
  *   implement behaviour allowing only one window open at a time,
  *   the parent passes function `updateLastWindowClose()` to the InfoMarker
  *   via props. Upon opening info window, this function should be called
  *   with the marker's window close function. The parent then closes any
  *   currently open window and stores the new close function.
  */

  /*
  *   [ Marker Click Callback ]
  *
  *   When marker is clicked, opens the info window and
  *   updates parent with close function to close last info window
  */
  onMarkerClicked = () => {
    this.setState({isInfoShown: true});
    this.props.updateLastWindowClose(this.closeInfoWindow)
  };

  /*
  *   [ Info Window Closer ]
  *
  *   Used by both info window onCloseClick() and parent
  */
  closeInfoWindow = () => {
    this.setState({isInfoShown: false})
  };

  /*
  *   [ Info Window Close Callback ]
  *
  *   Closes the info window when "X" is clicked
  */
  handleWindowClose = () => {
    this.closeInfoWindow();
  };

  render() {
    return (
      <Marker position={this.props.position} onClick={this.onMarkerClicked}>
        {this.state.isInfoShown && <InfoWindow onCloseClick={this.handleWindowClose}>
          <p>
            <strong>Latitude:</strong> {this.props.position.lat}<br/>
            <strong>Longitude:</strong> {this.props.position.lng}<br/>
            <strong>Altitude:</strong> {this.props.altitude}
          </p>
        </InfoWindow>}
      </Marker>
    )
  }
}

class BalloonInfoMarker extends InfoMarker {
  render() {
    return (
      <OverlayView position={this.props.position} onClick={this.onMarkerClicked}>
        {this.state.isInfoShown && <InfoWindow onCloseClick={this.handleWindowClose}>
          <p>
            <strong>Latitude:</strong> {this.props.position.lat}<br/>
            <strong>Longitude:</strong> {this.props.position.lng}<br/>
            <strong>Altitude:</strong> {this.props.altitude}
          </p>
        </InfoWindow>}
        <StarBalloonIcon uid={this.props.uid}/>
      </OverlayView>
    )
  }
}

class BaseMap extends Component {
  /*
  *   Serves as core map handler, manages and renders
  *   markers
  *
  *   Properties
  *   ----------
  *   None
  */

  /*
  *   STATE
  *   -----
  *   markers: `list[ :class:InfoMarker ]`
  *   |   list of `InfoMarker`s to render
  *   lastWindowCloser: `function`
  *   |   closes last opened `InfoWindow`
  *
  */
  state = {
    markers: null,
    lastWindowCloser: null
  };

  /*
  *   [ Closes Last Opened InfoWindow ]
  *
  *   Calls last InfoWindow closing function if
  *   present and updates state variable to new one
  */
  handleLastWindowClose = (closer) => {
    if (this.state.lastWindowCloser !== null) {
      this.state.lastWindowCloser();
    }
    this.setState({ lastWindowCloser: closer })
  };

  coordAngle = (from, to) => {
    return Math.atan2(to.lat - from.lat, to.lng - from.lng)
  };

  coordDistance = (a, b) => {
    return Math.sqrt((a.lat - b.lat)**2 + (a.lng - b.lng)**2)
  };

  selectPoint = (event) => {
    let selected = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    let minDist = 10;  // 10 degrees is like 1000km
    let minIndex = 0;
    for (let i = 0; i < this.props.coordinates.length; i++) {
      let dist = this.coordDistance(this.props.coordinates[i], selected);
      if (dist < minDist) {
        minDist = dist;
        minIndex = i;
      }
    }
    this.props.selectPosition(minIndex);
  };

  render() {
    return (
      <GoogleMap
        defaultZoom={4}
        zoom={(this.props.defaultCenter && 11) || 4}
        ref={(map) => map &&
            map.panTo(this.props.defaultCenter|| {lat: 39.833333, lng: -98.583333})}
      >
        {this.props.startPosition &&
        <InfoMarker position={this.props.startPosition} altitude={dispMetersFeet(this.props.startPosition.alt)}
                    icon={greenIcon} updateLastWindowClose={this.handleLastWindowClose}
        />
        }

        {this.props.coordinates &&
        <Polyline
          path={this.props.coordinates}
          geodesic={true}
          options={{
            strokeColor: "#3cb2e2",
            strokeOpacity: 1.0,
            strokeWeight: 4
          }}
          onClick={this.selectPoint}
        />
        }

        {this.props.endPosition &&
        <InfoMarker position={this.props.endPosition} altitude={dispMetersFeet(this.props.endPosition.alt)}
                    icon={orangeIcon} updateLastWindowClose={this.handleLastWindowClose}
        />
        }
        {this.props.selectedPosition &&
          <BalloonInfoMarker
            position={this.props.selectedPosition.coords()}
            altitude={dispMetersFeet(this.props.selectedPosition.altitude)}
            uid={this.props.selectedPosition.uid}
            updateLastWindowClose={this.handleLastWindowClose}
          />
        }
        {(this.props.activeFlights.length > 0 && !this.props.selectedPosition) && this.props.activeFlights.map(partial => (
          <Marker
            position={{lat: partial.latitude, lng: partial.longitude}}
            icon={{
              url: chooseRandomSvg(partial.uid),
              scaledSize: {width: 34, height: 48}
            }}
            style={chooseRandomColorFilter(partial.uid)}
            onClick={partial.callback}
          />
        ))}
        {this.props.landingZone &&
        <Circle
          center={this.props.landingZone}
          radius={4025 /* meters = 5 miles */}
          options={{
            strokeColor: "#ff42b1"
          }}
        />
        }
        {this.props.landingZone &&
        <InfoMarker position={this.props.landingZone} altitude={dispMetersFeet(this.props.landingZone.alt)}
                    icon={parachuteIcon} updateLastWindowClose={this.handleLastWindowClose}
        />
        }
      </GoogleMap>
    )
  }
}

/*
*   Wrappers necessary to correctly load Google Maps
*/
const WrappedMap = withScriptjs(withGoogleMap(BaseMap));

/*
*   Wrapper for `WrappedMap` with inserted props
*/
export default class TrackerMap extends React.Component {

  render() {
    return (
      <WrappedMap
        googleMapURL={googleMapsAPI_URL}
        loadingElement={<div style={{height: '100%'}}/>}
        containerElement={<div style={{height: '85vh', maxHeight: '530px'}}/>}
        mapElement={<div style={{height: '100%'}}/>}
        {...this.props}
      />
    )
  };
}