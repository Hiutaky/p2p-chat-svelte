// place files you want to import through the `$lib` alias in this folder.
import { Peer } from "peerjs"

export const publicHost = (room) => `${room}.sudo-ku.app`
export const getPublicURI = (room) => `https://${publicHost(room)}`
let StartClient = false
if( window.location.hostname === '127.0.0.1') {
  StartClient = ( peerId = '', path = 'main', port = 9000 ) => {
   console.log( 'starting', peerId, path, port )
   const client = new Peer(peerId, {
     host: "localhost",
     port: port,
     path: `/${path}`
   })
   return client
 }
}else {
  StartClient = ( peerId = '', path = 'main', port = 9000 ) => {
    console.log( 'starting', peerId, path, port )
    const client = new Peer(peerId, {
      host: publicHost(path),
      path: `/${path}`,
      secure: true
    })
    return client
  }
}


export default StartClient 