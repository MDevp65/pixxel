import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { internal } from "./_generated/api";

export const createFolder = mutation({
    args: { name: v.string(), },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(internal.user.getCurrentUser);

        // Create the folder
        const newfolder = await ctx.db.insert("folders", {
            name: args.name,
            userId: user._id,
            createdAt: Date.now(),
        });

        return newfolder
    }
})

export const getUserFolders = query({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.user.getCurrentUser)

        const folders = await ctx.db
            .query("folders")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect()

        return folders;
    }
})

export const deleteFolder = mutation({
    args: { folderId: v.id("folders") },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(internal.user.getCurrentUser);

        const folder = await ctx.db.get(args.folderId);
        if (!folder) {
            throw new Error("Folder not found");
        }

        if (!user || folder.userId !== user._id) {
            throw new Error("Access denied");
        }

        const projects = await ctx.db
            .query("projects")
            .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
            .order("desc")
            .collect()

        // clear the folder
        for (const project of projects) {
            await ctx.db.delete(project._id);
        }

        // Delete the folder
        await ctx.db.delete(args.folderId);

        // Update user's project count
        await ctx.db.patch(user._id, {
            projectsUsed: Math.max(0, user.projectsUsed - projects.length),
            lastActiveAt: Date.now(),
        });

        return { success: true };
    },
});