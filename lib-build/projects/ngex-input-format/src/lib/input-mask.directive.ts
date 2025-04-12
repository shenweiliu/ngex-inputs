import { Directive, HostListener, ElementRef, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
    selector: '[inputMask]'
})
export class InputMaskDirective implements OnInit {
    target!: any;
    prevOutputMaskChars: string = '';
    prevSelectionStart: number = 0;
    prevSelectionEnd: number = 0;
    
    //Default to '_' as placeholder char and digits as mask chars.
    //Declare-assigned value for 'inputMask' only taken with square brackets set on template.
    //Thus, better to initiate default value ('_') in ngOninit method.
    //@Input('inputMask') placeholderChar: string = '_';
    @Input('inputMask') placeholderChar: string = '';
    @Input() maskCharPattern: RegExp = /\d/g;
    @Input() maskPlaceholder: string = '';
    @Input() autoConvertMaskType: boolean = false;
    @Input() syncFormControl!: AbstractControl;
    @Output() inputMaskChanged: EventEmitter<string> = new EventEmitter<string>();

    constructor(private element: ElementRef) {
    }        

    ngOnInit() {
        this.target = this.element.nativeElement;

        if (!this.placeholderChar) {
            this.placeholderChar = '_';
        }
        //Element "placeholder" attribute: takes precedence if specified. Will show grayed characters by default.
        //Directive supported "maskPlaceholder" property: must be specified if no "placeholder" is provided. Used for dynamica/in-field labeled element.
        if (this.target.placeholder) {
            this.maskPlaceholder = this.target.placeholder;
        }
    }

    //For input on-change operation only.
    //For validation, use form on-blur validator.
    //If need return isValid flag, raise Output event by the end of method to parent. Then you can use on-blur validations there.
    //let isValid: boolean = (outputMaskChars.length == 0 || outputMaskChars.length == 10);
    doInputMask(target: any) {        
        if (this.maskPlaceholder == '') return;        
        let cursorPos: number = target.selectionStart;        

        let maskCharRtn: any = this.replaceWithMaskChars(target.value);
        if (maskCharRtn.isMaskCharEmpty) {            
            return;
        }
        let workCharList: Array<string> = maskCharRtn.workCharList;
        let outputMaskCharList: Array<string> = maskCharRtn.outputMaskCharList;
        let outputMaskChars: string = outputMaskCharList.join('');
                
        //Reset cursor.
        if (outputMaskChars == this.prevOutputMaskChars && cursorPos > this.prevSelectionStart) {
            //Entered non-mask chars.
            cursorPos = this.prevSelectionStart;
        }
        else {
            //All other conditions.            
            if (!this.isMaskChar(workCharList[cursorPos]) && workCharList[cursorPos] != this.placeholderChar) {
                //Resulted cursor location isn't at mask or placeholder char position (also need to adjust workCharList .
                if (outputMaskChars == this.prevOutputMaskChars) {
                    //Static chars deleted
                    let isDelete: boolean = false;
                    //if (cursorPos == this.prevSelectionStart) {
                    //    //Static char(s) deleted with Delete key or selection.                                            
                    //    for (let idx: number = cursorPos; idx < workCharList.length; idx++) {
                    //        if (this.isMaskChar(workCharList[idx]) || workCharList[idx] == this.placeholderChar) {
                    //            cursorPos = idx;
                    //            isDelete = true;
                    //            break;
                    //        }
                    //    }
                    //}
                    //else
                    if (cursorPos < this.prevSelectionStart) {
                        //Delete with Backspace key.
                        for (let idx: number = cursorPos; idx >= 0; idx--) {
                            if (this.isMaskChar(workCharList[idx]) || workCharList[idx] == this.placeholderChar) {
                                cursorPos = idx;
                                isDelete = true;
                                break;
                            }
                        }
                    }                    

                    if (isDelete && this.prevSelectionEnd == this.prevSelectionStart) {
                        //Since deletion acts on non-mask char, it needs to delete real mask char (not needed for selection).
                        workCharList.splice(cursorPos, 1);
                        workCharList.push(this.placeholderChar);

                        //Refresh outputMaskChars.
                        let workChars: string = workCharList.join('');
                        let result: any = workChars.match(this.maskCharPattern);
                        if (result) {
                            outputMaskChars = result.join('');
                        }

                        //Reprocess for masked chars to resolve position shift issue.
                        //Cursor is not changed in these cases.
                        workCharList = this.maskPlaceholder.split('');
                        let maskCharList: Array<string> = outputMaskChars.split('');
                        if (outputMaskChars.length > 0) {
                            for (let idx: number = 0; idx < workCharList.length; idx++) {
                              if (workCharList[idx] == this.placeholderChar) {
                                    workCharList[idx] = maskCharList.shift()!;
                                    if (maskCharList.length == 0) break;
                                }
                            }
                        }
                    }
                }
                else {
                    //Change in mask chars.                
                    if (outputMaskChars.length > this.prevOutputMaskChars.length ||
                        (outputMaskChars.length == this.prevOutputMaskChars.length &&
                            outputMaskChars != this.prevOutputMaskChars)) {
                       //Add mask chars - if reached full length, then check delta of output mask char strings.                    
                        for (let idx: number = cursorPos; idx < workCharList.length; idx++) {
                            if (this.isMaskChar(workCharList[idx]) || workCharList[idx] == this.placeholderChar) {
                                cursorPos = idx;
                                break;
                            }
                        }
                    }
                    //else if (outputMaskChars.length < this.prevOutputMaskChars.length) {
                    //    //Delete mask chars.
                    //    for (let idx: number = cursorPos; idx >= 0; idx--) {
                    //        if (this.isMaskChar(workCharList[idx]) || workCharList[idx] == this.placeholderChar) {
                    //            cursorPos = idx;
                    //            break;
                    //        }
                    //    }
                    //}
                }
            }
        }        

        let outputValue: string = workCharList.join('');
        target.value = outputValue;
        target.setSelectionRange(cursorPos, cursorPos);

        //Save data for previous operation.
        this.prevOutputMaskChars = outputMaskChars;
        this.prevSelectionStart = cursorPos;
        this.prevSelectionEnd = target.selectionEnd;

        if (this.syncFormControl) {
            //Sync value to reactive form control if provided.
            this.syncFormControl.setValue(outputValue);
        }
        else {
            //Send outputTargetValue back to parent used for updating active form control or model value.
            this.inputMaskChanged.emit(outputValue);
        }        
    }

    replaceWithMaskChars(inputValue: string): any {
        let isMaskCharEmpty: boolean = false;
        //Not use exclusive approach.
        //let inputMaskChars: string = target.value.replace(/\D/g, ''); 
        let inputMaskChars: string = '';
        let result: any = inputValue.match(this.maskCharPattern);
        if (result) {
            inputMaskChars = result.join('');
        }
        
        let workCharList: Array<string> = [];
        let outputMaskCharList: Array<string> = [];
        let inputMaskCharList: Array<string> = inputMaskChars.split('');        
        if (inputMaskCharList.length > 0) {
            workCharList = this.maskPlaceholder.split('');
            //Cannot set cursorPos for replaced char here since there is a condition to delete chars from any position.
            for (let idx: number = 0; idx < workCharList.length; idx++) {
                if (workCharList[idx] == this.placeholderChar) {
                    workCharList[idx] = inputMaskCharList.shift()!;
                    outputMaskCharList.push(workCharList[idx]);
                    if (inputMaskCharList.length == 0) break;
                }
            }            
        }
        else {
            //Entered any non-mask char.
            isMaskCharEmpty = true;

            //Resume back to mask placeholder.
            this.target.value = this.maskPlaceholder;
            //Set cursorPos to first active char.
            this.target.setSelectionRange(0, 0);
            this.setCursorToActiveChar();
            this.savePrevSelectionForCursor();
        }
        return {
            workCharList: workCharList,
            outputMaskCharList: outputMaskCharList,
            isMaskCharEmpty: isMaskCharEmpty
        }
    }

    isMaskChar(char: string): boolean {
        return (this.maskCharPattern).test(char);
    }

    //@HostListener('input', ['$event.target'])
    //onInput(target: any) {
    //    //setTimeout(() => {            
    //    //}, 100);
    //    this.doInputMask(target);
    //}
    @HostListener('input')
    onInput() {        
        if (this.target.value == '') {
            //Handle condition of value deleted, especially with right-side X button.
            this.target.value = this.maskPlaceholder || '';
            this.target.setSelectionRange(0, 0);
            this.setCursorToActiveChar();
            this.savePrevSelectionForCursor();            
        }
        this.doInputMask(this.target);
    }

    @HostListener('focus')
    onFocus() {
        if (this.target.value == '') {
            this.target.value = this.maskPlaceholder || '';
        }
        else {
            if (this.autoConvertMaskType) {
                //Convert other mask type to current type.
                let oldPlaceholder = this.target.value.replace(this.maskCharPattern, this.placeholderChar);
                if (this.maskPlaceholder && oldPlaceholder != this.maskPlaceholder) {
                    let maskCharRtn = this.replaceWithMaskChars(this.target.value);                    
                    this.target.value = maskCharRtn.workCharList.join('');
                }
            }            
        }
        //Disable selection if any when moving Tab key to this element.
        this.target.selectionEnd = this.target.selectionStart;

        //Set cursorPos to first active char.
        this.setCursorToActiveChar();
        this.savePrevSelectionForCursor();
    }

    @HostListener('blur')
    onBlur() {
        if (this.target.value == this.maskPlaceholder) {
            this.target.value = '';
        }        
    }

    @HostListener('mouseup')
    onMouseup() {
        //Visiting element firstly:
        //IE 11: triggers input event, then mouse/key event.
        //Chrome and others: triggers mouse/key event only.  
        this.adjustCursorLocation();        
    }

    @HostListener('keyup', ['$event.key'])
    onKeyup(key: string) {
        //Record cursor position or selection when using arrow key.
        //IE: Right/Left, Chrome and others: 
        if (key == 'Right' || key == 'ArrowRight') {
            this.adjustCursorLocation();
        }
        else if (key == 'Left' || key == 'ArrowLeft') {
            this.adjustCursorLocation(true);
        }
    }

    adjustCursorLocation(isLeftArrow: boolean = false) {
        //Check and bypass cursor on any static char.
        this.setCursorToActiveChar(isLeftArrow);
            
        //Backward adjustment if cursor is in any subsequent placeholder char.
        let firstPlaceholderPos: number = this.target.value.indexOf(this.placeholderChar);
        if (firstPlaceholderPos >= 0 && firstPlaceholderPos < this.target.selectionStart) {
            this.target.selectionStart = firstPlaceholderPos;
            //Disable multiple selection of placeholder chars.
            this.target.selectionEnd = firstPlaceholderPos;
        }
        this.savePrevSelectionForCursor();
    }

    setCursorToActiveChar(isLeftArrow: boolean = false) {
        //Bypass static chars when setting or moving cursor for non-selection operations.
        if (this.target.value && this.target.selectionStart == this.target.selectionEnd) {
            let valueList: Array<string> = this.target.value.split('');
            if (!this.isMaskChar(valueList[this.target.selectionStart]) && valueList[this.target.selectionStart] != this.placeholderChar) {
                if (isLeftArrow && this.target.selectionStart > 0) {
                    //Moving cursor with Left Arrow key except at 0 position.
                    for (let idx: number = this.target.selectionStart; idx >= 0; idx--) {
                        if (this.isMaskChar(valueList[idx]) || valueList[idx] == this.placeholderChar) {
                            this.target.selectionStart = idx;
                            this.target.selectionEnd = idx;
                            break;
                        }
                    }
                }
                else {
                    //Mouse actions, moving with Right Arrow key, or Left Arrow key at 0 position.
                    for (let idx: number = this.target.selectionStart; idx < valueList.length; idx++) {
                        if (this.isMaskChar(valueList[idx]) || valueList[idx] == this.placeholderChar) {
                            this.target.selectionStart = idx;
                            this.target.selectionEnd = idx;
                            break;
                        }
                    }
                }                
            }            
        }        
    }

    savePrevSelectionForCursor() {
        //Set prevCursorPos when clicking on any item in input box.
        //When out-of-focus then re-focus by placing cursor position, prevCursorPos would be that before re-focusing.
        //Need to determine forward/back deletion direction.
        this.prevSelectionStart = this.target.selectionStart;
        this.prevSelectionEnd = this.target.selectionEnd;
    }
} 
