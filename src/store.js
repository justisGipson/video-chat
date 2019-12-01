import Vue from 'vue'
import Vuex from 'vuex'
import { STATUS_OPTIONS } from './utils/config'

Vue.use(Vuex)
export default new Vuex.store({
    state: {
        room: undefined, // current room
        username: undefined, // username
        status: STATUS_OPTIONS.available, // user status
        rooms: [] // available rooms
    },
    mutations: {
        // mutations per action (joinRoom, changeRoom, setRooms, leaveChat, changeStatus)
    },
    actions: {
        // define all actions that get triggered when - joinRoom, changeRoom, setRooms, leaveChat, changeStatus
        
    }
})
