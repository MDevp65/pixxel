"use client"
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { api } from '@/convex/_generated/api'
import { useConvexMutation } from '@/hooks/use-convex-qurey'
import { FolderClosedIcon, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

const NewCollectionModal = ({ isOpen, onClose }) => {
    const { isLoading, mutate: createCollection, error } = useConvexMutation(api.folders.createFolder)
    const [colName, setColName] = useState("")

    const handleClose = () => {
        onClose()
        setColName("")
    }

    const handleCreateCollection = async () => {
        if (!colName.trim()) {
            toast.error("Please enter a collection name")
            return
        }

        try {
            // create folder in convex
            await createCollection({
                name: colName,
            })

            toast.success("Folder Created Successfully!")
            handleClose()
        } catch (error) {
            console.error("Error Creating Collection: ", error);
            toast.error(error.message || 'Failed to create Collection. Plz try again')
        } 
    }

    return (
        <>

            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-2xl bg-slate-800 border-white/10">
                    <DialogHeader>
                        <DialogTitle className={"text-2xl font-bold text-white"}>Create a new Collection</DialogTitle>
                    </DialogHeader>

                    <div className='space-y-6'>
                        <Input value={colName}
                            onChange={(e) => setColName(e.target.value)}
                            placeholder="Enter Collection Name"
                            className="flex-1 bg-slate-700 border-white/20 text-white"
                        />
                        <Button 
                            variant={"ghost"}
                            className={"w-full"}
                            onClick={handleCreateCollection}
                            disabled={isLoading || !colName.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                    Creating...
                                </>
                            ):(
                                <>
                                    <FolderClosedIcon className='h-4 w-4 mr-2' />
                                    Create Collection
                                </>
                            )}
                            Create Collection
                        </Button>
                    </div>

                    <DialogFooter className="gap-3">
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                restrictedTool="projects"
                reason="Free plan is limited to 3 projects. Upgrade to Pro for unlimited projects and access to all AI editing tools."
            /> */}
        </>
    )
}

export default NewCollectionModal
