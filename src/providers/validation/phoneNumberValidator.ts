import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const AUSTRALIA_PHONE_NUMBER_REGEX =
  /^\({0,1}((0|\+?61){0,1}(\ |-){0,1}(2|4|3|7|8)){0,1}\){0,1}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{1}(\ |-){0,1}[0-9]{3}$/;

@ValidatorConstraint({ name: 'phoneNumberValidator', async: false })
export class PhoneNumberValidator implements ValidatorConstraintInterface {
  validate(phoneNumber: string) {
    if (!phoneNumber) return false;

    return phoneNumber.match(AUSTRALIA_PHONE_NUMBER_REGEX) !== null;
  }

  defaultMessage() {
    return 'Phone number is invalid.';
  }
}
