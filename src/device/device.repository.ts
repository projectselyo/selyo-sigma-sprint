import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { DeviceInfo } from './device.interface';
import { CreateDeviceDto } from './dto/create-device.dto';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class DeviceRepository {
  constructor(private readonly dbService: DatabaseService) {}

  //Create post device
  async createDevice(createDeviceParams: CreateDeviceDto): Promise<DeviceInfo> {
    // TODO: perform filter in the database query instead
    const existingDevice = await this.allDevice();
    const checkDevice = existingDevice.find(
      (device) => device.deviceId === createDeviceParams.deviceId,
    );
    // if device not found create new account
    if (!checkDevice) {
      const newDevice: DeviceInfo = {
        id: uuidv7(),
        deviceName: createDeviceParams.deviceName ?? uuidv7(),
        deviceId: createDeviceParams.deviceId,
        isDeleted: false,
        ...createDeviceParams,
      };
      // Save the new account
      await this.dbService.saveDevice(newDevice);
      console.log(newDevice);
      return newDevice;
    }
    throw new BadRequestException('Device ID Already Taken');
  }

  //Read get all device that
  async allDevice(): Promise<DeviceInfo[]> {
    const result = await this.dbService.getAllDeviceInfo();
    return result as unknown as DeviceInfo[];
  }

  //read those are not soft deleted
  async getActiveDevice(): Promise<DeviceInfo[]> {
    const existingAccount = await this.allDevice();
    const getActiveDevices = existingAccount.filter(
      (cred) => cred.isDeleted === false,
    );
    return getActiveDevices;
  }

  // get device by id
  async getDeviceById(deviceId: string): Promise<DeviceInfo> {
    console.log('device id', deviceId);
    return await this.dbService.getDeviceById(deviceId);
  }

  //Update put or patch device
  async updateDevice(deviceId: string, updatedFields: Record<string, any>) {
    // TODO: perform filter in the database query instead
    const existingDevice = await this.getActiveDevice();
    const checkDevice = existingDevice.find(
      (device) => device.deviceId === deviceId,
    );
    //find existing devices
    if (!checkDevice) {
      throw new BadRequestException('Device Id not Found');
    }
    //update the record if the device is found
    return await this.dbService.updateDevice(deviceId, updatedFields);
  }
  //Delete soft delete only
  async deleteDevice(deviceName: string): Promise<void> {
    try {
      // Update the record to mark it as deleted
      await this.dbService.deviceSoftDelete(deviceName);
      console.log(`Record with Device ${deviceName} marked as deleted.`);
    } catch (error) {
      console.error('Error performing soft delete:', error);
    }
  }
}
