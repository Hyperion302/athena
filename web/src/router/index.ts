import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "@/views/Home.vue";
import AuthRedirect from "@/views/AuthRedirect.vue";
import Dashboard from "@/views/Dashboard.vue";
import ServerView from "@/views/Server.vue";
import ProposalView from "@/views/Proposal.vue";
import NewProposal from "@/views/NewProposal.vue";
import ProposalsView from "@/views/Proposals.vue";
import DocsView from "@/views/Docs.vue";
import store from "@/store";
import generateState from "@/util/generateState";

Vue.use(VueRouter);

// NOTE: Due to the way I check for
// auth before routing, all routes
// must have names
const routes: RouteConfig[] = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresAuth: false },
  },
  {
    path: "/authRedirect",
    name: "AuthRedirect",
    component: AuthRedirect,
    meta: { requiresAuth: false },
  },
  {
    path: "/servers/:server",
    name: "Server",
    component: ServerView,
    props: (route) => ({ serverID: route.params.server }),
    meta: { requiresAuth: true },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    props: {
      serverID: null,
    },
    meta: { requiresAuth: true },
  },
  {
    path: "/servers/:server/proposals/:proposal",
    name: "Proposal",
    component: ProposalView,
    props: (route) => ({
      serverID: route.params.server,
      proposalID: route.params.proposal,
    }),
    meta: { requiresAuth: true },
  },
  {
    path: "/newProposal",
    name: "NewProposal",
    component: NewProposal,
    meta: { requiresAuth: true },
  },
  {
    path: "/servers/:server/proposals",
    name: "Proposals",
    component: ProposalsView,
    props: (route) => ({
      serverID: route.params.server,
    }),
    meta: { requiresAuth: true },
  },
  {
    path: "/docs",
    name: "Docs",
    component: DocsView,
    meta: { requiresAuth: false }
  }
  // {
  //  path: '/about',
  //  name: 'About',
  //  // route level code-splitting
  //  // this generates a separate chunk (about.[hash].js) for this route
  //  // which is lazy-loaded when the route is visited.
  //  component: () =>
  //    import(/* webpackChunkName: "about" */ '../views/About.vue'),
  // },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

router.beforeEach((to, from, next) => {
  // Load tokens if not navigating from anywhere
  if (from.name == null) {
    store.dispatch("auth/loadTokens");
  }
  if (to.matched.some((record) => record.meta.requiresAuth) && !store.getters['auth/loggedIn']) {
    const loginURL = store.getters['auth/loginURL'];
    window.location.href = `${loginURL}&state=${generateState()}`;
  } else {
    next();
  }
});

export default router;
