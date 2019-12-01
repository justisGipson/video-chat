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
export default {
    name: 'chat',
    components: { UserList, ChatArea, MessageArea, ChatDialog },
    // event listeners for server
    sockets: {
        newMessage: function({ message, username }) {
            if(message.replace(/\s/g, "").length === 0) return // no empty messages
            const isMe = this.$store.state.username === username
            const msg = isMe ? `${message}` : {username, message}
            this.messages.push({ msg, isMe })
        },
        newUser: function({ users, username }) {

        },
        privateChat: function({ username, to }) {

        },
        privateMessage: function({ privateMessage, to, from, room }) {

        },
        leavePrivateRoom: function({ privateMessage, from }) {

        },
        leaveChat: function({ users, username}) {

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
        onChangeRoom() {

        },
        openChat() {

        },
        closePrivateChat() {

        },
        logout() {

        }
    }
}
</script>
