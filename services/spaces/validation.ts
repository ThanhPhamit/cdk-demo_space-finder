export interface Space {
  id: string;
  location: string;
  ward: string;
  photoUrl?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class SpaceValidator {
  private static readonly ID_REGEX = /^[a-zA-Z0-9_-]+$/;
  private static readonly URL_REGEX =
    /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
  private static readonly MIN_STRING_LENGTH = 1;
  private static readonly MAX_STRING_LENGTH = 255;

  static validateId(id: string): ValidationResult {
    const errors: string[] = [];

    if (!id || typeof id !== 'string') {
      errors.push('ID is required and must be a string');
    } else {
      if (id.trim().length === 0) {
        errors.push('ID cannot be empty');
      }
      if (id.length > this.MAX_STRING_LENGTH) {
        errors.push(
          `ID must be less than ${this.MAX_STRING_LENGTH} characters`,
        );
      }
      if (!this.ID_REGEX.test(id)) {
        errors.push(
          'ID can only contain letters, numbers, hyphens, and underscores',
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateLocation(location: string): ValidationResult {
    const errors: string[] = [];

    if (!location || typeof location !== 'string') {
      errors.push('Location is required and must be a string');
    } else {
      const trimmedLocation = location.trim();
      if (trimmedLocation.length < this.MIN_STRING_LENGTH) {
        errors.push('Location cannot be empty');
      }
      if (trimmedLocation.length > this.MAX_STRING_LENGTH) {
        errors.push(
          `Location must be less than ${this.MAX_STRING_LENGTH} characters`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateWard(ward: string): ValidationResult {
    const errors: string[] = [];

    if (!ward || typeof ward !== 'string') {
      errors.push('Ward is required and must be a string');
    } else {
      const trimmedWard = ward.trim();
      if (trimmedWard.length < this.MIN_STRING_LENGTH) {
        errors.push('Ward cannot be empty');
      }
      if (trimmedWard.length > this.MAX_STRING_LENGTH) {
        errors.push(
          `Ward must be less than ${this.MAX_STRING_LENGTH} characters`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validatePhotoUrl(photoUrl?: string): ValidationResult {
    const errors: string[] = [];

    // photoUrl is optional, so it's valid if not provided
    if (photoUrl === undefined || photoUrl === null) {
      return {
        isValid: true,
        errors: [],
      };
    }

    if (typeof photoUrl !== 'string') {
      errors.push('Photo URL must be a string');
    } else {
      const trimmedUrl = photoUrl.trim();
      if (trimmedUrl.length === 0) {
        // Empty string is treated as no URL provided
        return {
          isValid: true,
          errors: [],
        };
      }
      if (trimmedUrl.length > this.MAX_STRING_LENGTH) {
        errors.push(
          `Photo URL must be less than ${this.MAX_STRING_LENGTH} characters`,
        );
      }
      if (!this.URL_REGEX.test(trimmedUrl)) {
        errors.push(
          'Photo URL must be a valid HTTP/HTTPS URL pointing to an image file (jpg, jpeg, png, gif, webp)',
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateSpace(space: Partial<Space>): ValidationResult {
    const allErrors: string[] = [];

    if (space.id !== undefined) {
      const idValidation = this.validateId(space.id);
      allErrors.push(...idValidation.errors);
    }

    if (space.location !== undefined) {
      const locationValidation = this.validateLocation(space.location);
      allErrors.push(...locationValidation.errors);
    }

    if (space.ward !== undefined) {
      const wardValidation = this.validateWard(space.ward);
      allErrors.push(...wardValidation.errors);
    }

    if (space.photoUrl !== undefined) {
      const photoUrlValidation = this.validatePhotoUrl(space.photoUrl);
      allErrors.push(...photoUrlValidation.errors);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  static validateCompleteSpace(space: Partial<Space>): ValidationResult {
    const allErrors: string[] = [];

    // For complete space validation, all required fields must be present
    if (!space.id) {
      allErrors.push('ID is required');
    } else {
      const idValidation = this.validateId(space.id);
      allErrors.push(...idValidation.errors);
    }

    if (!space.location) {
      allErrors.push('Location is required');
    } else {
      const locationValidation = this.validateLocation(space.location);
      allErrors.push(...locationValidation.errors);
    }

    if (!space.ward) {
      allErrors.push('Ward is required');
    } else {
      const wardValidation = this.validateWard(space.ward);
      allErrors.push(...wardValidation.errors);
    }

    // photoUrl is optional, so only validate if provided
    const photoUrlValidation = this.validatePhotoUrl(space.photoUrl);
    allErrors.push(...photoUrlValidation.errors);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  static sanitizeSpace(space: Partial<Space>): Partial<Space> {
    const sanitized: Partial<Space> = {};

    if (space.id) {
      sanitized.id = space.id.trim();
    }

    if (space.location) {
      sanitized.location = space.location.trim();
    }

    if (space.ward) {
      sanitized.ward = space.ward.trim();
    }

    if (space.photoUrl && space.photoUrl.trim()) {
      sanitized.photoUrl = space.photoUrl.trim();
    }

    return sanitized;
  }
}
