// // app/routes/buildings.$buildingId.assess-all.tsx

// import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
// import { useLoaderData, Form, useTransition } from "@remix-run/react";
// import { prisma } from "../../utils/db.server";
// import { Button } from "../../components/ui/button";
// import { Input } from "../../components/ui/input";
// import { Label } from "../../components/ui/label";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";

// type LoaderData = {
//   building: {
//     id: string;
//     name: string;
//   };
//   pillars: Array<{
//     id: string;
//     name: string;
//     kpis: Array<{
//       id: string;
//       name: string;
//       currentValue: number;
//       targetValue: number;
//     }>;
//   }>;
// };

// export const loader: LoaderFunction = async ({ params }) => {
//   const building = await prisma.building.findUnique({
//     where: { id: params.buildingId },
//     select: {
//       id: true,
//       name: true,
//       pillars: {
//         include: {
//           kpis: {
//             select: { id: true, name: true, currentValue: true, targetValue: true },
//           },
//         },
//       },
//     },
//   });

//   if (!building) {
//     throw new Response("Building not found", { status: 404 });
//   }

//   return json({ building, pillars: building.pillars });
// };

// export const action: ActionFunction = async ({ request, params }) => {
//   const formData = await request.formData();
//   const buildingId = params.buildingId;

//   const pillars = await prisma.pillar.findMany({
//     where: { buildingId },
//     include: { kpis: true },
//   });

//   for (const pillar of pillars) {
//     for (const kpi of pillar.kpis) {
//       const currentValue = formData.get(kpi.id);
//       if (typeof currentValue === "string") {
//         await prisma.kpi.update({
//           where: { id: kpi.id },
//           data: { currentValue: parseFloat(currentValue) },
//         });
//       }
//     }
//     // Recalculate pillar score here
//   }

//   return redirect(`/buildings/${buildingId}/results`);
// };

// export default function AssessAllPillars() {
//   const { building, pillars } = useLoaderData<LoaderData>();
//   const transition = useTransition();
//   const isSubmitting = transition.state === "submitting";

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Assess All Pillars for {building.name}</h1>
//       <Form method="post" className="space-y-4">
//         <Accordion type="single" collapsible className="w-full">
//           {pillars.map((pillar) => (
//             <AccordionItem key={pillar.id} value={pillar.id}>
//               <AccordionTrigger>{pillar.name}</AccordionTrigger>
//               <AccordionContent>
//                 {pillar.kpis.map((kpi) => (
//                   <div key={kpi.id} className="mb-4">
//                     <Label htmlFor={kpi.id}>{kpi.name}</Label>
//                     <Input
//                       type="number"
//                       id={kpi.id}
//                       name={kpi.id}
//                       defaultValue={kpi.currentValue}
//                       step="0.01"
//                     />
//                     <p className="text-sm text-gray-500">Target: {kpi.targetValue}</p>
//                   </div>
//                 ))}
//               </AccordionContent>
//             </AccordionItem>
//           ))}
//         </Accordion>
//         <Button type="submit" disabled={isSubmitting}>
//           {isSubmitting ? "Submitting..." : "Submit All Assessments"}
//         </Button>
//       </Form>
//     </div>
//   );
// }
