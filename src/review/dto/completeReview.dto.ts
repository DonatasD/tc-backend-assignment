import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CompleteReviewDto {
  constructor(completeReviewDto: Partial<CompleteReviewDto>) {
    Object.assign(this, completeReviewDto);
  }

  @ApiProperty({ example: 5 })
  @IsInt()
  @Max(10)
  @Min(1)
  grade: number;

  @IsNotEmpty()
  @ApiProperty({ example: 'comment about provided grade' })
  comment: string;
}
