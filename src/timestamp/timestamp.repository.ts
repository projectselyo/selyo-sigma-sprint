import { Injectable } from '@nestjs/common';
import SurrealDB from 'surrealdb';
import { Timestamp } from './timestamp.interface';
import { DatabaseService } from 'src/database/database.service';
import { ConfigService } from '@nestjs/config';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class TimestampRepository {
  private readonly client: SurrealDB;
  private readonly table = 'attendance';

  constructor(
    private readonly dbService: DatabaseService,
    private configService: ConfigService,
  ) {}

  // Save a new attendance record
  async save(uid: string, types: string): Promise<Timestamp> {
    const attendanceToSave: Timestamp = {
      // id: uuidv7(),
      uid,
      types,
      timestamp: Date.now(),
    };

    const result = await this.dbService.createTimestamp(attendanceToSave);

    const savedAttendance = result[0];

    return {
      ...savedAttendance,
      timestamp: new Date(savedAttendance.timestamp).getTime(),
    };
  }

  // Retrieve all attendance records
  async findAll(): Promise<Timestamp[]> {
    const result = await this.dbService.findAllTimestamp();
    return result as Timestamp[];
  }

  // Find a specific attendance record by ID
  async findById(id: number): Promise<Timestamp | null> {
    const result = await this.client.select<any>(
      `${this.table} WHERE id = ${id}`,
    );
    return result[0] as Timestamp | null;
  }

  // Find attendance records by email
  async findByEmail(email: string): Promise<Timestamp[]> {
    const result = await this.client.select<any>(
      `${this.table} WHERE email = '${email}'`,
    );
    return result as Timestamp[];
  }

  //Update the attendance *FOR FUTURE USE*
  async update(
    id: number,
    updatedData: Partial<Timestamp>,
  ): Promise<Timestamp | null> {
    await this.client.update<any>(`${this.table}:${id}`, updatedData as any);
    return this.findById(id);
  }

  // Delete an attendance record by *FOR FUTURE USE*
  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.client.delete<any>(`${this.table}:${id}`);
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting record:', error);
      return false;
    }
  }
}
