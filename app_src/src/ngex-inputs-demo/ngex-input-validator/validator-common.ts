import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

export class ValueArgs {
    value?: any;    
    label?: string;
    message?: string;
}
export class RangeArgs {
    minValue: any;
    maxValue: any;
    label?: string;
    message?: string;    
}
export class CompareArgs {
    nameA: string = '';
    nameB: string = '';
    label?: string;
    message?: string;
}

export class ExtendedControl {
    control!: FormControl;
    name: string = '';
    showInvalid: boolean = false;
}

export class ValidatorCommon {    
    //will be removed. 
    static isValidDate(value: any) {
        let d: any = new Date(value);
        if (typeof value === 'string' || value instanceof String) {
            return isFinite(d) && value.split('/')[0] == (d.getMonth() + 1);
        }
        else {
            return isFinite(d);
        }
    }

    static getExtendedControlList(formGroup: FormGroup): Array<ExtendedControl> {
        let extControlList: Array<ExtendedControl> = [];
        for (let prop in formGroup.controls) {
            if (formGroup.controls.hasOwnProperty(prop)) {
                let extControl: ExtendedControl = {
                    control: formGroup.controls[prop] as FormControl,
                    name: prop,
                    showInvalid: true
                };
                extControlList.push(extControl);
            }
        }
        return extControlList;
    }

    static getExtendedControl(extControlList: Array<ExtendedControl>, name: string): ExtendedControl {
        let extControl!: ExtendedControl;
        if (extControlList && extControlList.length > 0 && name) {
            extControl = extControlList.find(item => item.name == name)!;
        }        
        return extControl;
    }

    static validateDate(value: any): string | null {
        if (value == null || value == undefined) return null;

        //ngex-mydatepicker data object.
        if (typeof value === 'object' && value.formatted) return value.formatted;

        //Generic javascript date object.
        if (value instanceof Date && !isNaN(value.getTime())) {
            return ValidatorCommon.getFormattedDate(value);            
        }
        //String input.
        if (typeof value === 'string' || value instanceof String) {
            for (let i: number = 0; i < ValidatorCommon.acceptableFormats.length; i++) {
                let match: any = value.toString().match(ValidatorCommon.acceptableFormats[i]);
                if (match) {
                    let yyyy: string = match[3];
                    let mm: string = match[1];
                    let dd: string = match[2];
                    if (ValidatorCommon.checkValidDate(Number(mm), Number(dd), Number(yyyy))) {
                        let givenDate: Date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
                        let minDate: Date = new Date(1800, 0, 1);
                        if (yyyy && yyyy.length === 4 && yyyy.charAt(0) === '0') {
                            return null;
                        }
                        else if (givenDate < minDate) {
                            return null;
                        }
                        else { 
                            return value.toString();
                        }
                    }
                    else {
                        return null;
                    }
                }
            }
        }
        return null;
    }
    static acceptableFormats: any[] = [
        /^(\d{2})(\d{2})(\d{4})$/,
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
        /^(\d{1,2})\s(\d{1,2})\s(\d{4})$/
    ];
    static checkValidDate(MM: any, DD: any, YYYY: any): boolean {
        if (MM < 1 || MM > 12) {
            return false;
        }
        let monthLength: Array<number> = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        // Adjust for leap years
        if (YYYY % 400 === 0 || (YYYY % 100 !== 0 && YYYY % 4 === 0)) {
            monthLength[1] = 29;
        }
        // Check the range of the day
        if (DD <= 0 || DD > monthLength[MM - 1]) {
            return false;
        }
        return true;
    }

    static getFormattedDate(date: any) {
        try {
            let year: number = date.getFullYear();
            let month: string = (1 + date.getMonth()).toString();
            month = month.length > 1 ? month : '0' + month;
            let day: string = date.getDate().toString();
            day = day.length > 1 ? day : '0' + day;
            return month + '/' + day + '/' + year.toString();
        }
        catch (err: any) {
            return 'error';
        }
    }

    static getCurrentControlName(ct: AbstractControl): string {
        let formGroup!: any;
        let rtn: string = '';
        if (ct.parent && ct.parent.controls) {
            formGroup = ct.parent.controls;
            rtn = Object.keys(formGroup).find(name => ct === formGroup[name]) ?? '';
        }
        return rtn;
    }

    static toTitleCases(str: string): string {        
        let rtn: string = '';
        if (str) {
            rtn = str.split(' ')
                .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
                .join(' ');
        }
        return rtn;
    }    
}
