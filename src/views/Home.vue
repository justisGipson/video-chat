<template>
    <div class="options">
        <h2>Video Chat</h2>
        <div>
            <form novalidate class="md-layout" @submit.prevent="submitForm">
                <md-field>
                    <label>Username</label>
                    <md-input v-model="username" type="string" id="username">
                    </md-input>
                </md-field>
                <md-field>
                    <label for="movie">Room</label>
                    <md-select v-model="room" name="room" id="room">
                        <md-option 
                            v-for="room in rooms"
                            :key="room.id"
                            :value="room.name">
                            {{room.name}}
                        </md-option>
                    </md-select>
                </md-field>
                <div v-if="error" class="options-error">
                    <p>{{error}}</p>
                </div>
                <div class="options_submit">
                    <md-button type="submit" class="md-raised md primary" :disabled="!(username && room)">Join</md-button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { url, STORE_ACTIONS } from "../../utils/config"
export default {
    name: "home",
    data: {// function returning object with username, room, rooms, error
        async created() {
            try {
                const data = await this.$http.get(`http://${url}/rooms`)
                this.rooms = data.body
                this.$store.dispatch(STORE_ACTIONS.setRooms, this.rooms) // save rooms
            } catch (error) {
                console.log(error)
            }
        }
    },
    methods: {
        async submitForm() {
            if(!(this.username && this.room)) return
            try {
                let response = await this.$http.post(`http://${url}/auth/login`, {
                    room: this.room,
                    username: this.username
                })
                if (response.body.code === 400 || response.body.code === 401 || response.body.code === 500) {
                    this.error = response.body.message
                    return
                }
                this.$store.dispatch(STORE_ACTIONS.joinRoom, data) // save room
                this.$router.push('/chat') // nav to main room
            } catch (error) {
                console.log(errror)
            }
        }
    }
}
</script>

<style lang="scss">

</style>
