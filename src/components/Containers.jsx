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

import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'
import InputGroup from 'react-bootstrap/InputGroup'
import Image from 'react-bootstrap/Image'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import React from 'react'
import moment from 'moment'
import { dispMetersFeetBr, dispMetersFeet, mpsToFps, kphToMph } from '../util/helpers'
import { getIcon } from '../meta/schools'

import '../style/containers.css'


const getIconIMEI = (imei) => {
  const name = getIcon(imei);
  if (name) return require(`../images/icons/${name}`);
  return null;
};

const SelectedFlightData = ({
    modem,
    date,
    datetime,
    duration,
    lat,
    long,
    vertical,
    ground,
    max_altitude,
    min_altitude,
    avg_ground,
    max_ground,
    max_vertical,
    altitude,
    elevation,
    downloadFlight
  }) => {
  const state = {
    locationControl: null
  };

  const copyLocation = () => {
    if (state.locationControl) {
      state.locationControl.select();
      document.execCommand('copy')
    }
  };

  return (
    <div>
      <Card.Text className={'pt-1'}>
        <Table borderless>
          <tr className={'mt-0 mb-1'}>
            <td><strong>Modem:</strong></td>
            <td align={'right'}>{modem.name}</td>
          </tr>
          <tr className={'mt-0 mb-1'}>
            <td><strong>IMEI:</strong></td>
            <td align={'right'}>{'*'.repeat(10) + modem.partialImei}</td>
          </tr>
          <tr className={'mt-0 mb-1'}>
            <td><strong>Date:</strong></td>
            <td align={'right'}>{date}</td>
          </tr>
          <tr className={'mt-0 mb-1'}>
            <td><strong>Org:</strong></td>
            <td align={'right'}>{modem.org}</td>
          </tr>
        </Table>
      </Card.Text>
      <hr/>

      <Card.Subtitle>Current Point</Card.Subtitle>
      <Form className={'my-1'}>
        <Form.Group>
          <Form.Label column={false}>Location</Form.Label>
          <InputGroup>
            <Form.Control
              type={'input'}
              readOnly={true}
              value={'{}, {}'.format(lat.toFixed(4), long.toFixed(4))}
              ref={(control) => state.locationControl = control}
            />
            <InputGroup.Append>
              <Button onClick={copyLocation}>
                Copy
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Form.Group>
      </Form>
      <Card.Text className={'my-1'} style={{fontSize: '10pt'}}><strong>Altitude:</strong> {dispMetersFeet(altitude)}
      </Card.Text>
      <Card.Text className={'my-0'} style={{fontSize: '10pt'}}><strong>Time:</strong> {datetime}</Card.Text>
      <Card.Text className={'mt-0 mb-1 text-secondary'} style={{fontSize: '10pt'}}>({duration} from start)</Card.Text>
      <Card.Text className={'mb-1 mt-0'} style={{fontSize: '10pt'}}><strong>Vertical
        velocity:</strong> {mpsToFps(vertical)}</Card.Text>
      <Card.Text className={'mb-1 mt-0'} style={{fontSize: '10pt'}}><strong>Ground speed:</strong> {kphToMph(ground)}
      </Card.Text>
      {elevation &&
      [
        <Card.Text className={'mb-1 mt-0'} style={{fontSize: '10pt'}}><strong>Ground
          elevation:</strong> {dispMetersFeet(elevation)}</Card.Text>,
        <Card.Text className={'mb-1 mt-0'} style={{fontSize: '10pt'}}>
          {moment.duration((Math.abs(vertical) ** -1) * Math.abs(altitude - elevation), 'seconds').humanize()} until
          touchdown.
        </Card.Text>
      ]
      }
      <ButtonGroup className={'mt-1'}>
        <Button variant="outline-primary" onClick={() => downloadFlight('csv')}>Download Flight</Button>
        <DropdownButton variant="outline-primary" as={ButtonGroup} title="" id="download-nested-dropdown" onSelect={downloadFlight}>
          <Dropdown.Item eventKey="csv">CSV</Dropdown.Item>
          <Dropdown.Item eventKey="kml">KML</Dropdown.Item>
        </DropdownButton>
      </ButtonGroup>
      <Card.Subtitle className={'mb-2 mt-3'}>Statistics</Card.Subtitle>
      <div>
        <Table hover size="sm">
          <tbody style={{fontSize: '10pt'}}>
          <tr>
            <td><strong>Max Altitude:</strong></td>
            <td>{dispMetersFeetBr(max_altitude)}</td>
          </tr>
          <tr>
            <td><strong>Min Altitude:</strong></td>
            <td>{dispMetersFeetBr(min_altitude)}</td>
          </tr>
          <tr>
            <td><strong>Average Ground Speed:</strong></td>
            <td>{avg_ground + ' kph'}</td>
          </tr>
          <tr>
            <td><strong>Max Ground Speed:</strong></td>
            <td>{max_ground + ' kph'}</td>
          </tr>
          <tr>
            <td><strong>Max Vertical Speed:</strong></td>
            <td>{Math.abs(max_vertical) + ' m/s'}</td>
          </tr>
          </tbody>
        </Table>
      </div>

    </div>
  )
};

const ActiveFlight = ({uid, start_date, modem, datetime, callback}) => {
  return (
    <a style={{cursor: 'pointer'}} onClick={callback}>
      <Card className="card-item quick-shadow">
        <Card.Body>
          <Card.Title>Modem: {`${modem.name} (${modem.partialImei})`}</Card.Title>
          <Card.Subtitle>Org: {modem.org}</Card.Subtitle>
          <Card.Text>
            UID: {uid}<br/>
            Start Date: {start_date.format('MMMM Do[,] YYYY')} UTC<br/>
            Last Updated: {datetime.format('YYYY-MM-DD HH:mm:ss')} UTC ({datetime.fromNow()})
          </Card.Text>
        </Card.Body>
      </Card>
    </a>
  )
};

export { SelectedFlightData, ActiveFlight }