// // app/routes/buildings+/new.tsx

// import { json, redirect, type ActionFunction } from "@remix-run/node";
// import { Form, useActionData } from "@remix-run/react";
// import { prisma } from '../../utils/db.server';

// type ActionData = {
//   errors?: {
//     name?: string;
//     address?: string;
//   };
// };

// export const action: ActionFunction = async ({ request }) => {
//   const formData = await request.formData();
//   const name = formData.get("name");
//   const address = formData.get("address");

//   if (typeof name !== "string" || name.length === 0) {
//     return json<ActionData>(
//       { errors: { name: "Name is required" } },
//       { status: 400 }
//     );
//   }

//   if (typeof address !== "string" || address.length === 0) {
//     return json<ActionData>(
//       { errors: { address: "Address is required" } },
//       { status: 400 }
//     );
//   }

//   const building = await prisma.building.create({
//     data: { name, address },
//   });

//   return redirect(`/buildings/${building.id}`);
// };

// export default function NewBuilding() {
//   const actionData = useActionData<ActionData>();

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Add New Building</h1>
//       <Form method="post" className="space-y-4">
//         <div>
//           <label htmlFor="name" className="block">Name:</label>
//           <input
//             type="text"
//             id="name"
//             name="name"
//             className="border rounded px-2 py-1 w-full"
//             aria-invalid={actionData?.errors?.name ? true : undefined}
//             aria-errormessage={actionData?.errors?.name ? "name-error" : undefined}
//           />
//           {actionData?.errors?.name && (
//             <p className="text-red-500" id="name-error">{actionData.errors.name}</p>
//           )}
//         </div>
//         <div>
//           <label htmlFor="address" className="block">Address:</label>
//           <input
//             type="text"
//             id="address"
//             name="address"
//             className="border rounded px-2 py-1 w-full"
//             aria-invalid={actionData?.errors?.address ? true : undefined}
//             aria-errormessage={actionData?.errors?.address ? "address-error" : undefined}
//           />
//           {actionData?.errors?.address && (
//             <p className="text-red-500" id="address-error">{actionData.errors.address}</p>
//           )}
//         </div>
//         <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add Building</button>
//       </Form>
//     </div>
//   );
// }
