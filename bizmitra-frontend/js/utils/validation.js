// js/utils/validation.js

const patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^(\+\d{1,3}[- ]?)?\d{10}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    url: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    name: /^[a-zA-Z\s]{2,50}$/,
    pincode: /^\d{6}$/,
    // Add more patterns as needed
  };
  
  class ValidationService {
    isEmail(value) {
      return patterns.email.test(value);
    }
  
    isPhone(value) {
      return patterns.phone.test(value);
    }
  
    isStrongPassword(value) {
      return patterns.password.test(value);
    }
  
    isUrl(value) {
      return patterns.url.test(value);
    }
  
    isName(value) {
      return patterns.name.test(value);
    }
  
    isPincode(value) {
      return patterns.pincode.test(value);
    }
  
    isRequired(value) {
      return value !== undefined && value !== null && value.toString().trim() !== '';
    }
  
    minLength(value, length) {
      return value.length >= length;
    }
  
    maxLength(value, length) {
      return value.length <= length;
    }
  
    isNumber(value) {
      return !isNaN(parseFloat(value)) && isFinite(value);
    }
  
    isInteger(value) {
      return Number.isInteger(Number(value));
    }
  
    isPositive(value) {
      return this.isNumber(value) && Number(value) > 0;
    }
  
    isNegative(value) {
      return this.isNumber(value) && Number(value) < 0;
    }
  
    isInRange(value, min, max) {
      return this.isNumber(value) && Number(value) >= min && Number(value) <= max;
    }
  
    isDate(value) {
      return !isNaN(Date.parse(value));
    }
  
    isFutureDate(value) {
      const date = new Date(value);
      const now = new Date();
      return date > now;
    }
  
    isPastDate(value) {
      const date = new Date(value);
      const now = new Date();
      return date < now;
    }
  
    isEqual(value1, value2) {
      return value1 === value2;
    }
  
    isPasswordMatch(password, confirmPassword) {
      return password === confirmPassword;
    }
  
    validateForm(form, rules) {
      const errors = {};
      let isValid = true;
      
      Object.entries(rules).forEach(([field, fieldRules]) => {
        const value = form[field];
        let fieldIsValid = true;
        let fieldError = '';
        
        // Process each rule for the field
        fieldRules.forEach(rule => {
          if (!fieldIsValid) return;
          
          switch (rule.type) {
            case 'required':
              fieldIsValid = this.isRequired(value);
              if (!fieldIsValid) fieldError = rule.message || 'This field is required';
              break;
            case 'email':
              fieldIsValid = value ? this.isEmail(value) : true;
              if (!fieldIsValid) fieldError = rule.message || 'Please enter a valid email address';
              break;
            case 'phone':
              fieldIsValid = value ? this.isPhone(value) : true;
              if (!fieldIsValid) fieldError = rule.message || 'Please enter a valid phone number';
              break;
            case 'password':
              fieldIsValid = value ? this.isStrongPassword(value) : true;
              if (!fieldIsValid) fieldError = rule.message || 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character';
              break;
            case 'match':
              fieldIsValid = value === form[rule.field];
              if (!fieldIsValid) fieldError = rule.message || `This field must match ${rule.field}`;
              break;
            case 'minLength':
              fieldIsValid = value ? this.minLength(value, rule.length) : true;
              if (!fieldIsValid) fieldError = rule.message || `This field must be at least ${rule.length} characters`;
              break;
            case 'maxLength':
              fieldIsValid = value ? this.maxLength(value, rule.length) : true;
              if (!fieldIsValid) fieldError = rule.message || `This field must not exceed ${rule.length} characters`;
              break;
            case 'pattern':
              fieldIsValid = value ? rule.pattern.test(value) : true;
              if (!fieldIsValid) fieldError = rule.message || 'Please enter a valid value';
              break;
            case 'custom':
              fieldIsValid = rule.validator(value, form);
              if (!fieldIsValid) fieldError = rule.message || 'Invalid value';
              break;
            default:
              break;
          }
        });
        
        if (!fieldIsValid) {
          errors[field] = fieldError;
          isValid = false;
        }
      });
      
      return { isValid, errors };
    }
  
    // Initialize form validation for DOM elements
    initFormValidation(formSelector, rules, options = {}) {
      const form = document.querySelector(formSelector);
      if (!form) return null;
      
      const defaultOptions = {
        validateOnBlur: true,
        validateOnSubmit: true,
        showErrors: true
      };
      
      const settings = { ...defaultOptions, ...options };
      const formFields = {};
      const formErrors = {};
      
      // Set up initial field values and error placeholders
      Object.keys(rules).forEach(fieldName => {
        const field = form.elements[fieldName];
        if (field) {
          formFields[fieldName] = field.value;
          
          if (settings.validateOnBlur) {
            field.addEventListener('blur', () => {
              this.validateField(fieldName, field.value, rules, form, formErrors, settings);
            });
            
            field.addEventListener('input', () => {
              formFields[fieldName] = field.value;
              if (formErrors[fieldName]) {
                this.clearFieldError(field);
                delete formErrors[fieldName];
              }
            });
          }
        }
      });
      
      if (settings.validateOnSubmit) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          
          // Update form values
          Object.keys(rules).forEach(fieldName => {
            const field = form.elements[fieldName];
            if (field) {
              formFields[fieldName] = field.value;
            }
          });
          
          // Validate all fields
          const { isValid, errors } = this.validateForm(formFields, rules);
          
          if (isValid) {
            // Clear all errors
            Object.keys(formErrors).forEach(fieldName => {
              const field = form.elements[fieldName];
              if (field) {
                this.clearFieldError(field);
              }
            });
            
            if (options.onSuccess) {
              options.onSuccess(formFields, form);
            } else {
              form.submit();
            }
          } else {
            // Show errors
            if (settings.showErrors) {
              Object.entries(errors).forEach(([fieldName, errorMessage]) => {
                const field = form.elements[fieldName];
                if (field) {
                  this.showFieldError(field, errorMessage);
                  formErrors[fieldName] = errorMessage;
                }
              });
            }
            
            if (options.onError) {
              options.onError(errors, formFields, form);
            }
          }
        });
      }
      
      return {
        validate: () => {
          // Update form values
          Object.keys(rules).forEach(fieldName => {
            const field = form.elements[fieldName];
            if (field) {
              formFields[fieldName] = field.value;
            }
          });
          
          return this.validateForm(formFields, rules);
        },
        getValues: () => ({ ...formFields }),
        setValues: (values) => {
          Object.entries(values).forEach(([fieldName, value]) => {
            const field = form.elements[fieldName];
            if (field) {
              field.value = value;
              formFields[fieldName] = value;
            }
          });
        },
        reset: () => {
          form.reset();
          Object.keys(formFields).forEach(fieldName => {
            const field = form.elements[fieldName];
            if (field) {
              formFields[fieldName] = '';
              this.clearFieldError(field);
            }
          });
          Object.keys(formErrors).forEach(key => delete formErrors[key]);
        }
      };
    }
  
    validateField(fieldName, value, rules, form, formErrors, settings) {
      const fieldRules = rules[fieldName];
      if (!fieldRules) return true;
      
      const fieldValues = {};
      Object.keys(rules).forEach(name => {
        const field = form.elements[name];
        if (field) {
          fieldValues[name] = field.value;
        }
      });
      
      const result = this.validateForm({ ...fieldValues, [fieldName]: value }, { [fieldName]: fieldRules });
      const field = form.elements[fieldName];
      
      if (!result.isValid) {
        const errorMessage = result.errors[fieldName];
        if (settings.showErrors) {
          this.showFieldError(field, errorMessage);
        }
        formErrors[fieldName] = errorMessage;
        return false;
      } else {
        this.clearFieldError(field);
        if (formErrors[fieldName]) {
          delete formErrors[fieldName];
        }
        return true;
      }
    }
  
    showFieldError(field, message) {
      field.classList.add('is-invalid');
      
      let errorElement = field.nextElementSibling;
      if (!errorElement || !errorElement.classList.contains('invalid-feedback')) {
        errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback';
        field.parentNode.insertBefore(errorElement, field.nextSibling);
      }
      
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  
    clearFieldError(field) {
      field.classList.remove('is-invalid');
      
      const errorElement = field.nextElementSibling;
      if (errorElement && errorElement.classList.contains('invalid-feedback')) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
      }
    }
  }
  
  export const validation = new ValidationService();
  