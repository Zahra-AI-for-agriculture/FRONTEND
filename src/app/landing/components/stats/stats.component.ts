import { Component, OnInit, ElementRef } from '@angular/core';
import { LanguageService } from '../../../services/language.service';

interface Stat {
  value: string;
  suffix: string;
  labelKey: string;
  svgPath: string;
  color: string;
}

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  isVisible = false;

  stats: Stat[] = [
    {
      value: '8',
      suffix: '',
      labelKey: 'stats.regions',
      svgPath: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      color: '#4caf50'
    },
    {
      value: '20',
      suffix: '+',
      labelKey: 'stats.crops',
      svgPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      color: '#f9a825'
    },
    {
      value: '30',
      suffix: '%',
      labelKey: 'stats.water',
      svgPath: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
      color: '#00bcd4'
    },
    {
      value: '3',
      suffix: 's',
      labelKey: 'stats.fast',
      svgPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
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
      { threshold: 0.2 }
    );
    observer.observe(this.el.nativeElement);
  }
}
