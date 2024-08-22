// app/routes/buildings+/index.tsx

import { json, redirect, type ActionFunction, type LoaderFunction } from '@remix-run/node'
import { useActionData, useLoaderData, useNavigate, Form, useSubmit } from '@remix-run/react'
import { ArrowRight, PlusCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { createDefaultPillarsForBuilding } from '#app/models/building.server.js'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { prisma } from '../../utils/db.server'

type LoaderData = {
  buildings: Array<{ id: string; name: string; address: string }>
}

type ActionData = {
  errors?: {
    name?: string;
    address?: string;
  };
}

export const loader: LoaderFunction = async () => {
  const buildings = await prisma.building.findMany({
    select: { id: true, name: true, address: true },
  })
  console.log("Fetched buildings:", buildings);
  return json({ buildings })
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const name = formData.get("name");
    const address = formData.get("address");

    if (typeof name !== "string" || name.length === 0) {
      return json<ActionData>(
        { errors: { name: "Name is required" } },
        { status: 400 }
      );
    }

    if (typeof address !== "string" || address.length === 0) {
      return json<ActionData>(
        { errors: { address: "Address is required" } },
        { status: 400 }
      );
    }

    const building = await prisma.building.create({
      data: { name, address },
    });

    await createDefaultPillarsForBuilding(building.id);

    return redirect(`/buildings/${building.id}`);
  } else if (intent === "delete") {
    const buildingId = formData.get("buildingId");
    if (typeof buildingId !== "string") {
      return json({ error: "Invalid building ID" }, { status: 400 });
    }

    // Delete related KPIs and pillars first
    await prisma.kPI.deleteMany({
      where: { pillar: { buildingId } },
    });
    await prisma.pillar.deleteMany({
      where: { buildingId },
    });
    
    // Then delete the building
    await prisma.building.delete({
      where: { id: buildingId },
    });

    return json({ success: true });
  }

  return json({ error: "Invalid intent" }, { status: 400 });
};

export default function BuildingsIndex() {
  const { buildings } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()
  const navigate = useNavigate()
  const submit = useSubmit()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null)

  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  const handleDeleteClick = (buildingId: string) => {
    setBuildingToDelete(buildingId)
  }

  const handleDeleteConfirm = () => {
    if (buildingToDelete) {
      const formData = new FormData()
      formData.append("intent", "delete")
      formData.append("buildingId", buildingToDelete)
      submit(formData, { method: "post" })
      setBuildingToDelete(null)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Buildings</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Building
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Building</DialogTitle>
              <DialogDescription>
                Enter the details of the new building here.
              </DialogDescription>
            </DialogHeader>
            <Form method="post" className="space-y-4" onSubmit={() => handleDialogClose()}>
              <input type="hidden" name="intent" value="create" />
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  aria-invalid={actionData?.errors?.name ? true : undefined}
                  aria-errormessage={actionData?.errors?.name ? "name-error" : undefined}
                />
                {actionData?.errors?.name && (
                  <p className="text-red-500 text-sm" id="name-error">{actionData.errors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  aria-invalid={actionData?.errors?.address ? true : undefined}
                  aria-errormessage={actionData?.errors?.address ? "address-error" : undefined}
                />
                {actionData?.errors?.address && (
                  <p className="text-red-500 text-sm" id="address-error">{actionData.errors.address}</p>
                )}
              </div>
              <Button type="submit">Add Building</Button>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {buildings.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl mb-4">No buildings added yet.</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Building
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {buildings.map((building) => (
            <li key={building.id} className="rounded border p-4 shadow-sm">
              <h2 className="text-lg font-semibold">{building.name}</h2>
              <p className="mb-4 text-gray-600">{building.address}</p>
              <div className="flex justify-between items-center">
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => navigate(`/buildings/${building.id}`)}
                >
                  <div className="flex items-center">
                    View Building
                    <ArrowRight size={16} className="ml-2" />
                  </div>
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteClick(building.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <AlertDialog open={!!buildingToDelete} onOpenChange={(open) => !open && setBuildingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this building?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the building and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
