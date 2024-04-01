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

import React, { Component } from 'react'
import '../custom.scss'
import '../style/tracking.css'
import Column from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Container from 'react-bootstrap/Container'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Image from 'react-bootstrap/Image'
import Form from 'react-bootstrap/Form'
import Tab from 'react-bootstrap/Tab'
import Nav from 'react-bootstrap/Nav'
import queryString from 'query-string';

import Select from 'react-select'
import moment from 'moment'

import TrackerMap from './TrackerMap'
import AltitudeChart from './AltitudeChart'
import LandingPrediction from '../util/landing'
import LogWindow, {LogItem} from './LogWindow'
import { SelectedFlightData, ActiveFlight } from "./Containers";

import { Flight } from '../util/flight'
import { getVelocity } from "../util/velocity";

import balloonIcon from '../images/balloonIcon.png'
import threeBarIcon from '../images/threeBarIcon.png'
import clockIcon from '../images/clockIcon.png'
import chartIcon from '../images/chartIcon.png'

import { encodeUID, extractDate, extractIMEI } from '../util/snowflake'

const logTime = () => moment().format('HH:mm:ss');

const format = require('string-format');
format.extend(String.prototype, {});

const UPDATE_DELAY = 5000;
const ACTIVE_DELAY = 30000;


class Tracking extends Component {
  constructor (props) {
    super(props);
    this.updateInterval = null;
    this.activeInterval = null;
  }

  /*
  *   STATE
  *   -----
  *   modemList: `list`
  *   |   list of modem objects
  *   flightList: `list`
  *   |   list of flights under one imei
  *   currentFlight: :class:`Flight`
  *   |   current loaded flight
  *
  */
  state = {
    modemList: [],
    flightList: [],

    // Current flight selected by dropdowns
    currentFlight: null,

    // Current flight landing prediction model
    landingPrediction: null,

    // Predicted zone
    landingZone: null,

    // Altitude chart dataset
    altitudes: [],

    // active flights tab data
    activeFlights: [],

    // Green balloon on map, stores a :class:`FlightPoint`
    selectedPosition: null,

    // Change this to anything to redraw the altitude chart
    chartRedrawKey: 0,

    // Select variables
    selectedIMEI: null,
    selectedFlight: null,

    // Check box
    useLandingPrediction: false,

    // Radio buttons
    chosenVelocityRadio: 'custom',

    payloadMass: null,
    parachuteDiameter: null,
    dragCoefficient: null,

    // indicates whether current flight is active
    activeFlight: false,

    chartAnimation: true,

    groundElevation: false,
    accordionKey: 'flight-select'
  };
  payloadMass;
  parachuteDiameter;
  dragCoefficient;

  calculateVelocity = (altitude) => {
    const mass = (this.payloadMass !== undefined && this.payloadMass.value) || 0.001;
    const diameter = (this.parachuteDiameter !== undefined && this.parachuteDiameter.value) || 0.001;
    const drag = (this.dragCoefficient !== undefined && this.dragCoefficient.value) || 0.1;
    return getVelocity(altitude, mass, diameter, drag);
  };

  pinLogPrint = () => {};

  registerPrint = (func) => {
    this.pinLogPrint = func;
  };

  /*
  *   [ IMEI Select Dropdown Callback ]
  *
  *   Fetches all flights associated with a given imei.
  *   Response is a list of timestamps, converts data
  *   to Select-able list with label format:
  *     1: date
  *     2: next date
  *     etc
  *
  *   @param {Number} imei The imei to load
  */
  fetchFlightsFrom = (imei) => {
    fetch('/meta/flights?imei={}'.format(imei))
      .then(response => response.json())
      .then(data => {
        let allFlights = [];

        // Build list of { value: datetime, label: 'X: Date'} items with
        // datetime formatting of timestamps
        for (let i = 0; i < data.length; i++) {
          allFlights.push({
            value: data[i],
            label: '{}: {}'.format(i + 1, data[i])
          })
        }
        allFlights.reverse();
        this.setState({flightList: allFlights});
      })
  };

  /**
   * Flight selection callback
   * @param {String | moment} date
   * @param {Number} imei
   * @param uid Optional search method
   * @returns {Promise<void>}
   */
  fetchFlight = async (date, imei, uid) => {
    try {
      if (!uid) {
        let datetime = moment.utc(date, 'YYYY-MM-DD');
        uid = encodeUID(datetime, imei);
        console.log(`Encoded uid ${uid} for date ${date}, imei ${imei}`);
      }

      console.log(`Requesting /flight?uid=${uid}`);
      const res = await fetch('/flight?uid={}'.format(uid));
      if (res.status !== 200) return;
      const data = await res.json();

      const flight = new Flight(data);
      const prediction = new LandingPrediction(flight, this.calculateVelocity);
      await prediction.buildAltitudeProfile();
      /*await console.log('Altitude Profile:');
      await console.log(prediction.altitudes);
      await console.log(flight);*/

      const firstPoint = await flight.firstPoint();
      const lastPoint = await flight.lastPoint();

      const durationSince = moment.duration(moment.utc().diff(lastPoint.datetime));

      // start updates
      let interval = null;
      let active = false;
      let selected = firstPoint;
      clearInterval(this.updateInterval);
      if (durationSince.asHours() < 5) {
        active = true;
        selected = lastPoint;
        this.updateInterval = setInterval(this.fetchUpdates, UPDATE_DELAY);
        console.log('Enabled updating');
      }
      await this.setState({
        currentFlight: flight,
        selectedPosition: selected,
        chartRedrawKey: Math.random(),
        landingPrediction: prediction,
        activeFlight: active,
        chartAnimation: true,
        groundElevation: false,
        accordionKey: 'flight-data'
      });
      await this.props.history.push(`/tracking?uid=${uid}`);
      return uid;
    } catch (e) {
      console.log(e);
    }
  };

  fetchUpdates = async () => {
    try {
      if (this.state.currentFlight) {
        let mostRecent = this.state.currentFlight.lastValidPoint();
        //console.log(mostRecent);
        //console.log(`most recent: ${mostRecent.datetime.unix()} or ${mostRecent.datetime.format('YYYY-MM-DD HH:mm:ss')}`);
        let result = await fetch('/update', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({uid: mostRecent.uid, datetime: mostRecent.datetime.unix()})
        });
        let data = await result.json();

        if (data.update && data.result.length > 0) {
          // `Flight.add()` returns index added. Map the adds to an array and use the first
          // index as the entry for updating the altitude profile
          const updateIndicies = data.result.map(point => this.state.currentFlight.add(point));
          await this.state.landingPrediction.updateAltitudeProfile(updateIndicies[0], updateIndicies[updateIndicies.length - 1]);

          if (data.pin_states) {
            let inChange, outChange;
            //console.log(`data: ${JSON.stringify(data)}`);
            let newIn = data.pin_states.input_pins;
            newIn = newIn > 15 ? newIn - 16 : newIn;
            let newOut = data.pin_states.output_pins;
            inChange = this.inputPins !== newIn ? !!(this.inputPins = newIn) : false;
            outChange = this.outputPins !== newOut ? !!(this.outputPins = newOut) : false;

            this.pinLogPrint(new LogItem(logTime(), (inChange || outChange) ? 'changed' : 'unchanged', `Input: ${this.inputPins} Output: ${this.outputPins}`));
          }

          let elevation = false;
          if (data.elevation) elevation = data.elevation;

          await this.setState({
            currentFlight: this.state.currentFlight,
            chartRedrawKey: Math.random(),
            chartAnimation: false,
            groundElevation: elevation
          });
          await this.setSelectedPosition(this.state.currentFlight.data.length - 1);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * Fetches IMEI list and loads response
   * into imei Select dropdown
   * @returns {Promise<void>}
   */
  fetchIDList = async () => {
    try {
      const res = await fetch('/meta/modems');
      const data = await res.json();
      if (res.status !== 200) {
        console.log(`Error fetching modems: ${data}`);
        return;
      }

      await this.setState({modemList: data});
    } catch (e) {
      console.log(e)
    }
  };

  fetchActive = async () => {
    const res = await fetch('/meta/active');
    if (res.status !== 200) return;
    const data = await res.json();

    if (data.status === 'active') {
      console.log('Active flight(s)');
      for (let partialPoint of data.points) {
        partialPoint.imei = extractIMEI(partialPoint.uid);
        partialPoint.start_date = extractDate(partialPoint.uid);
        partialPoint.datetime = moment.utc(partialPoint.datetime, 'YYYY-MM-DD[T]HH:mm:ss[Z]');
        partialPoint.callback = () => {
          this.fetchFlight(partialPoint.start_date, partialPoint.imei, partialPoint.uid);
        }
      }
      await this.setState({activeFlights: data.points});
    }
  };

  /**
   * Change handler for IMEIs dropdown
   * @param {Object} change The new change
   */
  imeiSelectChange = (change) => {
    this.setState({selectedIMEI: change, selectedFlight: null});
    if (change !== null) {
      console.log('Selection chosen:');
      console.log(change.value);
      this.fetchFlightsFrom(change.value);
    }
  };

  /**
   * Change handler for Flights dropdown
   * @param {Object} change The new change
   */
  flightSelectChange = async (change) => {
    await this.setState({selectedFlight: change});
    if (change !== null) {
      await console.log('Flight chosen:');
      await console.log(change.label);
      if (this.state.selectedFlight !== null && this.state.selectedIMEI !== null) {
        await this.fetchFlight(change.value, this.state.selectedIMEI.value);
      }
    }
  };

  onVelocityProfileChange = (change) => {
    this.setState({chosenVelocityRadio: change});
    console.log('Velocity Profile: {}'.format(change))
  };

  setSelectedPosition = (index) => {
    if (this.state.currentFlight) {
      const point = this.state.currentFlight.get(index);
      //console.log(`Velocity at ${point.altitude} m is ${this.calculateVelocity(point.altitude)}`);
      let zone = null;
      if (this.state.useLandingPrediction) {
        zone = this.state.landingPrediction.calculateLanding(point);
        zone['alt'] = 'TBD';
        //console.log(`Landing zone predicted:`);
        //console.log(zone);
      }

      this.setState({
        selectedPosition: point,
        landingZone: zone
      });
    }
  };

  setAccordionTab = async (key) => {
    await this.setState({accordionKey: key});
    console.log(`Set accordionKey ${key}`);
  };

  downloadFlight = async (format) => {
    const uid = this.state.currentFlight.firstPoint().uid;
    try {
      window.open(`/flight?uid=${uid}&format=${format}`)
    } catch (e) {
      alert(`File fetch failed: ${e}`)
    }
  };

  async componentDidMount () {
    //console.log('component did mount');
    await this.fetchIDList();
    //console.log('id list fetched');
    await this.fetchActive();
    //console.log('active fetched');
    this.activeInterval = setInterval(this.fetchActive, ACTIVE_DELAY);
    const params = queryString.parse(this.props.location.search);
    //console.log(`Params: ${JSON.stringify(params)}`);

    if (typeof params.uid === 'string' && params.uid.length > 0) {
      await this.fetchFlight(null, null, params.uid);
      let imei = extractIMEI(params.uid);
      await this.setState({selectedIMEI: {value: imei, label: imei}})
    }
  }

  render () {
    return (
      <Container>
        <Row className={'mt-3'}>
          <Column>
            <h1>Flight Tracker</h1>
          </Column>
        </Row>
        <Row>
          <Column lg={8} className={'my-2'}>
            <div className={'map-rounded'}>
              <TrackerMap
                coordinates={this.state.currentFlight && this.state.currentFlight.coords()}
                startPosition={this.state.currentFlight && this.state.currentFlight.firstValidPoint().coords()}
                endPosition={this.state.currentFlight && !this.state.activeFlight && this.state.currentFlight.lastValidPoint().coords()}
                defaultCenter={this.state.currentFlight && this.state.selectedPosition.coords()}
                selectedPosition={this.state.selectedPosition && this.state.selectedPosition.coords()}
                landingZone={Math.random() && this.state.landingZone}
                selectPosition={this.setSelectedPosition}
                activeFlights={this.state.activeFlights}
              />
            </div>
          </Column>
          <Column className={'my-2'}>
            <Accordion activeKey={this.state.accordionKey}>
              <Card>
                <Card.Header>
                  <Image src={threeBarIcon} className={'icon-bar ml-2'}/>
                  <Accordion.Toggle as={Button} variant="link" eventKey="flight-select" onClick={() => this.setAccordionTab('flight-select')}>
                    Flight Select
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="flight-select">
                  <Card.Body>
                    <h6>Select IMEI</h6>
                    <Select
                      value={this.state.selectedIMEI}
                      onChange={this.imeiSelectChange}
                      options={this.state.modemList.map((modem) => ({value: modem.name, label: `(${modem.partialImei}) ${modem.name}`}))}
                      menuPortalTarget={document.querySelector('body')}
                      isSearchable={true}
                      isClearable={true}
                      autoFocus={true}
                    />
                    <h6 className={'mt-2'}>Select Flight</h6>
                    <Select
                      value={this.state.selectedFlight}
                      onChange={this.flightSelectChange}
                      options={this.state.flightList}
                      menuPortalTarget={document.querySelector('body')}
                      isSearchable={true}
                      isDisabled={this.state.flightList.length < 1}
                    />
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <Image src={balloonIcon} className={'icon-balloon ml-2'}/>
                  <Accordion.Toggle as={Button} variant="link" eventKey="payload-details" onClick={() => this.setAccordionTab('payload-details')}>
                    Payload Details
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="payload-details">
                  <Card.Body className={'custom-curve-window'}>
                    <Form>
                      <Form.Check label={'Landing prediction'} onClick={() =>
                        this.setState({useLandingPrediction: !this.state.useLandingPrediction})
                      }/>
                    </Form>
                    <h6 className={'mt-2'}>Velocity Profile</h6>
                    <Form>
                      <Form.Check label={'Custom Function'} type={'radio'}
                                  id={'velocity-cust-radio'}
                                  onClick={() => this.onVelocityProfileChange('custom')}
                                  checked={this.state.chosenVelocityRadio === 'custom'}
                                  disabled={!this.state.useLandingPrediction}
                      />

                      <Row>
                        <Column lg={'auto'} md={'auto'} sm={'auto'} xs={'auto'} xl={'auto'}
                                className={'mr-0 pr-0 my-3'}>
                          <p disabled={this.state.chosenVelocityRadio !== 'custom'}>y = </p>
                        </Column>
                        <Column className={'ml-0 pl-1 my-2'}>
                          <Form.Group>
                            <Form.Control type={'text'} placeholder={'sqrt(x)'}
                                          disabled={this.state.chosenVelocityRadio !== 'custom'}/>
                            <Form.Text className="text-muted">
                              Define a custom velocity function with variable "x"
                            </Form.Text>
                          </Form.Group>
                        </Column>
                      </Row>

                      <Form.Check label={'Descent Equation'} type={'radio'}
                                  id={'velocity-calc-radio'}
                                  onClick={() => this.onVelocityProfileChange('calculate')}
                                  checked={this.state.chosenVelocityRadio === 'calculate'}
                                  disabled={!this.state.useLandingPrediction}
                      />
                    </Form>

                    {/* Render Calculation Input Variables */}
                    {this.state.chosenVelocityRadio === 'calculate' &&
                    <Form>
                      <Form.Group>
                        <Form.Label>Payload Mass</Form.Label>
                        <Form.Control type={'number'} placeholder={'kilograms'} min={'0'}
                                      max={'60'} step={'any'} disabled={!this.state.useLandingPrediction}
                                      ref={change => this.payloadMass = change}
                                      onChange={this.testVelocity}
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Parachute Diameter</Form.Label>
                        <Form.Control type={'number'} placeholder={'meters'} min={'0.01'}
                                      max={'20'} step={'any'} disabled={!this.state.useLandingPrediction}
                                      ref={change => this.parachuteDiameter = change}
                                      onChange={this.testVelocity}
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Drag Coefficient</Form.Label>
                        <Form.Control type={'number'} placeholder={'unitless'} min={'0.01'}
                                      max={'2'} step={'any'} disabled={!this.state.useLandingPrediction}
                                      ref={change => this.dragCoefficient = change}
                                      onChange={this.testVelocity}
                        />
                      </Form.Group>
                    </Form>
                    }
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <Image src={clockIcon} className={'icon-bar ml-2'}/>
                  <Accordion.Toggle as={Button} variant="link" eventKey="current-flights" onClick={() => this.setAccordionTab('current-flights')}>
                    Current Flights
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="current-flights">
                  <Card.Body style={{overflowY: 'auto', maxHeight: '20rem'}}>
                    {this.state.activeFlights.length > 0 &&
                    this.state.activeFlights.map(partialPoint => (
                      <ActiveFlight
                        {...partialPoint}
                      />
                    ))
                    }
                    {this.state.activeFlights.length === 0 &&
                    <Card.Text className={'text-secondary'}>There are no active flights.</Card.Text>
                    }
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <Image src={chartIcon} className={'icon-bar ml-2'}/>
                  <Accordion.Toggle as={Button} variant="link" eventKey="flight-data" onClick={() => this.setAccordionTab('flight-data')}>
                    Flight Data
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="flight-data">
                  <Card.Body style={{overflowY: 'auto', height: '45vh', maxHeight: '280px'}}>
                    <Card.Title className={'mb-1'}>Selected flight</Card.Title>
                    {this.state.currentFlight === null && <Card.Text>Please select a flight.</Card.Text>}
                    {this.state.currentFlight &&
                    <SelectedFlightData
                      imei={this.state.selectedIMEI && this.state.selectedIMEI.value}
                      date={this.state.currentFlight.start_date.format('MMMM Do, YYYY')}
                      datetime={this.state.selectedPosition.datetime.format('YYYY-MM-DD HH:mm:ss')}
                      duration={moment.duration(this.state.selectedPosition.datetime.utc().diff(this.state.currentFlight.firstPoint().datetime.utc())).humanize()}
                      max_altitude={this.state.currentFlight.stats.max_altitude}
                      min_altitude={this.state.currentFlight.stats.min_altitude}
                      avg_ground={this.state.currentFlight.stats.avg_ground}
                      max_ground={this.state.currentFlight.stats.max_ground}
                      max_vertical={this.state.currentFlight.stats.max_vertical}
                      lat={this.state.selectedPosition.latitude}
                      long={this.state.selectedPosition.longitude}
                      altitude={this.state.selectedPosition.altitude}
                      vertical={this.state.selectedPosition.vertical_velocity}
                      ground={this.state.selectedPosition.ground_speed}
                      elevation={this.state.groundElevation}
                      downloadFlight={this.downloadFlight}
                    />
                    }
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </Column>
        </Row>
        <Row>
          <Column lg={12} xl={12} md={12} sm={12} xs={12}>
            <Card className={'my-3'} style={{height: '34rem'}}>
              <Card.Body style={{maxHeight: '530px'}}>
                <Tab.Container id="data-tabs" defaultActiveKey="altitude">
                  <Nav justify variant="pills">
                    <Nav.Item>
                      <Nav.Link eventKey="altitude">Altitude</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="wind-layers">Wind Layers</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="pin-states">Pin States</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content>
                    <Tab.Pane eventKey="altitude">
                      <Card.Title className={'mt-3'}>Altitude over Time</Card.Title>
                      {this.state.selectedPosition &&
                        <Card.Subtitle>
                          Selected Point: {this.state.selectedPosition.datetime.clone().local().format('YYYY-MM-DD HH:mm:ss')}
                        </Card.Subtitle>}
                      <AltitudeChart
                        dataName={'Balloon Altitude'}
                        data={this.state.currentFlight && this.state.currentFlight.altitudes()}
                        key={this.state.chartRedrawKey}
                        labels={this.state.currentFlight && this.state.currentFlight.datetimes()}
                        selectPosition={this.setSelectedPosition}
                        animation={this.state.chartAnimation}
                        style={{height: '18rem', maxHeight: '18rem'}}
                      />
                    </Tab.Pane>
                    <Tab.Pane eventKey="wind-layers">
                      wind layer graph
                    </Tab.Pane>
                    <Tab.Pane eventKey="pin-states" className={'py-3'}>
                      <div className={'mt-3'}> </div>
                      <Card.Text>This log shows Iridium pin states as they come in from an active flight.</Card.Text>
                      <LogWindow
                        registerPrint={this.registerPrint}
                        title={'Pin States Log'}
                        autoscroll={true}
                      />
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Column>
        </Row>
      </Container>
    )
  }
}

export default Tracking;