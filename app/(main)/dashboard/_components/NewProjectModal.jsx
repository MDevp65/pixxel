"use client"
import UpgradeModal from '@/components/custom/UpgradeModal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/convex/_generated/api'
import { useConvexMutation, useConvexQuery } from '@/hooks/use-convex-qurey'
import { usePlanAccess } from '@/hooks/usePlanAccess'
import { Crown, ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

const NewProjectModal = ({ isOpen, onClose, folderId = undefined }) => {
    const router = useRouter()

    const [isUploading, setIsUploading] = useState(false)
    const [projectTitle, setProjectTitle] = useState("")
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl ] = useState(null)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    const { isFree, canCreateProject } = usePlanAccess()

    const { data: projects } = useConvexQuery(api.projects.getUserProjects)
    const { mutate: createProject } = useConvexMutation(api.projects.createProj)

    const currentProjectCount = projects?.length || 0
    const canCreate = canCreateProject(currentProjectCount)

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0]
        // console.log(file)

        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))

            // Auto-generate title from filename
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            setProjectTitle(nameWithoutExt || "Untitled Project");
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
        },
        maxFiles: 1,
        maxSize: 20 * 1024 * 1024
    })

    const handleClose = () => {
        onClose()
        setSelectedFile(null)
        setPreviewUrl(null)
        setProjectTitle("")
        setIsUploading(false)
    }


    const handleCreateProject = async () => {
        if (!canCreate) {
            setShowUpgradeModal(true)
            return
        }
        if (!selectedFile || !projectTitle.trim()) {
            toast.error("Please Select an image and enter a project title")
            return
        }

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", selectedFile)
            formData.append("fileName", selectedFile.name)

            // api call for image upload in imagekit
            const uploadResponse = await fetch("/api/imagekit/upload", {
                method: "POST",
                body: formData
            })

            const uploadData = await uploadResponse.json()
            if (!uploadData.success) {
                throw new Error(uploadData.error || "Failed to Upload Image");

            }

            // create project in convex
            const projectId = await createProject({
                title: projectTitle.trim(),
                originalImageUrl: uploadData.url,
                currentImageUrl: uploadData.url,
                thumbnailUrl: uploadData.thumbnailUrl,
                width: uploadData.width || 800,
                height: uploadData.height || 600,
                canvasState: null,
                folderId: folderId || undefined
            })

            toast.success("Project Created Successfully!")
            // router.push(`/editor/${projectId}`)
            handleClose()
        } catch (error) {
            console.error("Error Creating project: ", error);
            toast.error(error.message || 'Failed to create project. Plz try again')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <>

            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-2xl bg-slate-800 border-white/10">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <DialogTitle className="text-2xl font-bold text-white">
                                    Create New Project
                                </DialogTitle>
                                {isFree && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-slate-700 text-white/70"
                                    >
                                        {currentProjectCount}/3 projects
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Project Limit Warning for Free Users */}
                        {isFree && currentProjectCount >= 2 && (
                            <Alert className="bg-amber-500/10 border-amber-500/20">
                                <Crown className="h-5 w-5 text-amber-400" />
                                <AlertDescription className="text-amber-300/80">
                                    <div className="font-semibold text-amber-400 mb-1">
                                        {currentProjectCount === 2
                                            ? "Last Free Project"
                                            : "Project Limit Reached"}
                                    </div>
                                    {currentProjectCount === 2
                                        ? "This will be your last free project. Upgrade to Pixxel Pro for unlimited projects."
                                        : "Free plan is limited to 3 projects. Upgrade to Pixxel Pro to create more projects."}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* File Upload Area */}
                        {!selectedFile ? (
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${isDragActive
                                    ? "border-cyan-400 bg-cyan-400/5"
                                    : "border-white/20 hover:border-white/40"
                                    } ${!canCreate ? "opacity-50 pointer-events-none" : ""}`}
                            >
                                <input {...getInputProps()} />
                                <Upload className="h-12 w-12 text-white/50 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {isDragActive ? "Drop your image here" : "Upload an Image"}
                                </h3>
                                <p className="text-white/70 mb-4">
                                    {canCreate
                                        ? "Drag and drop your image, or click to browse"
                                        : "Upgrade to Pro to create more projects"}
                                </p>
                                <p className="text-sm text-white/50">
                                    Supports PNG, JPG, WEBP up to 20MB
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Image Preview */}
                                <div className="relative">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-56 object-cover rounded-xl border border-white/10"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                            setProjectTitle("");
                                        }}
                                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Project Title Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="project-title" className="text-white">
                                        Project Title
                                    </Label>
                                    <Input
                                        id="project-title"
                                        type="text"
                                        value={projectTitle}
                                        onChange={(e) => setProjectTitle(e.target.value)}
                                        placeholder="Enter project name..."
                                        className="bg-slate-700 border-white/20 text-white placeholder-white/50 focus:border-cyan-400 focus:ring-cyan-400"
                                    />
                                </div>

                                {/* File Details */}
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <ImageIcon className="h-5 w-5 text-cyan-400" />
                                        <div>
                                            <p className="text-white font-medium">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-white/70 text-sm">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-3">
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            disabled={isUploading}
                            className="text-white/70 hover:text-white"
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleCreateProject}
                            disabled={!selectedFile || !projectTitle.trim() || isUploading}
                            variant="primary"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Project"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                restrictedTool="projects"
                reason="Free plan is limited to 3 projects. Upgrade to Pro for unlimited projects and access to all AI editing tools."
            />
        </>
    )
}

export default NewProjectModal
