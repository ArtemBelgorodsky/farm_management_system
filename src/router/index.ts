import { createRouter, createWebHistory } from "vue-router"
const DashboardLayout = () => import("@/layouts/DashboardLayout.vue")

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: DashboardLayout,
      children: [
        {
          path: "",
          name: "dashboard",
          component: () => import("@/views/DashboardView.vue"),
        },
        {
          path: "farmers",
          name: "farmers",
          component: () => import("@/views/FarmersView.vue"),
        },
        {
          path: "fields",
          name: "fields",
          component: () => import("@/views/FieldsView.vue"),
        },
        {
          path: "field/:id",
          name: "field-detail",
          component: () => import("@/views/FieldDetailView.vue"),
        },
        {
          path: "analytics",
          name: "analytics",
          component: () => import("@/views/AnalyticsView.vue"),
        },
        {
          path: "recommendations",
          name: "recommendations",
          component: () => import("@/views/RecommendationsView.vue"),
        },
      ],
    },
  ],
})

export default router
