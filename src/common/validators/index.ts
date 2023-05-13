import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'notPast', async: false })
@Injectable()
export class NotPastValidator implements ValidatorConstraintInterface {
  validate(value: any) {
    const date = new Date(value);
    return date >= new Date();
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must not be in the past`;
  }
}

@ValidatorConstraint({ name: 'lessThan', async: false })
@Injectable()
export class LessThanValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return relatedValue && value && value < relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `${args.property} must be less than ${relatedPropertyName}`;
  }
}

@ValidatorConstraint({ name: 'requiredIf', async: false })
@Injectable()
export class RequiredIfValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return !relatedValue || value !== undefined;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `${args.property} is required when ${relatedPropertyName} is present`;
  }
}
