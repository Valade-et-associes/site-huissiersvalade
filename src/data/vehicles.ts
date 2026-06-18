import vehicleData from "./vehicles.json";

export interface Vehicle {
  title: string;
  slug: string;
  brand: string;
  model: string;
  year: string;
  vin: string;
  dossier: string;
  keyStatus: string;
  offerDeadline: string;
  bailiffEmail: string;
  image: string;
  images?: string[];
}

export const vehicles = vehicleData as Vehicle[];

export function formatVehicleTitle(vehicle: Vehicle) {
  if (vehicle.title) return vehicle.title;
  const dossier = vehicle.dossier ? ` (${vehicle.dossier})` : "";
  return `${vehicle.brand} ${vehicle.model} ${vehicle.year}${dossier}`.trim();
}
