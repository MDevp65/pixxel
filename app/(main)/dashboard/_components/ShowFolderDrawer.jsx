import React, { useState } from "react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import NewProjectModal from "./NewProjectModal";
import ProjectCard from "./ProjectCard";
import { useRouter } from "next/navigation";
import { useConvexMutation } from "@/hooks/use-convex-qurey";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const ShowFolderDrawer = ({ folderProjects, folderInfo, isOpen, onClose }) => {
    const [createProj, setCreateProj] = useState(false);
    const router = useRouter();

    const projects = folderProjects.filter(
        (project) => project.folderId === folderInfo?.id
    );

    const handleEditProject = (projectId) => {
        router.push(`/editor/${projectId}`);
    };

    const { mutate: deleteFolder, isLoading } = useConvexMutation(
        api.folders.deleteFolder
    );

    const handleFolderDel = async () => {
        const confirmed = confirm(
            `Are you sure you want to delete "${folderInfo?.name}"? This action cannot be undone and all of the projects related to this folder will be deleted.`
        );

        if (confirmed) {
            try {
                await deleteFolder({ folderId: folderInfo?.id });
                onClose()
                toast.success("Folder deleted successfully");
            } catch (error) {
                console.error("Error deleting folder:", error);
                toast.error("Failed to delete folder. Please try again.");
            }
        }
    };

    return (
        <>
            <Drawer open={isOpen} onOpenChange={() => onClose()}>
                <DrawerContent className="bg-slate-900">
                    <DrawerHeader className="px-6 pt-6 pb-4">
                        <DrawerTitle>
                            <h2 className="text-3xl font-semibold text-white">{folderInfo?.name}</h2>
                        </DrawerTitle>
                        <div className="flex justify-between items-center gap-2 mt-2">
                            <Button
                                onClick={() => setCreateProj(true)}
                                variant="outline"
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Create Project
                            </Button>
                            <Button
                                onClick={handleFolderDel}
                                disabled={isLoading}
                                variant="glass"
                                size="sm"
                                className="gap-2 text-red-400 hover:text-red-300"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Folder
                            </Button>
                        </div>
                    </DrawerHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 mb-6">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                onEdit={() => handleEditProject(project._id)}
                            />
                        ))}
                    </div>
                </DrawerContent>
            </Drawer>

            <NewProjectModal
                isOpen={createProj}
                onClose={() => setCreateProj(false)}
                folderId={folderInfo.id}
            />
        </>
    );
};

export default ShowFolderDrawer