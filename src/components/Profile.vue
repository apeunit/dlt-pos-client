<template>
  <div class="about">
    <go-back>Back</go-back>
    <div class="bg-black text-white pb-8 pt-24">
      <div class="container flex flex-col px-4 text-28 font-sans leading-normal">
        <template v-if="isBalanceLoading">Getting balance...</template>
        <template v-else>
          <h1>{{ balance | formatUnit }}</h1>
          <span>Ape Coins</span>
        </template>
      </div>
    </div>
    <div class="container flex flex-wrap px-4 leading-normal pt-8 pb-8">

      <div class="list-reset w-full">
        <a :href='getTransactionURL' target="_blank" class="text-2xl font-sans flex justify-between no-underline text-black">
          <span>
            My Transactions
          </span>
          <ArrowRight />
        </a>
        <div class="mt-8 text-2xl font-sans flex flex-wrap flex-col justify-between no-underline text-black">
          <span>
            Identicon
          </span>
          <ae-identity-avatar class="w-6 h-6" :address="address"></ae-identity-avatar>

          <span class="mt-6">
            Unique Name
          </span>
          <p class="font-mono">
          {{ getUserName }}
          </p>
          <p class="text-base font-sans mt-4">
            We assigned a unique name to your pub key to make it easier for others to interact with you.
            Your identicon is a visual representation of your public key. I helps you to ensure the right public key is used in transactions.
          </p>
          <p class="text-base italic mt-4">
            Wir haben Dir einen einzigartigen Namen zugewiesen, damit andere Blockchain User einfacher mit Dir interagieren können.
            Dein Identicon ist eine visuelle Darstellung Deines Public Key. Er hilft Dir sicher zu stellen, dass bei Transaktionen der richtige Public Key verwendet wird.
          </p>
        </div>
        <div class="mt-8 mb-8 text-2xl font-sans flex flex-wrap flex-col justify-between no-underline text-black">
          <span>
            My Public Key
          </span>
          <ul class="app-address list-reset">
            <li class="font-mono" v-for="(chunk, index) in splitAddress" :key="index">
              {{ chunk }}
            </li>
          </ul>
          <p class="text-base font-sans mt-4">
            You can imagine your public key as the address of your account. It's not easy to read and write for humans. Therefore assigned a human friendly uniqe name to your public key.
          </p>
          <p class="text-base italic mt-4">
            Man kann sich den Public Key wie eine Adresse zu Deinem Account vorstellen. Da er für uns Menschen schwer zu lesen und schreiben ist, haben wir Deiner Adresse einen eindeutigen Namen zugeordnet.
          </p>
        </div>
        <!-- <div class="mt-8 mb-8 text-2xl font-sans flex flex-wrap flex-col justify-between">
          <a @click.prevent="resetStorage" class="text-black" href="#">Reset message history</a>
        </div> -->
      </div>

    </div>
  </div>
</template>
<script>
import ArrowRight from './ArrowRight.vue'
import GoBack from './GoBack.vue'
import formatUnit from '../filters'
import { AeIdentityAvatar } from '@aeternity/aepp-components'

export default {
  name: 'About',
  components: {
    ArrowRight,
    GoBack,
    AeIdentityAvatar
  },
  filters: {
    formatUnit
  },
  data () {
    return {
      address: this.$store.state.account.pub,
      transactionURL: this.$store.state.explorer
    }
  },
  computed: {
    splitAddress () {
      let i = this.address.length % 2;
      let parts = i ? [ this.address.substr( 0, i ) ] : [];
      for( ; i < this.address.length ; i += 3 )
      {
          parts.push( this.address.substr( i, 3 ) );
      }
      return parts
    },
    getTransactionURL () {
       if(!this.$store.state.account.pub || this.$store.state.account.pub === 'burned' || this.$store.state.account.pub === 'seeyou') {
         return this.transactionURL
       }
       return  this.transactionURL + '/' + this.address
    },
    balance () {
      return this.$store.state.balance
    },
    isBalanceLoading () {
      return this.$store.state.isBalanceLoading
    },
    getUserName () {
       return this.$store.state.account.name
    }
  },
  methods: {
    resetStorage () {
      window.localStorage.removeItem('vuex')
    }
  },
  mounted () {
    window.scrollTo(0, 0)
  }
}
</script>
<style lang="css">
.app-address {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
}
</style>
