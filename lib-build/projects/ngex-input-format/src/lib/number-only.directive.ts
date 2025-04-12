import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
    selector: 'input[numberOnly]'
})
export class NumberOnlyDirective {
    //If not process with the input control, reactive form control will have any non-numeric inputs.
    //Need to refresh the input data with the real form control.
    @Input('numberOnly') inputControl!: AbstractControl;

    constructor(private elemRef: ElementRef) { }

    @HostListener('input', ['$event']) onInputChanged() {
        const initalValue: string = this.elemRef.nativeElement.value;

        const newValue: string = initalValue.replace(/[^0-9]*/g, '');

        this.elemRef.nativeElement.value = newValue;

        //Sync reactive form control value.
        if (this.inputControl) {
            this.inputControl.setValue(newValue);
        }        
    }
}
