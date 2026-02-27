const { env } = require("../utils/env");

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Food App Backend API",
    version: "1.0.0",
    description: "A simple food app backend with users, restaurants, menu items, and orders."
  },
  servers: [
    {
      url: `http://${env.HOST}:${env.PORT}`,
      description: "Local/dev"
    }
  ],
  tags: [
    { name: "Health", description: "Service health endpoints" },
    { name: "Users", description: "User management" },
    { name: "Restaurants", description: "Restaurant management" },
    { name: "MenuItems", description: "Menu item management" },
    { name: "Orders", description: "Order management" }
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "OK"
          }
        }
      }
    },
    "/api/users": {
      get: { tags: ["Users"], summary: "List users", responses: { 200: { description: "OK" } } },
      post: { tags: ["Users"], summary: "Create user", responses: { 201: { description: "Created" } } }
    },
    "/api/users/{id}": {
      get: { tags: ["Users"], summary: "Get user", responses: { 200: { description: "OK" }, 404: { description: "Not found" } } },
      put: { tags: ["Users"], summary: "Update user", responses: { 200: { description: "OK" }, 404: { description: "Not found" } } },
      delete: { tags: ["Users"], summary: "Delete user", responses: { 204: { description: "No content" }, 404: { description: "Not found" } } }
    },
    "/api/restaurants": {
      get: { tags: ["Restaurants"], summary: "List restaurants", responses: { 200: { description: "OK" } } },
      post: { tags: ["Restaurants"], summary: "Create restaurant", responses: { 201: { description: "Created" } } }
    },
    "/api/restaurants/{id}": {
      get: { tags: ["Restaurants"], summary: "Get restaurant", responses: { 200: { description: "OK" }, 404: { description: "Not found" } } },
      put: { tags: ["Restaurants"], summary: "Update restaurant", responses: { 200: { description: "OK" }, 404: { description: "Not found" } } },
      delete: { tags: ["Restaurants"], summary: "Delete restaurant", responses: { 204: { description: "No content" }, 404: { description: "Not found" } } }
    },
    "/api/menu-items": {
      get: { tags: ["MenuItems"], summary: "List menu items", responses: { 200: { description: "OK" } } },
      post: { tags: ["MenuItems"], summary: "Create menu item", responses: { 201: { description: "Created" } } }
    },
    "/api/menu-items/{id}": {
      get: { tags: ["MenuItems"], summary: "Get menu item", responses: { 200: { description: "OK" }, 404: { description: "Not found" } } },
      put: { tags: ["MenuItems"], summary: "Update menu item", responses: { 200: { description: "OK" }, 404: { description: "Not found" } } },
      delete: { tags: ["MenuItems"], summary: "Delete menu item", responses: { 204: { description: "No content" }, 404: { description: "Not found" } } }
    },
    "/api/orders": {
      get: { tags: ["Orders"], summary: "List orders", responses: { 200: { description: "OK" } } },
      post: { tags: ["Orders"], summary: "Create order", responses: { 201: { description: "Created" } } }
    },
    "/api/orders/{id}": {
      get: { tags: ["Orders"], summary: "Get order", responses: { 200: { description: "OK" }, 404: { description: "Not found" } } },
      put: { tags: ["Orders"], summary: "Update order status", responses: { 200: { description: "OK" }, 404: { description: "Not found" } } },
      delete: { tags: ["Orders"], summary: "Delete order", responses: { 204: { description: "No content" }, 404: { description: "Not found" } } }
    }
  }
};

module.exports = { openApiSpec };
