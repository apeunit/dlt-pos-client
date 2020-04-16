<template>
  <div class="app-modal-backdrop" :class="[{ open }]">
    <div class="app-modal">
      <header>
        <button @click.prevent="close" class="app-modal-close" type="button">
          <svg width="15px" height="14px" viewBox="0 0 15 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g id="App" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" font-family="NeufileGrotesk-MediumExtended, Neufile Grotesk" font-size="24" font-style="expanded" font-weight="500">
              <g id="icecream-transfer-3" transform="translate(-330.000000, -433.000000)" fill="#FFFFFF">
                <text id="×">
                  <tspan x="329.32" y="447">×</tspan>
                </text>
              </g>
            </g>
          </svg>
        </button>
      </header>
      <div>
        <span v-if="showError" style="color:#DC143C">
        {{ error }}
      </span>
      </div>
      <div class="flex justify-between items-center mb-8">
        <input class="app-modal-input text-white h-12 text-2xl bg-transparent w-2/3" v-model="accountName" type="text" placeholder="Name/Address">
        <button class="app-modal-button w-1/3 h-12 py-4" @click="checkAddress">
          Go
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Modal',
  data () {
    return {
      accountName: '',
      error: 'Name not found Or Invalid address',
      showError: false
    }
  },
  computed: {
    open () {
      this.accountName = ''
      return this.$store.state.modalOpened
    },
    account () {
      return '';
    },
    chatMessagesList () {
      return this.$store.getters.chatMessagesList
    }
  },
  methods: {
    close () {
      this.accountName = ''
      this.showError = false
      this.$store.commit('setModalOpened', false)
    },
    async checkAddress () {
      let isAddr = false;
      if(this.accountName && this.accountName != '') {
        let receiver = null
        if(this.isValidAddress(this.accountName)) {
          receiver = this.accountName
          const chunked = this.chunked(receiver)
          this.accountName = `${chunked[0]}${chunked[1]}${chunked[2]}...${chunked[chunked.length-1]}`
          isAddr = true
        } else {
          receiver = await this.$store.dispatch('getPubkeyByName', { name: this.accountName })
        }
        if(receiver){
          this.showError = false
          this.$store.commit('setScanQR', receiver)
          let message = Object.assign({}, this.chatMessagesList[this.$i18n.locale].find(o => o.id === 'transfer-input-user'))
          message.content = message.content.replace('xxx', this.accountName)
          if(isAddr) {
            message.content = message.content.replace('user', 'address')
          }
          this.$store.commit('addMessage', { message, lang: this.$i18n.locale })
          this.close()
        } else {
          this.showError = true
        }
      }
    },
    isValidAddress (value) {
      const regex = /(ak_[1-9A-HJ-NP-Za-km-z]{48,51})/
      return regex.test(value)
    },
    chunked (address) {
      return address.match(/^\w{2}_|.{2}(?=.{47,48}$)|.{2,3}/g)
    }
  }
}
</script>
<style lang="css" scoped>
.app-modal-backdrop {
  @apply hidden;
  @apply fixed pin;
  @apply h-screen;
  @apply overflow-hidden;
  @apply z-50;

  background: rgba(0, 0, 0, 0.3);
}

.app-modal-backdrop.open {
  @apply block;
  @apply visible;
}

.app-modal {
  @apply flex flex-col;
  @apply absolute pin-b;
  @apply w-full pl-8 pr-8 pb-8;
  @apply bg-black;
}

.app-modal > header {
  @apply flex;
  @apply justify-between;
  @apply items-center;
}

.app-modal > header {
  @apply justify-end;
  @apply pt-4 pb-4;
}

.app-modal-close {
  @apply
  pt-3
  pl-5
  pr-5
  pb-3
  w-auto
  text-base
  tracking-wide
  cursor-pointer;

  outline: 0;
}

.app-modal-input {
  outline: 0;
}

.app-modal-input:focus,
.app-modal-input:hover {
  outline: 0;
}

.app-modal-input::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

.app-modal-button {
  outline: 0;
  @apply
  rounded-full
  font-sans
  pt-3
  pl-5
  pr-5
  pb-3
  w-auto
  text-base
  tracking-wide
  text-right
  cursor-pointer
  bg-white
  text-black
  border-2
  border-black;
}

.app-modal-button[disabled] {
  @apply text-grey-dark;
  @apply cursor-not-allowed;
}

.app-modal-identicon {
  @apply w-8 h-8 !important;
}

.error {

}
</style>
