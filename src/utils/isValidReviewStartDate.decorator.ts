import { registerDecorator, ValidationOptions } from 'class-validator';
import { minutesToMilliseconds } from 'date-fns';

export const IsValidReviewStartDate = (
  validationOptions?: ValidationOptions,
) => {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'isLongerThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: Date) {
          return value.getTime() % minutesToMilliseconds(30) === 0;
        },
        defaultMessage() {
          return `Time is accepted in 30 minute intervals`;
        },
      },
    });
  };
};
