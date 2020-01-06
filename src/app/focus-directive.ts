import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { GestureTypes, TouchAction } from 'tns-core-modules/ui/gestures';

@Directive({selector: '[focus]'})
export class FocusDirective implements OnInit {
    private defaultColor = '#000000';
    private color = '#000000';

    constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    }

    ngOnInit(): void {
        const nativeElement = this.elementRef.nativeElement;


        nativeElement.on(GestureTypes.touch, ({action}) => {
            switch (action) {
                case TouchAction.down: {
                    this.renderer.addClass(nativeElement, "highlight");
                    break;
                }
                case TouchAction.up: {
                    setTimeout(() => {
                        this.renderer.removeClass(nativeElement, "highlight");
                    }, 80);
                    break;
                }
                default: {
                    this.renderer.removeClass(nativeElement, "highlight");
                }
            }
        });
    }

    // @Input() set focus(color: string) {
    //     if (color) {
    //         this.color = color;
    //     }
    // }
}
