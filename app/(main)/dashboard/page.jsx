"use client"
import React, { useState } from 'react'
import { api } from '@/convex/_generated/api'
import { useConvexQuery } from '@/hooks/use-convex-qurey'
import { Button } from '@/components/ui/button'
import { FolderOpen, Plus, Sparkle, Sparkles } from 'lucide-react'
import { BarLoader } from 'react-spinners'
import NewProjectModal from './_components/NewProjectModal'
import ProjectGrid from './_components/ProjectGrid'
import NewCollectionModal from './_components/NewCollectionModal'

const DashboardPage = () => {
  const { data: projects, isLoading } = useConvexQuery(api.projects.getUserProjects)

  const { data: folders, isLoading: isFolderLoading } = useConvexQuery(api.folders.getUserFolders)

  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showCollectionModal, setShowCollectionModal] = useState(false)

  return (
    <div className='min-h-screen pt-32 mb-16'>
      <div className='container mx-auto px-6'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Your Collections & Projects
            </h1>
            <p className="text-white/70">
              Create and manage your AI-powered image designs. <br /> You can create an individual project or collection of different projects.
            </p>
          </div>

          <div className='space-y-2 grid grid-cols'>
            <Button onClick={() => setShowCollectionModal(true)} variant={"outline"} className={"gap-2"} size={"lg"}>
              <FolderOpen className='h-5 w-5' />
              Create Collection
            </Button>
            {
              (projects.length > 0 || folders.length) > 0 && (
                <Button onClick={() => setShowNewProjectModal(true)} variant={"primary"} className={"gap-2"} >
                  <Sparkles className='h-5 w-5' />
                  Create Project
                </Button>
              )
            }
          </div>
        </div>
        {
          isLoading || isFolderLoading ? <BarLoader width={"100%"} color='white' /> :
            folders.length > 0 || projects.length > 0 ? (
              <>
                <ProjectGrid projects={projects} folders={folders} />
              </>
            ) : (
              <div className='flex flex-col items-center justify-center py-20 text-center'>
                <h2 className='text-2xl font-semibold text-white mb-3'>
                  Create Your First Project
                </h2>
                <p className="text-white/70 mb-8 max-w-md">
                  Upload an image to start editing with our powerful AI tools
                </p>

                <Button onClick={() => setShowNewProjectModal(true)} variant={"primary"} className={"gap-2"} size={"xl"}>
                  <Sparkles className='h-5 w-5' />
                  Start Creating
                </Button>

              </div>
            )
        }

        <NewProjectModal isOpen={showNewProjectModal} onClose={() => setShowNewProjectModal(false)} />
        <NewCollectionModal isOpen={showCollectionModal} onClose={() => setShowCollectionModal(false)} />

      </div>
    </div>
  )
}

export default DashboardPage
