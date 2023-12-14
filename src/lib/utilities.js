import axios from "axios"

const ServerPorts = {
  main: 9000,
  queue: 9003,
  roulette: 9001,
  party: 9002,
  live: 9004,
  "live-explore": 9005
}
const defaultServer = 'main'
const isLocalhost = () => window.location.hostname === '127.0.0.1' 
export const publicHost = (server = defaultServer) => ! isLocalhost() ? `${server}.sudo-ku.app` : `127.0.0.1:${ServerPorts[server]}`
export const getPublicURI = (server = defaultServer) => ! isLocalhost() ? `https://${publicHost(server)}/${server}` : `http://${publicHost(server)}/${server}`
export const getPeers = async (server = defaultServer) => (await axios.get( `${getPublicURI(server)}/peerjs/peers` )).data

export const hashCode = (name) => {
    var hash = 0;
    for (var i = 0; i < name.length; i++) {
        var character = name.charCodeAt(i);
        hash = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  export const getModulus = (num, max) => {
    return num % max;
  }
  
  export const getDigit = (number, ntn) => {
    return Math.floor(( number/ Math.pow(10, ntn)) % 10);
  }
  
  export const getBoolean = (number, ntn) => {
    return (!((getDigit(number, ntn)) % 2))
  }
  
  export const getAngle = (x, y) => {
    return Math.atan2(y, x) * 180 / Math.PI;
  }
  
  export const getUnit = (number, range, index) => {
    let value = number % range
  
    if(index && ((getDigit(number, index) % 2) === 0)) {
      return -value
    } else return value
  }
  
  export const getRandomColor = (number, colors, range) => {
    return colors[(number) % range]
  }
  
  export const getContrast = (hexcolor) => {
  
      // If a leading # is provided, remove it
      if (hexcolor.slice(0, 1) === '#') {
          hexcolor = hexcolor.slice(1);
      }
  
      // Convert to RGB value
      var r = parseInt(hexcolor.substr(0,2),16);
      var g = parseInt(hexcolor.substr(2,2),16);
      var b = parseInt(hexcolor.substr(4,2),16);
  
      // Get YIQ ratio
      var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
      // Check contrast
      return (yiq >= 128) ? '#000000' : '#FFFFFF';
  
  };


