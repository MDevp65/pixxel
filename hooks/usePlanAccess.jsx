"use client"

import { useAuth } from "@clerk/nextjs"

export const usePlanAccess = () => {
    const { has } = useAuth()

    const isPro = has?.({plan: 'pro'}) || false
    const isFree = !isPro

    const planAccess = {
        // free plan tools
        resize: true,
        crop: true,
        adjust: true,
        text: true,

        // pro plan tools
        background: isPro,
        ai_extender: isPro,
        ai_edit: isPro,
    }

    // helper function to check if user has access to a specific tool
    const hasAccess = (toolId) => {
        return planAccess[toolId] === true
    }

    const getRestrictedTools = () => {
        return Object.entries(planAccess)
        .filter(([_, hasAccess]) => !hasAccess)
        .map(([toolId]) => toolId)
    }

    const canCreateProject = (currentProjectCount) => {
        if(isPro) return true;
        return currentProjectCount < 3
    }

    const canExport = (currentExportThisMonth) => {
        if(isPro) return true
        return currentExportThisMonth < 20
    }

    return {
        userPlan: isPro ? "pro" : "free_user",
        isPro,
        isFree,
        hasAccess,
        planAccess,
        getRestrictedTools,
        canCreateProject,
        canExport,
    }
}
