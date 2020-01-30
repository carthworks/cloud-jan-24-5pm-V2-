import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appPreloader]'
})
export class PreloaderDirective implements OnInit {
  @Input() name: string;
  @Input() value: string;

  constructor(private el: ElementRef) {
    //console.log(el);
    // alert(el);
    //el.nativeElement.style.background='red';


  }
  ngOnInit() {
    //console.log("input-box keys  : ", this.name, this.value);
    //alert('preloader');
    //called after the constructor and called  after the first ngOnChanges() 

  }

  @HostListener('mouseenter') onMouseEnter() {
    alert('onmouseenter' + this.name);

  }

}
