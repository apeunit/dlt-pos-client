<template>
  <div class="app-qr-code" :class="[{ full }]" @click.capture="toggle">
    <div v-html="qrcode"></div>
    <div class="app-qr-code-content text-white mt-12">
      <h2 v-if="isOrder" class="mb-12">Get this scanned at our bar to get an Ice Cream</h2>
      <h2 v-else class="mb-12">Open 'Camera' and scan to transfer Ape Coins 💸</h2>
      <h3 v-if="!isOrder" class="mb-6">
        <ae-identity-avatar
          class="app-qr-code-identicon"
          :address="address"
        />
        {{ getUserName }}
      </h3>
      <ul v-if="!isOrder" class="app-address list-reset">
        <li class="font-mono font-base leading-loose" v-for="(chunk, index) in splitAddress" :key="index">
          {{ chunk }}
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { AeIdentityAvatar } from '@aeternity/aepp-components'

export default {
  name: 'QrCode',
  components: {
    AeIdentityAvatar
  },
  props: {
    qrcode: null,
    isOrder: false
  },
  data: function () {
    return { full: false }
  },
  computed: {
    address () {
      return this.$store.state.account.pub
    },
    splitAddress () {
      let i = this.address.length % 2;
      let parts = i ? [ this.address.substr( 0, i ) ] : [];
      for( ; i < this.address.length ; i += 3 )
      {
        parts.push( this.address.substr( i, 3 ) );
      }
      return parts
    },
    getUserName () {
      return this.$store.state.account.name
    }
  },
  methods: {
    toggle () {
      this.full = !this.full
    }
  }
}
</script>
<style scoped>
.app-qr-code {
  @apply inline-flex;
  @apply items-center justify-center;
  @apply bg-black;
  @apply border-4 border-black;
}

.app-qr-code-content {
  @apply text-left;

  display: none;
  visibility: hidden;
}

.app-qr-code.full {
  @apply flex flex-col;
  @apply items-center justify-start;
  @apply fixed pin;
  @apply bg-black;
  @apply text-white;
  @apply h-full w-full pt-20 pl-6 pr-6;
}

.app-qr-code.full > .app-qr-code-content {
  display: flex;
  flex-direction: column;
  visibility: visible;
}

.app-qr-code-identicon {
  @apply w-6 h-6 mr-2 !important;
}
</style>
