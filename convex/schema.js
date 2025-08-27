import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'


export default defineSchema({

    // user table
    users: defineTable({
        name: v.string(),
        email: v.string(),
        imageUrl: v.optional(v.string()),
        tokenIdentifier: v.string(),

        plan: v.union(v.literal("free"), v.literal("pro")),

        // usage tracking for plan limit
        projectsUsed: v.number(),
        exportsThisMonth: v.number(),

        createdAt: v.number(),
        lastActiveAt: v.number()
    }).index("by_token", ["tokenIdentifier"])
        .index("by_email", ['email'])
        .searchIndex("search_name", { searchField: "name" })
        .searchIndex("search_email", { searchField: "email" }),

    // project table
    projects: defineTable({
        // basic project info
        title: v.string(),
        userId: v.id("users"),

        // canvas dimension and state
        canvasState: v.any(),   // Fabric.js canvas JSON (objects, layers, etc)
        width: v.number(),  // in pixel
        height: v.number(), // in pixel

        // image pipeline - track image transformation
        originalImageUrl: v.optional(v.string()),   // initial uploaded image
        currentImageUrl: v.optional(v.string()),    // current processed image
        thumbnailUrl: v.optional(v.string()),  // HW - small preview for dashboard

        // ImageKit transformation state
        activeTransformations: v.optional(v.string()),  // current imagekit url params

        // AI features state - track what ai processing has been applied
        backgroundRemoved: v.optional(v.boolean()), // has background been removed

        // organization
        folderId: v.optional(v.id("folders")),

        // timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_user", ["userId"])
        .index("by_user_updated", ["userId", "updatedAt"])
        .index("by_folder", ["folderId"]),

    // folders table
    folders: defineTable({
        name: v.string(),
        userId: v.id("users"),
        createdAt: v.number()
    }).index("by_user", ["userId"]),

})

/*
PLAN LIMITS EXAMPLE:
- FREE: 3 projects, 20 exports/month, basic feature only
- PAID: unlimited projects/exports and all ai features
*/