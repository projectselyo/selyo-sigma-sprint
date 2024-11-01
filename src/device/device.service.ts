import { Injectable } from '@nestjs/common';
import { DeviceRepository } from './device.repository';
import { DeviceInfo } from './device.interface';
import { CreateDeviceDto } from './dto/create-device.dto';

@Injectable()
export class DeviceService {
  constructor(private readonly deviceRepository: DeviceRepository) {}
  //Create post device
  async createDevice(createDeviceParams: CreateDeviceDto): Promise<DeviceInfo> {
    return this.deviceRepository.createDevice(createDeviceParams);
  }

  //Read get all device that are not soft deleted
  async getActiveDevice() {
    return this.deviceRepository.getActiveDevice();
  }

  async getDeviceConfigById(deviceId: string) {
    return await this.deviceRepository.getDeviceById(deviceId);
  }

  //Update put or patch device
  async updateDevice(deviceId: string, updatedFields: Record<string, any>) {
    return await this.deviceRepository.updateDevice(deviceId, updatedFields);
  }

  //Delete soft delete only
  async deleteDevice(deviceName: string): Promise<void> {
    return this.deviceRepository.deleteDevice(deviceName);
  }
}
