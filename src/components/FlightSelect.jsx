
import React, { Component } from 'react'
import Column from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Card from 'react-bootstrap/Card'
import Select from 'react-select'
import Form from 'react-bootstrap/Form'
import Tab from 'react-bootstrap/Tab'
import Nav from 'react-bootstrap/Nav'
import Dropdown from 'react-bootstrap/Dropdown';
import Button from "react-bootstrap/Button";


export default class FlightSelect extends Component {
  /** Props:
   *  - modemList: list of modems
   *  - flightDateList: list of flight dates
   *  - fetchFlightsFrom: function to pull dates for a modem name
   *  - fetchFlight: function to pull a flight based on modem name and date
   */

  state = {
    filteredModemList: [],

    // Select variables (option objects for select components)
    selectedModemOption: null,
    selectedFlightDateOption: null,
    selectedOrgOption: null,

    selectedOrgFilter: null
  };

  orgSelectChange = async (change) => {
    this.setState({selectedOrgOption: change, selectedOrgFilter: change.value});
  }

  /**
   * Change handler for IMEIs dropdown
   * @param {Object} change The new change
   */
  imeiSelectChange = async (change) => {
    const modem = this.props.modemList.find((m) => (m.name === change.value));
    this.setState({selectedModem: modem, selectedModemOption: change, selectedFlightDateOption: null});
    if (modem !== undefined) {
      console.log('Selection chosen:');
      console.log(`(${modem.partialImei}) ${modem.name}`);
      await this.props.fetchFlightsFrom(modem.name);
    }
  };

  /**
   * Change handler for Flights dropdown
   * @param {Object} change The new change
   */
  flightDateSelectChange = async (change) => {
    await this.setState({selectedFlightDateOption: change});
    if (change !== null) {
      await console.log('Flight chosen:');
      await console.log(change.label);
      if (this.state.selectedFlightDateOption !== null && this.state.selectedModem !== null) {
        await this.props.fetchFlight(change.value);
      }
    }
  };

  render() {
    return (
      <Tab.Container id={'flight-select-by'} defaultActiveKey={'by-modem'}>
        <Nav justify variant="pills">
          <Nav.Item>
            <Nav.Link eventKey="by-modem">By Modem</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="by-date">By Date</Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="by-modem">
            <Row className={'mt-3'}>
              <Column>
                <h6>Select Modem</h6>
              </Column>
            </Row>
            <Row>
              <Column xs={9} className={'pr-0'}>
                <Select
                  value={this.state.selectedModemOption}
                  onChange={this.imeiSelectChange}
                  options={this.props.modemList.filter((modem) => {
                    if (this.state.selectedOrgFilter !== null) {
                      return modem.org === this.state.selectedOrgFilter;
                    } else {
                      return true;
                    }
                  }).map((modem) => ({
                    value: modem.name,
                    label: `(${modem.partialImei}) ${modem.name}`
                  }))}
                  menuPortalTarget={document.querySelector('body')}
                  isSearchable={true}
                  isClearable={true}
                  autoFocus={true}
                />
                {this.state.selectedOrgFilter &&
                  <div className={'pt-1'}>
                    <p>
                      <small><em>Filtered by:</em> <a
                        className={'text-primary link-offset-2 link-underline-opacity-50 link-underline-opacity-100-hover'}
                        href={"#"}
                        onClick={() => {
                          this.setState({selectedOrgFilter: null})
                        }}
                      >
                        {this.state.selectedOrgFilter}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                             className="bi bi-x-lg pl-1 mb-1" viewBox="0 0 16 16">
                          <path
                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                        </svg>
                      </a></small>
                    </p>

                  </div>
                }
              </Column>
              {/* Button for filter by organization */}
              <Column className={'pl-0'}>
                <Dropdown alignRight={true}>
                  <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                         className="bi bi-funnel" viewBox="0 0 16 16">
                      <path
                        d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z"/>
                    </svg>
                  </Dropdown.Toggle>

                  <Dropdown.Menu style={{width: '15rem'}}>
                    <h6 className={'mx-1'}>Filter by organization</h6>
                    <Select
                      value={this.state.selectedOrgOption}
                      onChange={this.orgSelectChange}
                      options={[...new Set(this.props.modemList.map((modem) => (modem.org)))].map((org) => ({
                        value: org,
                        label: org
                      }))}
                      menuPortalTarget={document.querySelector('body')}
                      isSearchable={true}
                    />
                  </Dropdown.Menu>
                </Dropdown>
              </Column>
            </Row>
            <Row>
              <Column>
                <h6 className={'mt-2'}>Select Flight Date</h6>
              </Column>
            </Row>
            <Row>
              <Column>
                <Select
                  value={this.state.selectedFlightDateOption}
                  onChange={this.flightDateSelectChange}
                  options={this.props.flightDateList.map((x, index) => ({
                    value: x.uid,
                    label: `${index + 1}: ${x.date}`
                  })).reverse()}
                  menuPortalTarget={document.querySelector('body')}
                  isSearchable={true}
                  isDisabled={this.props.flightDateList.length < 1}
                />
              </Column>
            </Row>
          </Tab.Pane>
          <Tab.Pane eventKey="by-date">

          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    )
  }
}