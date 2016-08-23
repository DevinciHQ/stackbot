import {Directive, ElementRef, AfterViewInit} from '@angular/core';

@Directive({
  selector: '[focusMe]'
})
export class FocusMeDirective implements AfterViewInit {

    constructor(private elementRef: ElementRef) {}

    ngAfterViewInit() {
      // set focus when element first appears
      this.setFocus();
    }

    setFocus() {
      this.elementRef.nativeElement.focus();
    }
}
