<template>
  <div class="mb-6">

    <!-- Message Content -->
    <div class="app-message-enter" v-show="msg.content">
      <div class="app-spinner" v-if="msg.id === 'wait'">
        <div class="first"></div>
        <div class="second"></div>
        <div class="third"></div>
      </div>
      <template v-else-if="msg.id === 'show-userpub-qr' || msg.id === 'show-order-qr'">
        <qr-code user=""
          :qrcode="msg.content"
          :isOrder="(msg.id === 'show-order-qr')"
        />
      </template>
      <template v-else>
        <p class="font-sans-medium text-28" v-html="msg.content"></p>
        <p class="text-xs font-sans mt-2">{{ msg.time }}</p>
      </template>
    </div>

    <!-- Button Menu Layout -->
    <ul v-if="isLast" class="app-action-button">
      <li :key="key" v-for="(button, key) in msg.buttons">
        <span class="rounded-full px-10 py-3 font-sans w-auto text-base tracking-wide mt-2 text-right cursor-pointer float-right"
              :class="msgClass(button.type)"
              @click="executeBtnAction(button.action, button.type, button.params, $event)"
        >
          {{ button.title }}
        </span>
      </li>
    </ul>
  </div>
</template>
<script>
import formatUnit from '../filters'

import { sign, verify, decodeBase58Check } from '@aeternity/aepp-sdk/es/utils/crypto.js'
import { encode, decode } from '@aeternity/aepp-sdk/es/tx/builder/helpers.js'
import QrCode from './QrCode.vue'

export default {
  name: 'ChatMessage',
  components: {
    QrCode
  },
  props: [
    'msg',
    'isLast'
  ],
  computed: {
    chatMessagesList () {
      return this.$store.getters.chatMessagesList
    },
    chatHistory () {
      return this.$store.getters.chatHistory
    },
    costToCharge () {
      return this.$store.getters.costToCharge
    },
    chatStarted () {
      return this.$store.getters.chatStarted
    },
    userBalance () {
      return this.$store.getters.userBalance
    },
    barStatus () {
      return this.$store.getters.getBarStatus
    }
  },
  methods: {
    msgClass (type) {
      console.log(type)
      return {
        'bg-black text-white': type == 'message' || type == 'function',
        'bg-white text-black border-2 border-black': type == 'message-white'
      }
    },
    executeBtnAction (action, type, params, evt) {
      switch (type) {
        case 'message':
        case 'message-white':
          // send a Message
          console.log(`frrrrrrom`, this.chatMessagesList[this.$i18n.locale])
          const msg = this.chatMessagesList[this.$i18n.locale].find(o => o.id === action)
          this.sendMsg(msg, evt)
          break
        case 'function':
          // execute a Function (of this Component)
          console.log(`xecute ${action}`)
          this[action](params)
          break
      }

    },
    sendMsg (msg, evt) {
      this.$store.commit('addMessage', { message: msg, lang: this.$i18n.locale })
      // hide buttons
      evt.target.parentNode.classList.toggle('invisible')
    },
    wait (fn, par) {
      return new Promise((resolve) => {
        // wait 3s before calling fn(par)
        setTimeout(() => resolve(fn(par)), 2000)
      })
    },
    async sendNextMessage (msg) {

      if (msg.next) {
        // show waiting message
        this.playWaitMessage()
        // remove wait message and play next
        await this.wait(this.removeWaitMessage, { locale: this.$i18n.locale })
        // play next message (from computer)
        // console.log(`pick and play ID: ${msg.next}`)
        // console.log(`from`, this.chatMessagesList[this.$i18n.locale])
        const nextMsg = this.chatMessagesList[this.$i18n.locale].find(o => o.id === msg.next)
        // console.log(`NEXT:`, nextMsg)
        this.$store.commit('addMessage', { message: nextMsg, lang: this.$i18n.locale })
        // console.log('cleanNextMessages --- beforeDestroy chatMessage')
        this.$store.commit('cleanNextMessages')
      }
    },
    playWaitMessage () {
      const waitMsg = {
        id: 'wait',
        content: '...',
        from: 'computer-action' // or 'user'
      }
      this.$store.commit('addMessage', { message: waitMsg, lang: this.$i18n.locale })
    },
    removeWaitMessage ({ locale }) {
      this.$store.commit('removeMessage', { messageId: 'wait', lang: locale })
    },
    handleQRClicks (event) {
      if (event.target.tagName.toUpperCase() == 'IMG') {
        this.$store.commit('setQRData', event.target.src)
        // trigger modal to show here
      }
    },
    transferCoins (arg) {
      const message   = Object.assign({}, this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'transfer-user-message'))
      message.content = message.content.replace('xxx', arg)
      message.content = arg > 1 || isNaN(arg) ? message.content + 's' : message.content
      this.$store.commit('addMessage', { message, lang: this.$i18n.locale })

      let amount = isNaN(arg) ? ((Number(formatUnit(this.userBalance)) * this.$store.state.itemPrice) - this.$store.state.fee) : arg * this.$store.state.itemPrice
      amount     = amount < 0 ? 0 : amount
      if (this.userBalance >= (amount + this.$store.state.fee) && amount > 0) {
        this.$store.commit('setCostToCharge', amount)
        const msg = this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'transfer-type-choice')
        this.$store.commit('addMessage', { message: msg, lang: this.$i18n.locale })
      } else {
        const msg = this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'not-enough-balance-transfer')
        this.$store.commit('addMessage', { message: msg, lang: this.$i18n.locale })
      }
    },
    scanQR (arg) {
      if (arg == 'reset') {
        const message = Object.assign({}, this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'select-qr-scan'))
        this.$store.commit('addMessage', { message, lang: this.$i18n.locale })
        this.$router.push({ path: `/scan` })
      } else {
        const message = Object.assign({}, this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'select-qr-scan'))
        this.$store.commit('addMessage', { message, lang: this.$i18n.locale })
        this.$router.push({ path: `/scan` })
      }
    },
    searchAddrByName () {
      this.$store.commit('setModalOpened', true)
    },
    orderIceCream () {
      const message = this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'order')
      let messageId = 'question-order-answer'
      if(this.barStatus === 'out_of_goods') {
        messageId = 'out-of-goods'
      } else if(this.barStatus === 'closed') {
        messageId = 'closed'
      }
      message.next = messageId
      this.$store.commit('addMessage', { message, lang: this.$i18n.locale })
    },
    saveOrder (arg) {
      const order   = Object.assign({}, this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'show-order-details'))
      order.content = order.content.replace('xxx', arg)
      // order.content = arg > 1 ? order.content + 's' : order.content
      this.$store.commit('addMessage', { message: order, lang: this.$i18n.locale })

      const amount = arg * this.$store.state.itemPrice
      if (this.userBalance >= (amount + this.$store.state.fee)) {
        this.$store.commit('setCostToCharge', amount)
        const order2   = Object.assign({}, this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'show-order-details-2'))
        order2.content = order2.content.replace('xxx', formatUnit(amount))
        this.$store.commit('addMessage', { message: order2, lang: this.$i18n.locale })
      } else if (this.userBalance < (amount + this.$store.state.fee)) {
        const msg = this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'not-enough-balance')
        this.$store.commit('addMessage', { message: msg, lang: this.$i18n.locale })
      }
    },
    async orderItem () {
      // user response
      const yesMessage = this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'yes')
      this.$store.commit('addMessage', { message: yesMessage, lang: this.$i18n.locale })

      // computer messages
      const order1 = this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'post-order-message-1')
      this.$store.commit('addMessage', { message: order1, lang: this.$i18n.locale })

      const order2 = this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'post-order-message-2')
      this.$store.commit('addMessage', { message: order2, lang: this.$i18n.locale })
      const txHash    = await this.$store.dispatch('transfer', {
        amount: this.costToCharge,
        receiver: this.$store.state.barPubKey
      })

      if(!txHash) {
        const message = Object.assign({}, this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'transfer-failed'))
        this.$store.commit('addMessage', { message, lang: this.$i18n.locale })
        return
      }
      const dataURI   = await this.$store.dispatch('generateQRURI', { data: (txHash.hash + ' ' + this.signHash(txHash.hash, this.$store.state.account.priv)) })
      const img       = `<img class="order-qr" src="${dataURI}" alt="order" height="300" width="300">`
      // computer QR
      const txMessage = {
        'id': 'show-order-qr',
        'content': img,
        'from': 'computer',
        'time': null
      }
      const order3    = this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'post-order-message-3')
      const order4    = this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'post-order-message-4')
      this.$store.commit('addMessage', { message: order3, lang: this.$i18n.locale })
      this.$store.commit('addMessage', { message: order4, lang: this.$i18n.locale })
      this.$store.commit('addMessage', { message: txMessage, lang: this.$i18n.locale })

      const afterOrder = this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'question-main-2')
      this.$store.commit('addMessage', { message: afterOrder, lang: this.$i18n.locale })
    },
    getFreeCoin () {
      const message = Object.assign({}, this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'tweet'))
      const url     = this.$store.state.twitterBase + encodeURIComponent(message.content.replace('xxx', this.$store.state.account.pub).replace('yyy', this.$store.state.account.name))
      const win     = window.open(url, '_blank')
      win.focus()

      const postTweet = Object.assign({}, this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'post-tweet'))
      this.$store.commit('addMessage', { message: postTweet, lang: this.$i18n.locale })
    },
    async showQR (arg) {
      const qrShow = Object.assign({}, this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'show-my-qr'))
      this.$store.commit('addMessage', { message: qrShow, lang: this.$i18n.locale })

      const dataURI   = await this.$store.dispatch('generateQRURI', { data: this.$store.state.account.pub })
      const img       = `<img src="${dataURI}" alt="order" height="300" width="300">`
      const txMessage = {
        'id': 'show-userpub-qr',
        'content': img,
        'from': 'user',
        'next': 'question-main-2',
        'time': null
      }
      this.$store.commit('addMessage', { message: txMessage, lang: this.$i18n.locale })
    },
    chooseLang (lang) {
      this.$i18n.locale = lang
      this.$store.commit('setCurrentLang', lang)
      this.startConvo()
    },
    startConvo () {
      // start chat, by picking first message.
      const welcomePrinted = this.chatHistory[this.$i18n.locale].find(o => o.id === 'welcome-1')
      if (!this.chatStarted || !welcomePrinted) {
        const firstMsg = this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'welcome-1')
        this.$store.commit('addMessage', { message: firstMsg, lang: this.$i18n.locale })
        this.$store.commit('setChatStarted', true)
      }
    },
    signHash (txHash, privateKey) {
      const sig        = sign(decode(txHash), Buffer.from(privateKey, 'hex'))
      const encodedSig = encode(sig, 'sg')
      console.log('signHash encoded', encodedSig)
      return encodedSig
    },
    async triggerTransfer () {

      const yes = this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'yes')
      this.$store.commit('addMessage', { message: yes, lang: this.$i18n.locale })

      let txId = 'transfer-done'
      const tx = await this.$store.dispatch('transfer', { amount: this.costToCharge, receiver: this.$store.state.receiver })
      if(!tx) {
        txId = 'transfer-failed'
      }
      const message  = Object.assign({}, this.chatMessagesList[this.$i18n.locale].find(o => o.id === txId))
      this.$store.commit('setReceiver', null)
      this.$store.commit('addMessage', { message, lang: this.$i18n.locale })
    }
  },
  async mounted () {
    // send next message, if first message has a "next"
    this.sendNextMessage(this.msg)
    // console.log('Mounted: message component', this.msg)
    Array.from(document.getElementsByClassName('order-qr')).forEach((el) => {
      const elClone = el.cloneNode(true)
      elClone.addEventListener('click', this.handleQRClicks)
      el.parentNode.replaceChild(elClone, el)
    })
    const receiver = this.$store.getters.getScannedQR
    if (receiver) {
      const amount = formatUnit(this.costToCharge)
      this.$store.commit('setReceiver', receiver)
      const message  = Object.assign({}, this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'transfer-confirmation-1'))
      message.content = message.content.replace('xxx', amount)
      this.$store.commit('addMessage', { message, lang: this.$i18n.locale })
      this.$store.commit('setScanQR', null)
    }
  }
}
</script>
<style lang="css">
.location-chat-image {
  background-color: black
}

.app-message-enter {
  animation: slide-in-up 0.5s ease-out;
}

.app-action-button {
  @apply flex flex-col items-end justify-end;
  @apply list-reset;
  @apply pt-8;
  @apply mb-12;
  @apply overflow-visible;
}

.app-action-button > li {
  animation: zoom-in 0.3s;
}

.app-spinner {
  @apply flex items-center justify-start;
  @apply bg-white;
  @apply w-full h-8;
  @apply z-50;
}

.app-spinner > div {
  @apply w-3 h-3 bg-black;

  display: inline-block;
  border-radius: 100%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.app-spinner > .first {
  animation-delay: -0.32s;
}

.app-spinner > .second {
  animation-delay: -0.16s;
}
</style>
