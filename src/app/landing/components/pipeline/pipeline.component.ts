import { Component, OnInit, ElementRef } from '@angular/core';
import { LanguageService } from '../../../services/language.service';

interface PipelineStep {
  titleKey: string;
  descKey: string;
  image: string;
  accentColor: string;
  accentGlow: string;
  gradient: string;
}

@Component({
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.css']
})
export class PipelineComponent implements OnInit {
  isVisible = false;

  steps: PipelineStep[] = [
    {
      titleKey: 'pipeline.step1.title',
      descKey:  'pipeline.step1.desc',
      image: 'assets/images/pipeline-step1.png',
      accentColor: '#e68a3a',
      accentGlow: 'rgba(230, 138, 58, 0.40)',
      gradient: 'linear-gradient(-45deg, #e68a3a 0%, #f5c842 100%)'
    },
    {
      titleKey: 'pipeline.step2.title',
      descKey:  'pipeline.step2.desc',
      image: 'assets/images/pipeline-step2.png',
      accentColor: '#e05555',
      accentGlow: 'rgba(224, 85, 85, 0.40)',
      gradient: 'linear-gradient(-45deg, #e05555 0%, #ff8c42 100%)'
    },
    {
      titleKey: 'pipeline.step3.title',
      descKey:  'pipeline.step3.desc',
      image: 'assets/images/pipeline-step3.png',
      accentColor: '#3da5c2',
      accentGlow: 'rgba(61, 165, 194, 0.40)',
      gradient: 'linear-gradient(-45deg, #1a6fa8 0%, #3da5c2 100%)'
    },
    {
      titleKey: 'pipeline.step4.title',
      descKey:  'pipeline.step4.desc',
      image: 'assets/images/pipeline-step4.png',
      accentColor: '#4caf50',
      accentGlow: 'rgba(76, 175, 80, 0.40)',
      gradient: 'linear-gradient(-45deg, #2e7d32 0%, #7AB648 100%)'
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
