import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ValueArgs, RangeArgs, CompareArgs, ValidatorCommon } from './validator-common';

export class Validator2 {
    //required.
    static required(args?: ValueArgs): ValidatorFn {
        //Need return "any", not explicit "ValidationErrors" for build with Angular CLI 12 and above.
        //Otherwise error "Type 'null' is not assignable to type 'ValidationErrors'".
        return (fc: AbstractControl): any => {
            const isValid: boolean = (fc.value != undefined && fc.value != '');
            if (isValid) {
                return null;
            }
            else {
                //Usually label is Title Case. If not, use custom passed error message text.
                let label: string = 'Field';
                if (args && args.label) label = args.label;
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : label + ' is required.'
                    }
                };
                return errRtn;
            }
        }
    }
    //minLength.
    static minLength(args: ValueArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            if (fc.value) {
                const isValid: boolean = (fc.value.length >= args.value);
                let label: string = 'Field';
                if (args && args.label) label = args.label;
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : label + ' length no less than ' + args.value + '.'
                    }
                };
                return isValid ? null : errRtn;
            }
        }
    }
    //maxLength.
    static maxLength(args: ValueArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            if (fc.value) {
                const isValid: boolean = (fc.value.length <= args.value);
                let label: string = 'Field';
                if (args && args.label) label = args.label;
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : label + ' length no more than ' + args.value + '.'
                    }
                };
                return isValid ? null : errRtn;
            }
        }
    }
    //number.
    static number(args?: ValueArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            if (fc.value) {
                let isValid: boolean = (!isNaN(Number(fc.value)) && isFinite(fc.value));
                //Above checker return true for '0000' or '0001'.
                if (fc.value.length > 1 && fc.value.indexOf('0') == 0 && fc.value.indexOf('.') != 1) {
                    isValid = false;
                }
                let label: string = 'number';
                if (args && args.label) label = args.label;
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : 'Invalid ' + label + '.'
                    }
                };
                return isValid ? null : errRtn;
            }
        }
    }
    //minNumber.
    static minNumber(args: ValueArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            if (fc.value && !isNaN(Number(fc.value)) && isFinite(fc.value)) {
                let label: string = 'Number';
                if (args && args.label) label = args.label;
                const isValid: boolean = (fc.value >= args.value);
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : label + ' no less then ' + args.value + '.'
                    }
                };
                return isValid ? null : errRtn;
            }
        }
    }
    //maxNumber.
    static maxNumber(args: ValueArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            if (fc.value && !isNaN(Number(fc.value)) && isFinite(fc.value)) {
                const isValid: boolean = (fc.value <= args.value);
                let label: string = 'Number';
                if (args && args.label) label = args.label;
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : label + ' no more then ' + args.value + '.'
                    }
                };
                return isValid ? null : errRtn;
            }
        }
    }
    //numberRange.
    static numberRange(args: RangeArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            if (fc.value) {
                const isValid: boolean = (fc.value >= args.minValue && fc.value <= args.maxValue);
                let label: string = 'Number';
                if (args && args.label) label = args.label;
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : label + ' should be between ' + args.minValue.toString() + ' and ' + args.maxValue.toString() + '.'
                    }
                };
                return isValid ? null : errRtn;
            }
        }
    }
    //common currency.
    static currency(args?: ValueArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            if (fc.value) {
                let reg: any = /^((\d{1,2}(,\d{3})+)|(\d+))(\.\d{1,2})?$/;
                if (args && args.value) {
                    //Set first arg as message if error text passed from the first arg.
                    if (typeof args.value === 'string') {
                        args.message = args.value;
                    }
                    else {
                        reg = args.value;
                    }
                }
                const isValid: boolean = reg.test(fc.value);
                let label: string = 'currency';
                if (args && args.label) label = args.label;
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : 'Invalid ' + label + '.'
                    }
                };
                return isValid ? null : errRtn;
            }
        }
    }
    //minCurrency (suppose using input-currency directive).
    static minCurrency(args: ValueArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            //Remove all non-number characters.
            if (fc.value) {
                let value: string = fc.value.toString().replace(/[^0-9/.]*/g, '');
                const isValid: boolean = (parseFloat(value) >= parseFloat(args.value));
                let label: string = 'Amount';
                if (args && args.label) label = args.label;
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : label + ' no less then ' + args.value + '.'
                    }
                };
                return isValid ? null : errRtn;                
            }
        }
    }
    //maxCurrency (suppose using input-currency directive).
    static maxCurrency(args: ValueArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            //Remove all non-number characters.
            if (fc.value) {
                let value: string = fc.value.toString().replace(/[^0-9/.]*/g, '');
                const isValid: boolean = (parseFloat(value) <= parseFloat(args.value));
                let label: string = 'Number';
                if (args && args.label) label = args.label;
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : label + ' no more then ' + args.value + '.'
                    }
                };
                return isValid ? null : errRtn;
            }
        }
    }
    //date.
    static date(args?: ValueArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            if (fc.value) {
                let isValid: boolean = false;
                if (ValidatorCommon.validateDate(fc.value) && !isNaN(Date.parse(fc.value))) {
                    isValid = true;
                }
                let label: string = 'date';
                if (args && args.label) label = args.label;
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : 'Invalid ' + label + '.'
                    }
                };
                return isValid ? null : errRtn;
            }
        }
    }
    //minDate.
    static minDate(args: ValueArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            if (fc.value) {
                const dateStr = ValidatorCommon.validateDate(fc.value);
                if (dateStr) {
                    const isValid: boolean = (Date.parse(dateStr) >= Date.parse(args.value.toString().replace(/'/g, '')));
                    let label: string = 'Date';
                    if (args && args.label) label = args.label;
                    const errRtn: any = {
                        'custom': {
                            'message': args && args.message ? args.message : label + ' no earlier then ' + args.value.toString() + '.'
                        }
                    };
                    return isValid ? null : errRtn;
                }
            }
        }
    }
    //maxDate.
    static maxDate(args: ValueArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            if (fc.value) {
                const dateStr = ValidatorCommon.validateDate(fc.value);
                if (dateStr) {
                    const isValid: boolean = (Date.parse(dateStr) <= Date.parse(args.value.toString().replace(/'/g, '')));
                    let label: string = 'Date';
                    if (args && args.label) label = args.label;
                    const errRtn: any = {
                        'custom': {
                            'message': args && args.message ? args.message : label + ' no later then ' + args.value.toString() + '.'
                        }
                    };
                    return isValid ? null : errRtn;
                }
            }
        }
    }
    //dateRange.
    static DateRange(args: RangeArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            if (fc.value) {
                const dateStr = ValidatorCommon.validateDate(fc.value);
                if (dateStr) {
                    const isValid: boolean = (
                        Date.parse(dateStr) >= Date.parse(args.minValue.toString().replace(/'/g, '')) &&
                        Date.parse(dateStr) <= Date.parse(args.maxValue.toString().replace(/'/g, '')));
                    let label: string = 'Date';
                    if (args && args.label) label = args.label;
                    const errRtn: any = {
                        'custom': {
                            'message': args && args.message ? args.message : label + ' should be between ' + args.minValue.toString() + ' and ' + args.maxValue.toString() + '.'
                        }
                    };
                    return isValid ? null : errRtn;
                }
            }
        }
    }
    //email.
    static email(args?: ValueArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            if (fc.value) {
                let reg: any = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                if (args && args.value) {
                    //Set first arg as message if error text passed from the first arg.
                    if (typeof args.value === 'string') {
                        args.message = args.value;
                    }
                    else {
                        reg = args.value;
                    }
                }
                const isValid: boolean = reg.test(fc.value);
                let label: string = 'email address';
                if (args && args.label) label = args.label;
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : 'Invalid ' + label + '.'
                    }
                };
                return isValid ? null : errRtn;
            }
        }
    }
    //usPhone
    static usPhone(hasMask: boolean = false, args?: ValueArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            if (fc.value) {
                //let reg: any = /^([0-9]{3})[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/; //Not handle parentheses.
                let reg: any = /^\(?[2-9]\d{2}\)?[-. ]?(\d{3})[-. ]?(\d{4})$/;
                if (args && args.value) {
                    //Set first arg as message if error text passed from the first arg.
                    if (typeof args.value === 'string') {
                        args.message = args.value;
                    }
                    else {
                        reg = args.value;
                    }
                }
                //Handle us phone input mask.
                let maskValue: any = fc.value.replace(/\D/g, '');
                if (maskValue.length > 10) {
                    maskValue = maskValue.substring(0, 10);
                }
                const isValid: boolean = reg.test(hasMask ? maskValue : fc.value);
                let label: string = 'phone number';
                if (args && args.label) label = args.label;
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : 'Invalid ' + label + '.'
                    }
                };
                return isValid ? null : errRtn;
            }
        }
    }
    
    //fieldMatch.
    //Pass comparedControl via args.value. 
    static fieldMatch(args: ValueArgs): ValidatorFn {
        if (!args) return () => {
            return {}
        };
        return (fc: AbstractControl): any => {
            const comparedValue: any = args.value.value;            
            if (fc.value && comparedValue) {
                const isValid: boolean = (fc.value == comparedValue);
                let label: string = 'Field values';
                if (args.label) label = args.label;
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : label + ' not match.'
                    }
                };
                return isValid ? null : errRtn;
            }
        }
    }

    //fieldMatch2 is set for form group whereas error object returned at control-B level.
    //Pass control names via args. 
    static fieldMatch2(args: CompareArgs): ValidatorFn {
        if (!args) return () => {
            return {}
        };
        return (fc: AbstractControl): any => {
            const controlA: any = fc.get(args.nameA);
            const controlB: any = fc.get(args.nameB);
            if (controlA && controlB && controlA.value && controlB.value) {
                const isValid: boolean = (controlB.value == controlA.value);
                let label: string = 'Field values';
                if (args.label) label = args.label;

                //Use setErrors() to controlB.
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : label + ' not match.'
                    }
                };
                if (!isValid) {
                    controlB.setErrors(errRtn);
                }
                else {
                    controlB.setErrors(null);
                }

                //Add property to avoid clearing out other error items if any.
                //But this won't auto update "invalid" flag. Thus not working here.
                //const message: string = args && args.message ? args.message : label + ' not match.';
                //if (!isValid) {
                //    if (!controlB.errors) controlB.errors = {};
                //    controlB.errors['custom'] = message;                    
                //}
                //else {
                //    delete controlB.errors['custom'];                    
                //}
                //Do not return error object at form group level.
                return null;
            }
        }
    }    

    //customExpression: pass args.value as regular expression.
    static customExpression(args?: ValueArgs): ValidatorFn {
        return (fc: AbstractControl): any => {
            if (fc.value) {
                let reg!: RegExp;
                if (args && args.value) {
                    reg = args.value;
                }
                const isValid: boolean = reg.test(fc.value);
                let label: string = 'field value';
                if (args && args.label) label = args.label;
                const errRtn: any = {
                    'custom': {
                        'message': args && args.message ? args.message : 'Invalid ' + label + '.'
                    }
                };
                return isValid ? null : errRtn;
            }
        }
    }
}
