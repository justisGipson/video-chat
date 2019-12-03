<template>
    <div class="message">
        <div v-for="msg in messages" :key="msg.msg" class="message_container">
            <p 
                v-if="!msg.join" 
                class="message_text" 
                :class="{ own: msg.isMe, other: !isMe }" 
                v-message="msg.msg"></p>
            <p v-if="msg.join" class="message_joined">{{ msg.msg }}</p>
        </div>
    </div>
</template>

<script>
import { max } from 'date-fns'
export default {
    name: "ChatArea",
    props: {
        messages: Array,
        maxMessageLength: Number,
        chatContainer: String
    },
    directives: {
        message: {
            bind: function(el, binding, vnode) {
                const isObj = typeof binding.value === 'object'
                let chunks
                const maxLength = vnode.context.maxMessageLength

                if(isObj) {
                    chunks = Math.ceil(binding.value.message.length / maxLength)
                    el.innerHtml = `<span style="font-weight: bold">${binding.value.username}</span>:${vnode.context.getChunkText(binding.value.message, maxLength, chunks)}`
                } else {
                    chunks = Math.ceil(binding.value.length / maxLength)
                    el.innerHtml = vnode.context.getChunkText(binding.value, maxLength, chunks)
                }
            }
        }
    },
    methods: {
        getChunkText(message, maxLength, index) {
            let newMessage = ''
            for(let i = 0; i < index; i++){
                const newChunk = message.slice(i*maxLength, maxLength*(i+1))
                if (i !== 0) newMessage += '<br>'
                newMessage += `<span> ${newChunk} </span>`
            }
            return newMessage
        }
    },
    watch: {
        message: function() {
            const chatArea = document.getElementsByClassName(this.chatContainer)[0]
            chatArea.scrollTop = chatArea.scrollHeight + 100
        }
    }
}
</script>

<style lang="scss">

</style>
