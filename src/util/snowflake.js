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

import moment from 'moment'
import bigInt from 'big-integer'

// Time begins in 2013
const borealisEpoch = 1357023600;

// Every modem IMEI shares this TAC
const iridiumTAC = '30023406';

/**
 * Encode a flight date and IMEI into a decodeable UID
 *
 * Borealis Snowflake
 * -----------------
 * The UID is a snowflake in the structure:
 *
 *                     Date                            IMEI
 *   111111111111111111111111111111111111111  111111111111111111111111
 *  63                                       23                      0
 *
 *  | Data | Bits    | Description                  | Obtaining                      |
 *  |:-----|:--------|:-----------------------------|:-------------------------------|
 *  | Date | 63 - 24 | Seconds since Borealis Epoch | (snowflake >> 24) + 1357023600 |
 *  | IMEI | 23 - 0  | Last 7 digits of IMEI        | snowflake & 0x7ffffff          |
 *
 * @param {moment.Moment} date The start date of the flight
 * @param {String} imei The IMEI of the modem
 * @return {string} A flight UID
 */
const encodeUID = (date, imei) => {
  // eslint-disable-next-line no-undef
  let time = bigInt(date.unix() - borealisEpoch);
  let snr = bigInt(parseInt(imei.toString().substring(8)));
  return time.shiftLeft(bigInt(24)).or(snr).toString();
};

const extractDate = (uid) => {
  return moment.utc(Number(bigInt(uid).shiftRight(bigInt(24))) + borealisEpoch, 'X');
};

const extractIMEI = (uid) => {
  return iridiumTAC + bigInt(uid).and(0x7ffffff).toString().padStart(7, '0');
};

export {encodeUID, extractDate, extractIMEI}