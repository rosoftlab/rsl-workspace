import { BaseModel, BaseModelConfig } from '@rosoftlab/core';

@BaseModelConfig({
  type: 'fuel-transaction',
  formTitle: 'FuelTransaction'
})
export class FuelTransaction extends BaseModel {
  declare employeeId: string | undefined;
  declare warehouseId: string | undefined;
  declare destinationWarehouseId: string | null | undefined;
  declare carId: string | null | undefined;
  declare kilometersOrHours: number | undefined;
  declare liters: number | undefined;
  declare description: string | undefined;
  declare odometerPhotoId: string | null | undefined;
  declare fuelPumpPhotoId: string | null | undefined;
  declare transactionDate: string | Date | undefined;
}
