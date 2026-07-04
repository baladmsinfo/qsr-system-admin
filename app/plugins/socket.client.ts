import { io, type Socket } from 'socket.io-client'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // `auth` as a callback is re-evaluated on every (re)connect, so logging in
  // after the socket already connected still picks up the fresh token.
  const socket: Socket = io(config.public.API_ENDPOINT, {
    transports: ['websocket', 'polling'],
    auth: (cb) => cb({ token: localStorage.getItem('token') }),
  })

  return {
    provide: {
      socket,
    },
  }
})
