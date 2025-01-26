import { Injectable, PipeTransform } from '@nestjs/common';
import { Schema, ZodError } from 'zod';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: Schema) {}

  transform(value: any) {
    try {
      this.schema.parse(value);
    } catch (error) {
      throw new WsException({
        message: 'Validation failed',
        errors: (error as ZodError).errors,
      });
    }
    return value;
  }
}
