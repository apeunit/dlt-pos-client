<template>
  <div class="app-chat-area" v-chat-scroll="{
    always: true,
    smooth: true,
    scrollonremoved: true
  }">
    <template v-if="account && account.pub">
      <ul class="list-reset">
        <li
          :class="msgClass(msg)"
          v-for="(msg, $index) in chatHistory[$i18n.locale]"
          :data-message-id="msg.id"
          :key="$index"
        >
          <chat-message
            :isLast="$index == chatHistory[$i18n.locale].length - 1"
            :msg="msg"
          />
        </li>
      </ul>
    </template>
    <router-link to="/about" class="h-full flex items-center justify-center text-black no-underline" v-else>
      <span>Loading...</span>
    </router-link>
  </div>
</template>
<script>
import ChatMessage from './ChatMessage.vue'

export default {
  name: 'ChatArea',
  components: {
    ChatMessage
  },
  computed: {
    account () {
      return this.$store.state.account
    },
    balance () {
      return this.$store.state.balance
    },
    chatMessagesList () {
      return this.$store.getters.chatMessagesList
    },
    chatHistory () {
      return this.$store.getters.chatHistory
    },
    chatStarted () {
      return this.$store.getters.chatStarted
    },
    burned () {
      return this.$store.getters.burned
    },
    eventEnded () {
      return this.$store.getters.eventEnded
    }
  },
  methods: {
    msgClass (msg) {
      return {
        'text-right': msg.from == 'user',
        'text-left': msg.from == 'computer',
        'text-left text-grey': msg.from == 'computer-action'
      }
    }
  },
  mounted () {
    const acc = localStorage.getItem('account')
    let account = {}
    if(acc) {
      account = JSON.parse(acc)
    }
    if(this.eventEnded || account.pub === 'seeyou') {
      this.$store.commit('resetChatHistory')
      setTimeout(()=>{
        const firstMsg = this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'bye-bye-1')
        this.$store.commit('addMessage', { message: firstMsg, lang: this.$i18n.locale })
      }, 1000)
    } else if(this.burned || account.pub === 'burned') {
      this.$store.commit('resetChatHistory')
      setTimeout(()=>{
        const intro = Object.assign({}, this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'intro'))
        delete intro.next
        this.$store.commit('addMessage', { message: intro, lang: this.$i18n.locale })

        let welcome = Object.assign({}, this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'welcome-2'))
        welcome.next = 'ape-coin-usage'
        this.$store.commit('addMessage', { message: welcome, lang: this.$i18n.locale })
      }, 1000)

    } else if (!this.chatStarted) {
      // print first message
      const firstMsg = this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'intro')
      this.$store.commit('addMessage', { message: firstMsg, lang: this.$i18n.locale })
      this.$store.commit('setChatStarted', true)

      // print the (first 2) messages in the other language (to have them ready when refreshing)
      if(this.$i18n.locale === 'en'){
        const firstMsgDe = this.chatMessagesList.de.find(o => o.id === 'intro')
        this.$store.commit('addMessage', { message: firstMsgDe, lang: "de" })
        const secondMsgDe = this.chatMessagesList.de.find(o => o.id === 'intro-2')
        this.$store.commit('addMessage', { message: secondMsgDe, lang: "de" })
      } else {
        const firstMsgEn = this.chatMessagesList.en.find(o => o.id === 'intro')
        this.$store.commit('addMessage', { message: firstMsgEn, lang: "en" })
        const secondMsgEn = this.chatMessagesList.en.find(o => o.id === 'intro-2')
        this.$store.commit('addMessage', { message: secondMsgEn, lang: "en" })
      }
    }
  },
  beforeDestroy () {
    // remove ".next" prop to already printed messages
    // so they won't re-printed when ChatMessage.vue gets mounted()
    // console.log('cleanNextMessages --- beforeDestroy chatArea')
    this.$store.commit('cleanNextMessages')
  }
}
</script>
<style lang="css">
.app-chat-area {
  @apply h-full w-full pt-20 pl-6 pr-6;
  @apply bg-white text-black;
  @apply overflow-x-hidden overflow-y-auto;
}
</style>
