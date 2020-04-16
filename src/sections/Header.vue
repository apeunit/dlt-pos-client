<template>
  <div class="header">
    <router-link class="header-logo" to="/about">
      Ape Unit
    </router-link>
    <router-link v-if="!hideProfile" class="header-account" to="/profile">
      <span v-if="isBalanceLoading">Getting balance...</span>
      <span v-else>{{ balance | formatUnit }} Ape Coins</span>
      <ae-identity-avatar
        class="w-4"
        :address="account.pub"
      />
    </router-link>
  </div>
</template>
<script>
import formatUnit from '../filters'

import { AeIdentityAvatar } from '@aeternity/aepp-components'

export default {
  name: 'Header',
  components: {
    AeIdentityAvatar
  },
  filters: {
    formatUnit
  },
  data () {
    return {
      address: this.$store.state.account.pub
    }
  },
  computed: {
    account () {
      return this.$store.state.account
    },
    printingMessages () {
      return this.$store.state.printingMessages
    },
    balance () {
      return this.$store.state.balance
    },
    isBalanceLoading () {
      return this.$store.state.isBalanceLoading
    },
    hideProfile () {
      return this.$store.state.account.pub === 'burned' || this.$store.state.account.pub === 'seeyou' || this.$store.state.account.pub == null
    }
  }
}
</script>
<style lang="css" scoped>
.header {
  @apply fixed pin-t;
  @apply flex items-center content-center justify-between;
  @apply pl-6 pr-6;
  @apply w-full;
  @apply bg-black;
  @apply z-30;

  height: 58px;
}

.header-logo {
  @apply text-white no-underline font-sans-medium;
}

.header-account {
  @apply text-right font-sans text-sm text-white no-underline;
  @apply cursor-pointer;
}

.header-account > span {
  @apply mr-2;
}

.header-account > canvas {
  @apply w-8 h-8 !important;
}
</style>
