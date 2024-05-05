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
import Card from 'react-bootstrap/Card'
import '../style/logwindow.css'
import Container from 'react-bootstrap/Container'
import Badge from 'react-bootstrap/Badge'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import moment from 'moment'
import Select from 'react-select'
import "bootstrap-icons/font/bootstrap-icons.css";
import Dropdown from "react-bootstrap/Dropdown";
import {createPortal} from "react-dom";


class LogItem {
  constructor (time, status, inputPins, outputPins) {
    this.time = time;
    this.status = status;
    this.changed = status === 'changed';
    this.inputPins = inputPins;
    this.outputPins = outputPins;
  }

  // For searching/comparing
  toString () {
    return `[${this.time}] ${this.status} ${this.changed && '  '} | input: ${this.inputPins}, output: ${this.outputPins}`
  }

  toComponent () {
    // Determine Bootstrap Badge color from status
    let statusVariant;
    if (this.changed) statusVariant = 'success';
    else  statusVariant = 'primary';

    return (
      <div>
        <ColorSamp color={'#d300a4'}>[{this.time}] </ColorSamp>
        {/* First letter caps */}
        <Badge variant={statusVariant}>{this.status.charAt(0).toUpperCase() + this.status.slice(1)}</Badge>
        {/* Add spaces as padding for alignment*/}
        {this.changed && <samp style={{whiteSpace: 'pre'}}>  </samp>}
        <samp> | Input: </samp>
        <ColorSamp color={(this.inputPins === null) ? '#7c5100' : '#006dbd'}>{`${this.inputPins}`}</ColorSamp>
        <samp>, Output: </samp>
        <ColorSamp color={(this.outputPins === null) ? '#7c5100' : '#006dbd'}>{`${this.outputPins}`}</ColorSamp>
        {'\n'}
      </div>
    )
  }
}

export default class LogWindow extends Component {
  // Defined outside of state as these need to update immediately
  lastInputPins = null;
  lastOutputPins = null;

  constructor(props) {
    super(props);
    this.statusOptions = ['Any', 'Changed', 'Unchanged'].map((item) => ({
      label: item,
      value: item.toLowerCase()
    }));

    this.inputPinOptions = [...Array(16).keys()].map(item => ({
      label: item,
      value: item
    }))
    this.outputPinOptions = [...Array(8).keys()].map(item => ({
      label: item,
      value: item
    }))

    this.state = {
      items: [],
      autoscroll: true,
      filterText: '',
      filterStatusOption: this.statusOptions[0],
      filterInputOptions: null,
      filterOutputOptions: null
    };
  }

  defaultProps = {
    autoscroll: true
  };

  scrollToBottom () {
    this.el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }

  print = (inputPins, outputPins, datetime) => {
    let newIn = null;
    let newOut = null;
    let inChanged = false;
    let outChanged = false;
    if (typeof inputPins === "number") {
      newIn = inputPins % 16;
      inChanged = (this.lastInputPins !== newIn);
      this.lastInputPins = newIn;
    }
    if (typeof outputPins === "number") {
      newOut = outputPins % 8;
      outChanged = (this.lastOutputPins !== newOut);
      this.lastOutputPins = newOut;
    }
    const logItem = new LogItem(
      datetime,
      (inChanged || outChanged) ? 'changed' : 'unchanged',
      newIn,
      newOut
    );
    this.state.items.push(logItem);
    this.setState({items: this.state.items});
  };

  clear () {
    this.lastInputPins = null;
    this.lastOutputPins = null;
    this.setState({items: []});
  }

  handleFilterChange (event) {
    this.setState({filterText: event.target.value});
  }

  handleStatusFilterChange = async (change) => {
    this.setState({filterStatusOption: change});
  }

  handleInputPinsFilterChange = async (change) => {
    this.setState({filterInputOptions: change})
  }

  handleOutputPinsFilterChange = async (change) => {
    this.setState({filterOutputOptions: change})
  }

  statusFilterActive () {
    return this.state.filterStatusOption && this.state.filterStatusOption.value !== 'any';
  }

  inputFilterActive () {
    return this.state.filterInputOptions && this.state.filterInputOptions.length > 0;
  }

  outputFilterActive () {
    return this.state.filterOutputOptions && this.state.filterOutputOptions.length > 0;
  }

  applyFilters (items) {
    if (this.statusFilterActive()) {
      items = items.filter(item => item.status === this.state.filterStatusOption.value);
    }
    if (this.inputFilterActive()) {
      items = items.filter(item => this.state.filterInputOptions.find(option => option.value === item.inputPins));
    }
    if (this.outputFilterActive()) {
      items = items.filter(item => this.state.filterOutputOptions.find(option => option.value === item.outputPins));
    }
    return items;
  }

  componentDidMount () {
    if (this.props.registerControls !== null) {
      this.props.registerControls(this.print, this.clear);
    }
    if (this.props.autoscroll) this.scrollToBottom();
    this.setState({autoscroll: this.props.autoscroll});
  }

  componentDidUpdate () {
    if (this.state.autoscroll) this.scrollToBottom();
  }

  render () {
    return (
      <Card className={'bg-light'}>
        <Card.Header>{this.props.title}</Card.Header>
        <Card.Text>
          <Container className={'log-container'}>
            <Dropdown>
              <Dropdown.Toggle disabled={this.props.isDisabled} variant="outline-primary" id="log-window-filter-dropdown">
                Filter
                <i className="bi bi-filter pl-1"></i>
              </Dropdown.Toggle>

              {createPortal(
                <Dropdown.Menu style={{
                  width: '24rem',
                  border: `1px solid rgb(61, 139, 253)`,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }}>
                  <Form>
                    <InputGroup size={'sm'} className={'mb-3 ml-3'}>
                      <InputGroup.Prepend>
                        <InputGroup.Text>Status:</InputGroup.Text>
                      </InputGroup.Prepend>
                      <Select
                        value={this.state.filterStatusOption}
                        onChange={this.handleStatusFilterChange}
                        options={this.statusOptions}
                        defaultValue={this.statusOptions[0]}
                        styles={{
                          control: (baseStyles, state) => ({
                            ...baseStyles,
                            width: '12rem',
                          }),
                        }}
                      />
                    </InputGroup>
                    <InputGroup size={'sm'} className={'mb-3 ml-3'}>
                      <InputGroup.Prepend>
                        <InputGroup.Text>Input Pins:</InputGroup.Text>
                      </InputGroup.Prepend>
                      <Select
                        value={this.state.filterInputOptions}
                        onChange={this.handleInputPinsFilterChange}
                        isMulti
                        options={this.inputPinOptions}
                        styles={{
                          control: (baseStyles, state) => ({
                            ...baseStyles,
                            width: '12rem',
                          }),
                        }}
                      />
                    </InputGroup>
                    <InputGroup size={'sm'} className={'ml-3'}>
                      <InputGroup.Prepend>
                        <InputGroup.Text>Output Pins:</InputGroup.Text>
                      </InputGroup.Prepend>
                      <Select
                        value={this.state.filterOutputOptions}
                        onChange={this.handleOutputPinsFilterChange}
                        isMulti
                        options={this.outputPinOptions}
                        styles={{
                          control: (baseStyles, state) => ({
                            ...baseStyles,
                            width: '12rem',
                          }),
                        }}
                      />
                    </InputGroup>
                  </Form>
                </Dropdown.Menu>,
                document.body
              )}
            </Dropdown>
            <Card className={'log-card'}>
              <Card.Text>
                <Container className={'log-container'}>
                  {((this.statusFilterActive() || this.inputFilterActive() || this.outputFilterActive())
                    ? this.applyFilters(this.state.items)
                    : this.state.items).map(item => {
                    if (typeof item === 'string') return (
                      <div>
                        <samp>
                          {item}
                        </samp>
                        {'\n'}
                      </div>
                    );
                    else return item.toComponent();
                  })}
                  <div ref={el => {
                    this.el = el;
                  }}/>
                </Container>
              </Card.Text>
            </Card>
          </Container>
        </Card.Text>
        <Card.Footer>
          <Form>
            <Form.Check
              type={"checkbox"}
              id={"autoscroll-check"}
              label={`Autoscroll: ${this.state.autoscroll ? 'On' : 'Off'}`}
              onClick={() => this.setState({autoscroll: !this.state.autoscroll})}
              checked={this.state.autoscroll}
            />
          </Form>
        </Card.Footer>
      </Card>
    )
  }
}

const ColorSamp = (props) => (
  <samp style={{color: props.color}}>{props.children}</samp>
);

export {LogItem}