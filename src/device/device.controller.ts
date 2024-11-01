import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceInfo } from './device.interface';
import { CreateDeviceDto } from './dto/create-device.dto';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  //Create post device
  @Post('create')
  async createDevice(
    @Body() createDeviceParams: CreateDeviceDto,
  ): Promise<DeviceInfo> {
    // deviceId is required parameter
    if (!createDeviceParams.deviceId) {
      throw new BadRequestException('deviceId is required');
    }
    return this.deviceService.createDevice(createDeviceParams);
  }

  @Get(':deviceId')
  async getDeviceById(@Param('deviceId') deviceId: string) {
    console.log('device id', deviceId);
    return await this.deviceService.getDeviceConfigById(deviceId);
  }

  //Read get all device that are not soft deleted
  @Get()
  async getActiveDevice() {
    return this.deviceService.getActiveDevice();
  }

  //Update put or patch device
  @Put(':deviceId')
  async updateDevice(
    @Param('deviceId') deviceId: string,
    @Body() updatedFields: Record<string, any>,
  ) {
    return await this.deviceService.updateDevice(deviceId, updatedFields);
  }

  //Delete soft delete only
  @Delete(':deviceName')
  async deleteDevice(@Param('deviceName') deviceName: string): Promise<void> {
    return this.deviceService.deleteDevice(deviceName);
  }
}
