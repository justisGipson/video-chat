<template>
    <div>
        <div class="page-container">
        <!-- change room select -->
        <md-field>
            <label for="room">Room</label>
            <md-select v-model="room" @md-selected="onChangeRoom" name="room" id="room">
                <md-option v-for="room in this.$store.state.rooms" :key="room.id" :value="room.name">
                    {{room.name}}
                </md-option>
            </md-select>
        </md-field>
    </div>
    <md-app md-waterfall md-mode="fixed">
        <!-- room title and logout -->
        <md-app-toolbar class="md-primary">
            <span class="md-title page-container_room">
                {{room}}
            </span>
            <md-button class="md-icon-button page-container-logout" @click.native="logout()">
                <md-icon>power_settings_new</md-icon>
            </md-button>
        </md-app-toolbar>

        <!-- connected users list -->
        <md-app-drawer md-permanent="full">
            <!-- display users and emit event when the user opens private chat -->
            <UserList
                :users="users"
                :openPrivateChat="openPrivateChat.chat"
                @open-chat="openChat($event)"
            ></UserList>
        </md-app-drawer>

        <!-- chat area w/ all msgs -->
        <md-app-content>
            <!-- displays received messages from server -->
            <ChatArea :messages="messages"></ChatArea>
        </md-app-content>

        <!-- text area to compose msgs / emits event each time user sends msg -->
        <MessageArea
            @send-message="sendMessage($event)">
        </MessageArea>

        <!-- private chat. show dialog input controls whether we open provate chat or not-->
        <!-- openPrivateChat is an object defined in Vue Chat component that contains info to handle provate chat -->
        <ChatDialog
            :showDialog="openPrivateChat"
            @close-chat="closePrivateChat()">
        </ChatDialog>
    </md-app>
    </div>
</template>

<script>
import UserList from './../components/UserList'
import ChatArea from './../components/ChatArea'
import MessageArea from './../components/MessageArea'
import ChatDialog from './../components/ChatDialog'
import { url, STORE_ACTIONS, WS_EVENTS } from './../utils/config'

export default {
    name: 'chat',
    components: { 
        UserList,
        ChatArea,
        MessageArea,
        ChatDialog
    },
    // event listeners for server
    sockets: {
        newMessage: function({ message, username }) {
            if(message.replace(/\s/g, "").length === 0) return // no empty messages
            const isMe = this.$store.state.username === username
            const msg = isMe ? `${message}` : {username, message}
            this.messages.push({ msg, isMe })
        },
        newUser: function({ users, username }) {
            const isMe = this.$store.state.username === username
            if(!isMe) {
                if(users.length > this.users.length) {
                    this.messages.push({ join: true, msg: `${username} has joined the room` })
                } else if (users.length < this.users.length) {
                    this.messages.push({ join: true, msg: `${username} has left the room` })
                }
            }

            this.users.length = 0
            this.users = users
        },
        privateChat: function({ username, to }) {
            const isForMe = this.$store.state.username === to
            if(isForMe && !this.openPrivateChat.chat) {
                // join private room
                this.$socket.emit(WS_EVENTS.joinPrivateRoom, {
                    to: this.$store.state.username,
                    room: null,
                    username
                })
            }
        },
        privateMessage: function({ privateMessage, to, from, room }) {
            console.log(`New private message from ${from} in room ${room}`)

            const isObj = typeof privateMessage === 'object'
            const isForMe = this.$store.state.username === to
            const isFromMe = this.$store.state.username === from

            if(isObj && isFromMe) return false

            // open private chat with info
            if(!this.openPrivateChat.chat) {
                this.openPrivateChat = {
                    ...this.openPrivateChat,
                    chat: true,
                    user: from,
                    room: room
                }
            }

            const msgObj = {
                msg: isObj ? privateMessage.msg : privateMessage,
                isMe: !isForMe
            }
            this.openPrivateChat.msg.push(msgObj)
        },
        leavePrivateRoom: function({ privateMessage, from }) {
            if((from === this.openPrivateChat.user || from === this.$store.state.username) && this.openPrivateChat.chat) {
                this.openPrivateChat.msg.push({ msg: privateMessage })
                this.openPrivateChat = { ...this.openPrivateChat, closed: true }
            }
        },
        leaveChat: function({ users, username}) {
            this.messages.push({ join: true, msg: `${username} has left the room`})
            this.users.length = 0
            this.users = users

            if(username === this.$store.state.username) {
                this.$store.dispatch(STORE_ACTIONS.leaveChat).then(() => {
                    this.$router.push("/")
                })
            }
        }
    },
    beforeCreate: function() {
        this.$socket.emit(WS_EVENTS.joinRoom, this.$store.state) // join room
    },
    // chat data
    data: function(){
        return {
            room: this.$store.state.room,
            users: [],
            message: [],
            openPrivateChat: {
                chat: false,
                user: null,
                msg: [],
                room: null,
                closed: false
            }
        }
    },
    methods: {
        sendMessage(msg) {
            // send new public message
            this.$socket.emit(WS_EVENTS.publicMessage, {
                ...this.$store.state,
                message: msg
            })
        },
        onChangeRoom(val) {
            if(this.$store.state.room !== val) {
                this.$socket.emit(WS_EVENTS.leaveRoom, this.$store.state)
                this.$store.dispatch(STORE_ACTIONS.changeRoom, val)
                this.message.length = 0
                this.$socket.emit(WS_EVENTS.joinRoom, this.$store.state)
            }
        },
        openChat(user) {
            this.openPrivateChat = {
                ...this.openPrivateChat,
                chat: true,
                user: user,
                room: user // room is username you are chatting with
            }
        },
        closePrivateChat() {
            // leavePrivateRoom emit
            this.$socket.emit(WS_EVENTS.leavePrivateRoom, {
                room: this.$store.state.room,
                to: this.openPrivateChat.room,
                from: this.$store.state.username
            })

            this.openPrivateChat = {
                ...this.openPrivateChat,
                chat: false,
                closed: false,
                user: null,
                msg: [],
                room: null
            }
        },
        async logout() {
            try {
                let response = await this.$http.post(`http://${url}/auth/logout`, {
                    username: this.$store.state.username
                })
                if(response.body.code === 200) {
                    this.$socket.emit(WS_EVENTS.leaveChat, {
                        room: this.$store.state.room,
                        username: this.$store.state.username
                    })
                }
            } catch (error) {
                console.log(error)
            }
        }
    }
}
</script>

<style lang="scss">
@import "./../styles/variables"

</style>
