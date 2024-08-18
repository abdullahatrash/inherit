// // app/routes/buildings.$buildingId.results.tsx

// import { json, type LoaderFunction } from "@remix-run/node";
// import { useLoaderData } from "@remix-run/react";
// import { prisma } from "../../utils/db.server";
// import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
// // import { RadarChart } from "~/components/ui/charts";

// type LoaderData = {
//   building: {
//     id: string;
//     name: string;
//   };
//   pillars: Array<{
//     id: string;
//     name: string;
//     score: number;
//     kpis: Array<{
//       id: string;
//       name: string;
//       currentValue: number;
//       targetValue: number;
//       score: number;
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
//             select: { id: true, name: true, currentValue: true, targetValue: true, score: true },
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

// export default function BuildingResults() {
//   const { building, pillars } = useLoaderData<LoaderData>();

//   const radarData = {
//     labels: pillars.map(pillar => pillar.name),
//     datasets: [{
//       label: 'Pillar Scores',
//       data: pillars.map(pillar => pillar.score),
//       backgroundColor: 'rgba(255, 99, 132, 0.2)',
//       borderColor: 'rgb(255, 99, 132)',
//       pointBackgroundColor: 'rgb(255, 99, 132)',
//       pointBorderColor: '#fff',
//       pointHoverBackgroundColor: '#fff',
//       pointHoverBorderColor: 'rgb(255, 99, 132)'
//     }]
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Assessment Results for {building.name}</h1>
      
//       {/* <Card className="mb-8">
//         <CardHeader>
//           <CardTitle>Overall Pillar Scores</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <RadarChart data={radarData} />
//         </CardContent>
//       </Card> */}

//       {pillars.map((pillar) => (
//         <Card key={pillar.id} className="mb-4">
//           <CardHeader>
//             <CardTitle>{pillar.name}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="font-bold mb-2">Score: {pillar.score.toFixed(2)}</p>
//             <table className="w-full">
//               <thead>
//                 <tr>
//                   <th>KPI</th>
//                   <th>Current Value</th>
//                   <th>Target Value</th>
//                   <th>Score</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {pillar.kpis.map((kpi) => (
//                   <tr key={kpi.id}>
//                     <td>{kpi.name}</td>
//                     <td>{kpi.currentValue.toFixed(2)}</td>
//                     <td>{kpi.targetValue.toFixed(2)}</td>
//                     <td>{kpi.score.toFixed(2)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }
