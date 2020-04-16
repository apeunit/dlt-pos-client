/**
 * Libraries
 */
import Router from 'vue-router'

/**
 * Sections
 */
import Header from './sections/Header.vue'

/**
 * Views
 */
import ChatArea from './components/ChatArea.vue'
import Impressum from './components/Impressum.vue'
import About from './components/About.vue'
import Venue from './components/Venue.vue'
import Orders from './components/Orders.vue'
import Profile from './components/Profile.vue'
import Transactions from './components/Transactions.vue'
import Send from './components/Send.vue'

export default (store) => {
  const beforeEnter = (to, from, next) => {
    if (store.state.printingMessages) {
      next(false)
    } else {
      next()
    }
  }

  const routes = [
    {
      path: '/',
      name: 'ChatArea',
      props: route => ({
        query: route.query
      }),
      components: {
        header: Header,
        default: ChatArea
      }
    },
    {
      path: '/impressum',
      name: 'impressum',
      components: {
        header: Header,
        default: Impressum
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      beforeEnter: beforeEnter
    },
    {
      path: '/scan',
      name: 'scan',
      component: Send
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      beforeEnter: beforeEnter
    },
    {
      path: '/venue',
      name: 'venue',
      component: Venue
    },
    {
      path: '/orders',
      name: 'orders',
      components: {
        header: Header,
        default: Orders
      }
    },
    {
      path: '/transactions',
      name: 'transactions',
      components: {
        header: Header,
        default: Transactions
      }
    }
  ]

  const router = new Router({
    mode: 'history',
    routes
  })

  router.beforeEach(async (to, from, next) => {
    if (to.query.k === 'burned') {
      // if the address is burned, but it already belogn to this device (in the state/store),
      // then start the regular app
      if (store.state.account.pub && store.state.account.pub.startsWith('ak_')) {
        // console.log('HEREEEEEEEE', store.state.account.pub)
        next('/')
      } else {
        store.commit('setBurned', true)
        const account = {
          pub: to.query.k,
          priv: to.query.k,
          name: to.query.k
        }
        store.commit('setAccount', account)
        // console.log('GO TO:', to.name)
        next({
          name: to.name,
          query: null
        })
      }
    } else if (to.query.k === 'seeyou') {
      const account = {
        pub: to.query.k,
        priv: to.query.k,
        name: to.query.k
      }
      store.commit('setAccount', account)
      next({
        name: to.name,
        query: null
      })
    }
    const { p: pub, k: priv, n: name } = to.query
    if (pub && priv && name) {
      const account = { pub, priv, name }
      if (!store.state.account.pub || store.state.account.pub !== account.pub) {
        await store.dispatch('initAe')
        store.commit('setAccount', account)
      }
      // remove query params and keep on routing
      next({
        name: to.name,
        query: null
      })
    } else {
      next()
    }
  })
  return router
}
