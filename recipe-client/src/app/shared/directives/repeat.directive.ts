import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appRepeat]',
  standalone: true
})
export class RepeatDirective implements OnInit {
  @Input() appRepeat: number = 0;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit() {
    this.viewContainer.clear();
    for (let i = 0; i < this.appRepeat; i++) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}