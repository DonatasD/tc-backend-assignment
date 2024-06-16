import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';
import { IsValidReviewStartDate } from '../../utils/isValidReviewStartDate.decorator';
import { Type } from 'class-transformer';

export class FindAvailableMentorsDto {
  constructor(findAvailableMentorsDto: Partial<FindAvailableMentorsDto>) {
    Object.assign(this, findAvailableMentorsDto);
  }

  @ApiProperty({ type: Date })
  @Type(() => Date)
  @IsDate()
  @IsValidReviewStartDate()
  startDateTime: Date;
}
