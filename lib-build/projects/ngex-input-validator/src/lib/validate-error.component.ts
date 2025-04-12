export interface ErrorMessages {
    required: any;
    minlength: any;
    maxlength: any;
    pattern: any;
    custom: any;
    invalidDateFormat: any;
    [key: string]: undefined | string | any;
}

import { Component, Input, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { AbstractControlDirective, AbstractControl } from '@angular/forms';
import { ValidatorCommon, ExtendedControl } from './validator-common';

@Component({
    selector: 'validate-error',
    template: `
        <div *ngIf="showErrors()" class="validator-inline-error error-message" >
          {{errors()[0]}}
        </div>
    `,
    imports: [CommonModule]
})
export class ValidateErrorComponent {
    private static readonly errorMessages: ErrorMessages = {
        required: () => 'Field is required.',
        minlength: (params: any) => 'Minimum length is ' + params.requiredLength + ".",
        maxlength: (params: any) => 'Maximum length is ' + params.requiredLength + ".",
        pattern: (params: any) => 'Required pattern is: ' + params.requiredPattern + ".",
        custom: (params: any) => params.message,
        //messasge for ngex-mydatepicker date validation.
        invalidDateFormat: () => 'Invalid date.'
    };

    //@ViewChild('element') element: ElementRef;
    @Input() extControl!: ExtendedControl;

    constructor(private renderer: Renderer2) {
    }
    //ngOnInit() {        
    //}

    showErrors(): boolean {
        let showErr: boolean = false;
        if (this.extControl && this.extControl.control &&
            this.extControl.control.errors &&
            (this.extControl.control.dirty || this.extControl.control.touched) &&
            this.extControl.showInvalid) {
            showErr = true;
        }
        return showErr;
    }

    errors(): string[] {
        if (this.extControl && this.extControl.control && this.extControl.control.errors) {
            return Object.keys(this.extControl.control.errors)
                .map(field => this.getMessage(field, this.extControl.control.errors![field]));
        }
        else {
            return [];
        }
    }

    private getMessage(type: string, params: any) {
        return ValidateErrorComponent.errorMessages[type](params);
    }
}
