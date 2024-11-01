import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { TimestampService } from './timestamp.service';
import { Timestamp } from './timestamp.interface';

@Controller('timestamp')
export class TimestampController {
  constructor(private readonly timestampService: TimestampService) {}

  @Get()
  async getAllAttendance(
    @Query('csv') csvFormat: string,
  ): Promise<Timestamp[] | string> {
    return this.timestampService.getAllAttendance(csvFormat);
  }

  @Get('getAttendanceById/:id')
  async getByID(@Param('id') id: string): Promise<Timestamp | undefined> {
    const attendanceID = +id;
    return this.timestampService.findById(attendanceID);
  }

  @Post('IN')
  async checkIn(
    @Body() payload: { uid: string },
  ): Promise<Timestamp | undefined> {
    return this.timestampService.checkIn(payload.uid);
  }

  @Post('OUT')
  async checkOut(
    @Body() payload: { uid: string },
  ): Promise<Timestamp | undefined> {
    return this.timestampService.checkOut(payload.uid);
  }
}
