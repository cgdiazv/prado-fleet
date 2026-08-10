export interface Vehicle {
  id: string;
  name: string; // e.g., "Truck 04 - Ford F-250"
  vin: string;
  status: 'active' | 'in_shop' | 'warning' | 'decommissioned';
  mileage: number;
  engineHours: number;
  assignedDriverId?: string;
  assignedTools: Asset[];
  telematics: {
    lat: number;
    lng: number;
    speed: number;
    fuelLevelPercentage: number;
    checkEngineCode?: string; // OBD-II Diagnostic
  };
}

export interface Asset {
  id: string;
  name: string; // e.g., "Commercial Pressure Washer B"
  category: 'heavy_equipment' | 'attachment' | 'tool';
  status: 'assigned_to_vehicle' | 'assigned_to_job' | 'in_storage';
  currentVehicleId?: string;
  currentJobId?: string; // Links to Prado Jobs
}

export interface DVIRReport {
  id: string;
  vehicleId: string;
  driverId: string;
  timestamp: string;
  type: 'pre_trip' | 'post_trip';
  passed: boolean;
  flaggedItems: string[]; // e.g., ["low_tire_pressure", "broken_tail_light"]
  autoOrderPartsTriggered?: boolean; // Integration with Prado Commerce
}