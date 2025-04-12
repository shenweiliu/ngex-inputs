import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
    selector: 'input[alphabetNumberOnly]'
})
export class AlphabetNumberOnlyDirective {
    @Input('alphabetNumberOnly') inputControl!: AbstractControl;

    constructor(private elemRef: ElementRef) { }

    @HostListener('input', ['$event']) onInputChanged() {
        const initalValue: string = this.elemRef.nativeElement.value;

        const newValue: string = initalValue.replace(/[^0-9a-zA-Z ]/g, '');

        this.elemRef.nativeElement.value = newValue;

        //Sync reactive form control value.
        if (this.inputControl) {
            this.inputControl.setValue(newValue);
        }        
    }
}
