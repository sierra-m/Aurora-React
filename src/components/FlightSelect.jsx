
import React, { Component } from 'react'
import Column from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Card from 'react-bootstrap/Card'
import Select from 'react-select'
import Form from 'react-bootstrap/Form'
import Tab from 'react-bootstrap/Tab'
import Nav from 'react-bootstrap/Nav'
import Dropdown from 'react-bootstrap/Dropdown';


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
            <Row>
              <h6>Select Modem</h6>
            </Row>
            <Row>
              <Column lg={10}>
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
              </Column>
              {/* Button for filter by organization */}
              <Column>
                <Dropdown>
                  <Dropdown.Toggle variant="primary" id="dropdown-basic">
                    <i className="bi bi-funnel"></i>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item href="#">
                      <Select
                        value={this.state.selectedOrgOption}
                        onChange={this.orgSelectChange}
                        options={this.props.modemList.map((modem) => ({
                          value: modem.org,
                          label: modem.org
                        }))}
                        menuPortalTarget={document.querySelector('body')}
                        isSearchable={true}
                      />
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Column>
            </Row>
            <Row>
              <h6 className={'mt-2'}>Select Flight Date</h6>
            </Row>
            <Row>
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
            </Row>
          </Tab.Pane>
          <Tab.Pane eventKey="by-date">

          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    )
  }
}