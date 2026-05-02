import { Component, OnInit, ElementRef } from '@angular/core';
import { LanguageService } from '../../../services/language.service';

interface PainPoint {
  svgPath: string;
  textKey: string;
  color: string;
}

@Component({
  selector: 'app-problem',
  templateUrl: './problem.component.html',
  styleUrls: ['./problem.component.css']
})
export class ProblemComponent implements OnInit {
  isVisible = false;

  painPoints: PainPoint[] = [
    {
      svgPath: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
      textKey: 'problem.pain1',
      color: '#ef5350'
    },
    {
      svgPath: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
      textKey: 'problem.pain2',
      color: '#42a5f5'
    },
    {
      svgPath: 'M18 6L6 18 M6 6l12 12',
      textKey: 'problem.pain3',
      color: '#ff9800'
    }
  ];

  constructor(
    public lang: LanguageService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.isVisible = true;
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(this.el.nativeElement);
  }
}
