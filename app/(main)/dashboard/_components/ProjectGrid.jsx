"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProjectCard from "./ProjectCard";
import { Edit, FolderOpenIcon, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ShowFolderDrawer from "./ShowFolderDrawer";

export function ProjectGrid({ projects, folders }) {
  const [showFolder, setShowFolder] = useState(false)
  const [folderInfo, setFolderInfo] = useState({
    name: "",
    id: ""
  })


  const individualProjects = projects.filter((project) => project.folderId === null)
  const folderProjects = projects.filter((project) => project.folderId !== null)

  const router = useRouter();

  const handleEditProject = (projectId) => {
    router.push(`/editor/${projectId}`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {folders && folders.length > 0 && (

          <>
            <h2 className="text-2xl text-white">Your Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {folders.map((folder) => (
                <div
                  key={folder._id}
                >
                  <Button variant={"outline"} size={"lg"} onClick={() => {
                    setShowFolder(true)
                    setFolderInfo({
                      name: folder.name,
                      id: folder._id
                    })
                  }} className={""}>
                    <FolderOpenIcon className="h-4 w-4" />
                    {folder.name}
                  </Button>
                </div>
              ))}

            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        {
          individualProjects && individualProjects.length > 0 && (
            <>
              <h2 className="text-2xl text-white">Your Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {individualProjects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    onEdit={() => handleEditProject(project._id)}
                  />
                ))}
              </div>
            </>
          )
        }
      </div>

      <ShowFolderDrawer folderProjects={folderProjects} folderInfo={folderInfo} isOpen={showFolder} onClose={() => setShowFolder(false)} />

    </div>

  );
}

export default ProjectGrid