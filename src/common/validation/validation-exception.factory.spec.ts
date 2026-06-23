import { createValidationException } from './validation-exception.factory';

describe('createValidationException', () => {
  it('formats validation errors into readable field messages', () => {
    const exception = createValidationException([
      {
        property: 'email',
        constraints: {
          isEmail: 'email must be an email',
        },
      },
    ]);

    expect(exception.getResponse()).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      errors: [
        {
          field: 'email',
          messages: ['email must be an email'],
        },
      ],
    });
  });
});
