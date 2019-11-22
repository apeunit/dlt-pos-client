<template>
  <div id="app" class="relative h-screen">
    <router-view name="header" />
    <router-view class="h-full overflow-x-hidden" />
    <Modal>

    </Modal>
  </div>
</template>
<script>
import Modal from './sections/Modal.vue'
import {generateKeyPair, isValidKeypair} from "@aeternity/aepp-sdk/es/utils/crypto";
import {decode} from "@aeternity/aepp-sdk/es/tx/builder/helpers";

export default {
  name: 'app',
  components: {
    Modal
  },
  computed: {
    account () {
      return this.$store.state.account
    }
  },
  methods: {
      getAddressFromUrl () {
          let isValid = false
          const { p,k } = this.$route.query
          if (!p || !k) return
          try {
              isValid = !isValidKeypair(Buffer.from(p, 'hex'), decode(k))
          } catch (e) {
              isValid = false
          }
          if (!isValid) {
              alert('Provided Key Pair is invalid. We generate new one for you.')
              return
          }
          return { pub: k, priv: p}
      },
      async generateAndTopUpAccount () {
        const { secretKey, publicKey } = generateKeyPair()
        await fetch('https://testnet.faucet.aepps.com/account/' + publicKey, {
            method: 'post'
        })
        return { pub: publicKey, priv: secretKey }
      }
  },
  async mounted () {
      this.$store.commit('setBarState', 'open');
    // update balance after 5sec (wait for 'initAe' in store)
    setTimeout(async () => {
        const acc = (await this.getAddressFromUrl()) || (await this.generateAndTopUpAccount())
        await this.$store.commit('setAccount', { ...acc, name: 'customerAccount' });
        this.$store.dispatch('updateBalance')
    }, 5000);
    // update balance every 10sec (poll)
    setInterval(() => {
      this.$store.dispatch('updateBalance')
    }, 10000)
  }
}
</script>
<style lang="css"></style>
