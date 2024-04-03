
import balloonIcon2DiagCrimson from '../images/balloon/aurora_balloon_2diag_crimson.svg'
import balloonIcon2DiagDarkBlue from '../images/balloon/aurora_balloon_2diag_dark_blue.svg'
import balloonIcon2DiagGreen from '../images/balloon/aurora_balloon_2diag_green.svg'
import balloonIcon2DiagLightBlue from '../images/balloon/aurora_balloon_2diag_light_blue.svg'
import balloonIcon2DiagMagenta from '../images/balloon/aurora_balloon_2diag_magenta.svg'
import balloonIcon2DiagOrange from '../images/balloon/aurora_balloon_2diag_orange.svg'
import balloonIcon2DiagPurple from '../images/balloon/aurora_balloon_2diag_purple.svg'

import balloonIcon3DiagCrimson from '../images/balloon/aurora_balloon_3diag_crimson.svg'
import balloonIcon3DiagDarkBlue from '../images/balloon/aurora_balloon_3diag_dark_blue.svg'
import balloonIcon3DiagGreen from '../images/balloon/aurora_balloon_3diag_green.svg'
import balloonIcon3DiagLightBlue from '../images/balloon/aurora_balloon_3diag_light_blue.svg'
import balloonIcon3DiagMagenta from '../images/balloon/aurora_balloon_3diag_magenta.svg'
import balloonIcon3DiagOrange from '../images/balloon/aurora_balloon_3diag_orange.svg'
import balloonIcon3DiagPurple from '../images/balloon/aurora_balloon_3diag_purple.svg'

import balloonIconHorizArcsCrimson from '../images/balloon/aurora_balloon_horiz_arcs_crimson.svg'
import balloonIconHorizArcsDarkBlue from '../images/balloon/aurora_balloon_horiz_arcs_dark_blue.svg'
import balloonIconHorizArcsGreen from '../images/balloon/aurora_balloon_horiz_arcs_green.svg'
import balloonIconHorizArcsLightBlue from '../images/balloon/aurora_balloon_horiz_arcs_light_blue.svg'
import balloonIconHorizArcsMagenta from '../images/balloon/aurora_balloon_horiz_arcs_magenta.svg'
import balloonIconHorizArcsOrange from '../images/balloon/aurora_balloon_horiz_arcs_orange.svg'
import balloonIconHorizArcsPurple from '../images/balloon/aurora_balloon_horiz_arcs_purple.svg'

import balloonIconStarCrimson from '../images/balloon/aurora_balloon_star_crimson.svg'
import balloonIconStarDarkBlue from '../images/balloon/aurora_balloon_star_dark_blue.svg'
import balloonIconStarGreen from '../images/balloon/aurora_balloon_star_green.svg'
import balloonIconStarLightBlue from '../images/balloon/aurora_balloon_star_light_blue.svg'
import balloonIconStarMagenta from '../images/balloon/aurora_balloon_star_magenta.svg'
import balloonIconStarOrange from '../images/balloon/aurora_balloon_star_orange.svg'
import balloonIconStarPurple from '../images/balloon/aurora_balloon_star_purple.svg'

import balloonIconVertArcsCrimson from '../images/balloon/aurora_balloon_vert_arcs_crimson.svg'
import balloonIconVertArcsDarkBlue from '../images/balloon/aurora_balloon_vert_arcs_dark_blue.svg'
import balloonIconVertArcsGreen from '../images/balloon/aurora_balloon_vert_arcs_green.svg'
import balloonIconVertArcsLightBlue from '../images/balloon/aurora_balloon_vert_arcs_light_blue.svg'
import balloonIconVertArcsMagenta from '../images/balloon/aurora_balloon_vert_arcs_magenta.svg'
import balloonIconVertArcsOrange from '../images/balloon/aurora_balloon_vert_arcs_orange.svg'
import balloonIconVertArcsPurple from '../images/balloon/aurora_balloon_vert_arcs_purple.svg'

const balloonIconList = [
  balloonIcon2DiagCrimson,
  balloonIcon2DiagDarkBlue,
  balloonIcon2DiagGreen,
  balloonIcon2DiagLightBlue,
  balloonIcon2DiagMagenta,
  balloonIcon2DiagOrange,
  balloonIcon2DiagPurple,

  balloonIcon3DiagCrimson,
  balloonIcon3DiagDarkBlue,
  balloonIcon3DiagGreen,
  balloonIcon3DiagLightBlue,
  balloonIcon3DiagMagenta,
  balloonIcon3DiagOrange,
  balloonIcon3DiagPurple,

  balloonIconHorizArcsCrimson,
  balloonIconHorizArcsDarkBlue,
  balloonIconHorizArcsGreen,
  balloonIconHorizArcsLightBlue,
  balloonIconHorizArcsMagenta,
  balloonIconHorizArcsOrange,
  balloonIconHorizArcsPurple,

  balloonIconStarCrimson,
  balloonIconStarDarkBlue,
  balloonIconStarGreen,
  balloonIconStarLightBlue,
  balloonIconStarMagenta,
  balloonIconStarOrange,
  balloonIconStarPurple,

  balloonIconVertArcsCrimson,
  balloonIconVertArcsDarkBlue,
  balloonIconVertArcsGreen,
  balloonIconVertArcsLightBlue,
  balloonIconVertArcsMagenta,
  balloonIconVertArcsOrange,
  balloonIconVertArcsPurple
]

const calcGroupSelect = (uid, digits, groupSize) => (parseInt(uid.slice(-digits), 16) % groupSize);

const chooseRandomIcon = (uid) => (balloonIconList[calcGroupSelect(uid, 2, balloonIconList.length)]);

export {chooseRandomIcon}