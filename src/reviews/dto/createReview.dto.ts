import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt } from 'class-validator';
import { IsValidReviewStartDate } from '../../utils/isValidReviewStartDate.decorator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty()
  @IsInt()
  mentorId: number;

  @ApiProperty()
  @IsInt()
  studentId: number;

  @ApiProperty({ type: Date })
  @Type(() => Date)
  @IsDate()
  @IsValidReviewStartDate()
  startDateTime: Date;
}
