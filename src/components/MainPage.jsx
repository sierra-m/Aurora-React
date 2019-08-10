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
import '../style/main.css'
import '../custom.scss'
import Container from 'react-bootstrap/Container'
import Jumbotron from 'react-bootstrap/Jumbotron'
import Button from 'react-bootstrap/Button'
import Image from 'react-bootstrap/Image'
import { LinkContainer } from 'react-router-bootstrap'

import borealisGroup from '../images/borealisGroup.jpg'
import horizon from '../images/horizon.jpg'
import spacegrant from '../images/msgc.png'
import jump from '../images/jump.jpg'
import Row from 'react-bootstrap/Row'
import Column from 'react-bootstrap/Col'
import Parallax from './Parallax'

export default class MainPage extends Component {
  render () {
    return (
      <div id={'main-page'}>
        <Parallax image={borealisGroup} height={'90vh'}>
          <Row className={'h-100 justify-content-center mx-0'}>
            <Column xs={12} sm={12} md={8} lg={6} xl={6} className={'my-auto'}>
              <Jumbotron className={'mx-0'} style={{backgroundColor: 'rgba(255, 255, 255, 0.90)'}}>
                <h1>Time to Fly!</h1>
                <p>Check out the new Borealis Flight Tracker</p>
                <p>
                  <LinkContainer to={'/tracking'}>
                    <Button variant={'primary'} href={'/tracking'}>Start Tracking</Button>
                  </LinkContainer>
                </p>
              </Jumbotron>
            </Column>
          </Row>
        </Parallax>
        <Container>
          <Row className={'justify-content-center my-3'}>
            <Column xs={10} sm={10} md={8} lg={4} xl={4} className={'px-auto'}>
              <Image
                src={spacegrant}
                width={'auto'}
                alt={'Montana Space Grant Consortium'}
                fluid
              />
            </Column>
          </Row>
        </Container>
        <Parallax image={horizon} height={'90vh'} minHeight={'500px'}>
          <Container fluid style={{paddingTop: '5vh'}}>
            <Row>
              <Column sm={12} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}}>
                <h2 className={'text-white display-2'}>Reaching New Heights</h2>
                <h2 className={'text-white'}>One of the most cost-effective high-altitude testing platforms around</h2>
              </Column>
            </Row>
          </Container>
        </Parallax>
        <Container fluid>
          <Row>
            <Column sm={12} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}}>
              <h3 className={'display-3'}>Who are we?</h3>
            </Column>
          </Row>
        </Container>
        <Parallax image={jump} height={'30vh'} minHeight={'400px'} position={'right'} size={'auto 80vh'}>
          <Container fluid style={{paddingTop: '5vh'}}>
            <Row>
              <Column sm={12} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}}>
                <p style={{width: '30vw'}}>
                  <strong>B</strong>alloon <strong>O</strong>utreach, <strong>R</strong>esearch, <strong>E</strong>xploration
                  and <strong>L</strong>andscape <strong>I</strong>maging <strong>S</strong>ystem
                </p>
                <p style={{width: '30vw'}}>
                  BOREALIS is MSGC's high altitude ballooning program. In the program students from a variety of curricula
                  work together to conceive, design and build payloads that are flown up to 100,000 feet - the edge of space.
                  BOREALIS has two complete ballooning programs at Montana State University and the University of Montana.
                  Smaller affiliate campuses develop science and engineering payloads to fly in coordination with the two
                  university programs.
                </p>
              </Column>
            </Row>
          </Container>
        </Parallax>
        <Container fluid>
          <Row>
            <Column sm={12} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}}>
              <h3 className={'display-3 text-white'}>Some more text</h3>
            </Column>
          </Row>
          <Row>
            <Column sm={12} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}}>
              <h3 className={'display-3 text-white'}>And more text</h3>
            </Column>
          </Row>
        </Container>
      </div>
    )
  }
}