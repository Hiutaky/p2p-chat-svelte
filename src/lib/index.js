// place files you want to import through the `$lib` alias in this folder.
import { Peer } from "peerjs"

export const StartClient = ( peerId = '', path = 'global', port = 9000 ) => {
  console.log( 'starting', peerId, path, port )
  const client = new Peer(peerId, {
    host: "localhost",
    port: port,
    path: `/${path}`
  })
  return client
}
