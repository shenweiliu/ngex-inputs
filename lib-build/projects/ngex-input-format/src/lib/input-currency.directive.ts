import { Directive, HostListener, Input, Output, ElementRef, OnInit, EventEmitter } from '@angular/core';
import { AbstractControl } from '@angular/forms';


@Directive({
    selector: 'input[inputCurrency]'
})
export class InputCurrencyDirective implements OnInit {
    @Input('inputCurrency') currencySymbol: string = '';
    @Input() notShowCommas: boolean = false;
    @Input() notPendZeros: boolean = false;
    @Input() rawDataControl!: AbstractControl;
    @Output() inputCurrencyChanged: EventEmitter<string> = new EventEmitter<string>();
    entryValue: string = '';

    constructor(private elemRef: ElementRef) { }

    ngOnInit() {
        //Default to USD.
        if (!this.currencySymbol) {
            this.currencySymbol = '$';
        }
        //Add comma for thousands and currency symbol into any value when loading.
        if (this.elemRef.nativeElement.value) {
            if (this.elemRef.nativeElement.value.indexOf(',') < 0) {
                this.elemRef.nativeElement.value = this.elemRef.nativeElement.value.replace(this.currencySymbol, '')
                this.elemRef.nativeElement.value = this.addCommaForThousands(this.elemRef.nativeElement.value);
            }
            if (this.elemRef.nativeElement.value.indexOf(this.currencySymbol) < 0) {
                this.elemRef.nativeElement.value = this.currencySymbol + this.elemRef.nativeElement.value;
            }            
        }
    }

    addCommaForThousands(existingValue: string): string {
        let newValue: string = existingValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return newValue;
    }

    @HostListener('input', ['$event']) onInputChanged() {
        //Unlike numberOnly directive, this needs work processes with DOM element since code-updated value here
        //is linked to DOM element and display.
        //Reactive form control value will be real user input value and don't need other manipulations.
        const initalValue: string = this.elemRef.nativeElement.value.replace(this.currencySymbol, '');

        let newValue: string = initalValue.replace(/[^0-9/.]*/g, '');        

        //Allow only one dot after 1 digit and up to two decimals.
        const dotPos: number = newValue.indexOf('.');
        if (dotPos > 0) {
            //Do not touch only one dot entry.
            if (dotPos <= newValue.length - 2) {
                if (newValue.substring(newValue.length - 1) == '.' ||
                    newValue.length > dotPos + 3) {
                    //newValue.length > dotPos + 3 is for two decimal entry (3 - 1 = 2).
                    newValue = newValue.substring(0, newValue.length - 1);
                }
            }
        }
        else if (dotPos == 0) {
            newValue = '';
        }

        ////Do not update raw value on-change.
        ////For reactive form, save to additional control as rawDataControl.
        //if (this.rawDataControl) {
        //    this.rawDataControl.setValue(newValue);
        //}
        //else {
        //    //Send pure number value back to parent used for updating model value.
        //    this.inputCurrencyChanged.emit(newValue);
        //}  

        //Update class-level raw entryValue.
        this.entryValue = newValue;

        //Add commas as thousand separators.
        if (!this.notShowCommas) {
            newValue = this.addCommaForThousands(newValue);
        }

        this.elemRef.nativeElement.value = newValue ? this.currencySymbol + newValue : '';        
    }

    @HostListener('blur') onBlur() {
        if (this.elemRef.nativeElement.value && !this.notPendZeros) {
            const dotPos: number = this.elemRef.nativeElement.value.indexOf('.');
            let pendDecimal: string = '';
            if (dotPos > 0) {
                if (dotPos == this.elemRef.nativeElement.value.length - 2) {
                    pendDecimal = '0';                    
                }
            }
            else {
                pendDecimal = '.00';               
            }        
            this.elemRef.nativeElement.value += pendDecimal;

            if (this.rawDataControl) {
                this.rawDataControl.setValue(this.entryValue + pendDecimal);
            }
            else {
                //Send pure number value back to parent used for updating model value.
                this.inputCurrencyChanged.emit(this.entryValue + pendDecimal);
            }
        }   
    }
}
