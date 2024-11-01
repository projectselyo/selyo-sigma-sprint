import { BadRequestException, Injectable } from '@nestjs/common';
import { TimestampRepository } from './timestamp.repository';
import { Timestamp } from './timestamp.interface';
import { UsersRepository } from 'src/users/users.repository';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TimestampService {
  constructor(
    private readonly timestampRepository: TimestampRepository,
    private readonly userService: UsersService,
  ) { }

  async getAllAttendance(csvFormat: string): Promise<Timestamp[] | string> {
    const timestamps = await this.timestampRepository.findAll();

    console.log('total timestamps', timestamps.length);
    const retVal = []
    for (const ts of timestamps) {
      if (ts.uid) {
        const user = await this.userService.getUserOwningUID(ts.uid);
        if (user) {
          retVal.push(user)
        }
        // ts.email = user?.email || 'no@email.com';
        // ts.timestampFormatted = new Date(ts.timestamp).toISOString();
      }
    }

    if (csvFormat) {
      const onlyNames = retVal.map(ts => {
        if (ts.name.includes(" ")) {
          return ts.name
        }
        return ts.email || "INVALID"

        // `${ts.name || ts.email || 'INVALID'}`
      })
      
      .join('\n');
      return onlyNames;
    }

    return timestamps;
  }

  async findById(id: number): Promise<Timestamp | null> {
    return this.timestampRepository.findById(id);
  }

  async checkIn(uid: string): Promise<Timestamp> {
    console.log('uid', uid);
    const user = await this.userService.getUserOwningUID(uid);
    if (user) {
      return this.timestampRepository.save(uid, 'IN');
    }
    throw new BadRequestException('UID is not tagged to user');
  }

  async checkOut(uid: string): Promise<Timestamp> {
    const user = await this.userService.getUserOwningUID(uid);
    if (user) {
      return this.timestampRepository.save(uid, 'OUT');
    }
    throw new BadRequestException('UID is not tagged to user');
  }
}
