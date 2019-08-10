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

const icons = {
  300234064806810: 'um.png',
    300234065065560: 'msu.png',
  300234064802970: 'bhsu.png',
    300234063047270: 'um.png',
  300234064800720: 'umaine.png',
    300234064909640: 'uminn.png',
  300234064804740: 'cwu.png',
    300234064802830: 'apu.png',
  300234064805720: 'und.png',
    300234064808850: 'wvsg.png',
  300234064803840: 'asp.png',
    300234064909610: 'lsu.png',
  300234066715020: 'und.png',
    300234060252680: 'msu.png',
  300234064901600: 'uminn.png',
    300234064900610: 'up.png',
  300234063043420: 'msu.png',
    300234064906620: 'apu.png',
  300234065167350: 'uminn.png',
    300234064907590: 'uw.png',
  300234064904620: 'lsu.png',
  300234064907450: 'msu.png'
};

const getIcon = (imei) => {
  return icons[imei];
};

export {getIcon}