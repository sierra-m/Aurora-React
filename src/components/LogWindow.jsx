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
import moment from 'moment'


class LogItem {
  constructor (time, status, inputPins, outputPins) {
    this.time = time;
    this.status = status;
    this.inputPins = inputPins;
    this.outputPins = outputPins;
  }

  toComponent () {
    // Determine Bootstrap Badge color from status
    let statusVariant = 'primary';
    if (this.status === 'changed') statusVariant = 'success';
    else if (this.status === 'unchanged') statusVariant = 'primary';

    return (
      <div>
        <ColorSamp color={'#d300a4'}>[{this.time}] </ColorSamp>
        {/* First letter caps */}
        <Badge variant={statusVariant}>{this.status.charAt(0).toUpperCase() + this.status.slice(1)}</Badge>
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
  state = {
    items: [],
    lastInputPins: null,
    lastOutputPins: null,
    autoscroll: true
  };

  defaultProps = {
    autoscroll: true
  };

  scrollToBottom () {
    this.el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }

  print = (inputPins, outputPins, datetime) => {
    let lastInputPins = this.state.lastInputPins;
    let lastOutputPins = this.state.lastOutputPins;
    let newIn = null;
    let newOut = null;
    let inChanged = false;
    let outChanged = false;
    if (typeof inputPins === "number") {
      newIn = inputPins % 16;
      inChanged = (lastInputPins !== newIn);
      lastInputPins = newIn;
    }
    if (typeof outputPins === "number") {
      newOut = outputPins % 8;
      outChanged = (lastOutputPins !== newOut);
      lastOutputPins = newOut;
    }
    const logItem = new LogItem(
      datetime.format('YYYY-MM-DD HH:mm:ss'),
      (inChanged || outChanged) ? 'changed' : 'unchanged',
      newIn,
      newOut
    );
    this.state.items.push(logItem);
    this.setState({items: this.state.items, lastInputPins: lastInputPins, lastOutputPins: lastOutputPins});
  };

  clear () {
    this.setState({items: [], lastInputPins: null, lastOutputPins: null});
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
            <Card className={'log-card'}>
              <Card.Text>
                <Container className={'log-container'}>
                  {this.state.items.map(item => {
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