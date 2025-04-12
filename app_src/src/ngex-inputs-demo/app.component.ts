import { Component, ViewChild, ElementRef, OnInit, Renderer2, AfterViewInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CommonModule, formatCurrency } from '@angular/common';
import { Validator2, ValidateErrorComponent, ExtendedControl, ValidatorCommon } from
    //'./ngex-input-validator/input-validator.module'; //Local
    'ngex-input-validator';  //Lib
import { InputMaskDirective, InputCurrencyDirective } from
    //'./ngex-input-format/ngex-input-format.module'; //Local
    'ngex-input-format'; //Lib

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ValidateErrorComponent,
            InputMaskDirective, InputCurrencyDirective ]
})
export class AppComponent implements OnInit {
    inputForm!: FormGroup;
    extControlList!: Array<ExtendedControl>;
    focusedControlName: string = '';
    priceModel: any = {};
    priceRawEntry: number = 0;

    @ViewChild('priceElem', { static: true }) priceElem!: ElementRef;
    @ViewChild('phoneElem', { static: true }) phoneElem!: ElementRef;
    @ViewChild('submitButton', { static: true }) submitButton!: ElementRef;

    constructor() {
    }

    ngOnInit() {
        this.priceModel = {
            loadingAmount: 2035,
            maximumAmount: 10000,
            minimumAmount: 1000
        };

        this.inputForm = new FormGroup({
            priceInput: new FormControl(this.priceModel.loadingAmount.toString(), [
                Validator2.required({ label: 'Amount' }),
                Validator2.minCurrency({
                    value: this.priceModel.minimumAmount,
                    message: `Please enter at least ${formatCurrency(this.priceModel.minimumAmount, 'en-US', '$', 'USD', '1.2-2')}`
                }),
                Validator2.maxCurrency({
                    value: this.priceModel.maximumAmount,
                    message: `Please enter amount lower than ${formatCurrency(this.priceModel.maximumAmount, 'en-US', '$', 'USD', '1.2-2')}`
                })
            ]),
            price: new FormControl(''),
            phoneEntry: new FormControl('', [Validator2.usPhone(true)])
        })

        let pThis: any = this;
        this.inputForm.valueChanges.subscribe(value => {
            let ts: any = value;
            let tw: any = pThis.priceElem.nativeElement.value;
        });

        //Add showInvalid property for onBlur display validation error message.         
        this.extControlList = ValidatorCommon.getExtendedControlList(this.inputForm) || [];        
    }

    checkPriceEntry() {
        //Check on-blur.
        let rawEntry: string = this.inputForm.value.priceInput.replace(/[^0-9/.]*/g, '');
        this.priceRawEntry = rawEntry ? parseFloat(rawEntry) : 0;
    }

    isSubmitButtonEnabled(): boolean {
        let rtn: boolean = false;
        if (!this.inputForm.invalid && this.inputForm.dirty) {
            rtn = true;
        }
        return rtn;
    }

    submit() {
        if (!this.isSubmitButtonEnabled()) return;
        let te: any = this.inputForm;
    }

    focusOnElement(elemType: string) {
        //Focus on Submit/Cancel button triggers "on-blur" of previously focused input element.        
        switch (elemType) {
            case 'submit':
                this.submitButton.nativeElement.focus();
                break;
            //case 'cancel':
            //    this.cancelButton.nativeElement.focus();
            //    break;
        }
    }

    getExtendedControl(extControlList: Array<ExtendedControl>, name: string): ExtendedControl {
        return ValidatorCommon.getExtendedControl(this.extControlList, name);
    }

    setFocus(flag: boolean, controlName: string = '', showInvalidOnChange: boolean = false) {
        //Focus on element or make element active.
        //setShowInvalid (error message): not shown until on-blue, or remove error message on-focus.
        if (controlName) {
            let control: FormControl = this.inputForm.get(controlName) as FormControl;
            let extControl: ExtendedControl = this.getExtendedControl(this.extControlList, controlName);                        
            if (flag) {
                //on-focus.
                if (!showInvalidOnChange) {
                    //Use extControl.
                    this.setShowInvalid(extControl, 0)
                }
                this.focusedControlName = controlName;
            }
            else {
                //on-blur
                if (!showInvalidOnChange) {
                    //Use extControl.
                    this.setShowInvalid(extControl, 1)
                }
                this.focusedControlName = '';

                //Call to check amount entry.
                if (controlName == 'priceInput') {
                    this.checkPriceEntry();
                }
            }
        }
    };

    setControlActive(controlName: string): boolean {
        //Return true for an active element.
        let rtn: boolean = false;
        if (controlName == this.focusedControlName || this.inputForm.get(controlName)!.value) {
            rtn = true
        }
        return rtn;
    }

    setShowInvalid(control: any, actionType: number) {
        //Set flag for control to display validation error message.
        //Passed control is extControl.
        if (actionType == 0) {
            control.showInvalid = false;
        }
        else if (actionType == 1) {
            control.showInvalid = true;
        }
    }
}
