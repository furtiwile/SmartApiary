import type { ValidationResult } from "../models/ValidationResult";



const MIN_EMAIL_NAME_LEN = 3;
const MIN_PASSWD_LEN = 8;



export const AuthValidation = {
  isEmailValid(email: string): boolean {
    const [emailName, domainName] = email.split('@');
    return MIN_EMAIL_NAME_LEN <= emailName.length
      && domainName.split('.').length >= 2;
  },



  isPasswordValid(password: string) {
    return MIN_PASSWD_LEN <= password.length;
  },



  validateCredentials(email: string, password: string): ValidationResult {
    if (this.isEmailValid(email))
      return { success: false, code: -1, msg: "Email too short" };
    
    if (this.isPasswordValid(password))
      return { success: false, code: -2, msg: "Password too short" };
    
    return { success: true, code: 0, msg: "Validation successful" };
  }
} as const;
