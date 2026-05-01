import { Component, OnInit, ElementRef } from '@angular/core';
import { LanguageService } from '../../../services/language.service';

interface Feature {
  svgPath: string;
  titleKey: string;
  actionKey: string;
  gradient: string;
  iconColor: string;
}

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent implements OnInit {
  isVisible = false;

  features: Feature[] = [
    {
      svgPath: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
      titleKey: 'feature.disease.title',
      actionKey: 'feature.disease.action',
      gradient: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05))',
      iconColor: '#4caf50'
    },
    {
      svgPath: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v16 M16 6v16',
      titleKey: 'feature.ndvi.title',
      actionKey: 'feature.ndvi.action',
      gradient: 'linear-gradient(135deg, rgba(41, 182, 246, 0.15), rgba(41, 182, 246, 0.05))',
      iconColor: '#29b6f6'
    },
    {
      svgPath: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
      titleKey: 'feature.irrigation.title',
      actionKey: 'feature.irrigation.action',
      gradient: 'linear-gradient(135deg, rgba(0, 188, 212, 0.15), rgba(0, 188, 212, 0.05))',
      iconColor: '#00bcd4'
    },
    {
      svgPath: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
      titleKey: 'feature.weather.title',
      actionKey: 'feature.weather.action',
      gradient: 'linear-gradient(135deg, rgba(249, 168, 37, 0.15), rgba(249, 168, 37, 0.05))',
      iconColor: '#f9a825'
    },
    {
      svgPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      titleKey: 'feature.market.title',
      actionKey: 'feature.market.action',
      gradient: 'linear-gradient(135deg, rgba(255, 183, 77, 0.15), rgba(255, 183, 77, 0.05))',
      iconColor: '#ffb74d'
    },
    {
      svgPath: 'M1 1l22 22 M16.72 11.06A10.94 10.94 0 0 1 19 12.55 M5 12.55a10.94 10.94 0 0 1 5.17-2.39 M10.71 5.05A16 16 0 0 1 22.56 9 M1.42 9a15.91 15.91 0 0 1 4.7-2.88 M8.53 16.11a6 6 0 0 1 6.95 0 M12 20h.01',
      titleKey: 'feature.offline.title',
      actionKey: 'feature.offline.action',
      gradient: 'linear-gradient(135deg, rgba(141, 110, 99, 0.15), rgba(141, 110, 99, 0.05))',
      iconColor: '#8d6e63'
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
