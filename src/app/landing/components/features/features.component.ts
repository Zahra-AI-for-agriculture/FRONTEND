import { Component, OnInit, ElementRef } from '@angular/core';
import { LanguageService } from '../../../services/language.service';

interface MLModel {
  id: string;
  tag: string;
  svgPaths: string[];
  accentColor: string;
  titleKey: string;
  hookKey: string;
  metricValue: string;
  metricLabelKey: string;
  inputKey: string;
  outputKey: string;
  featured?: boolean;
}

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent implements OnInit {
  isVisible = false;

  models: MLModel[] = [
    {
      id: 'disease',
      tag: 'M1',
      svgPaths: ['M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'M21 21l-4.35-4.35'],
      accentColor: '#4caf50',
      titleKey: 'model.disease.title',
      hookKey: 'model.disease.hook',
      metricValue: '98.6%',
      metricLabelKey: 'model.disease.metric',
      inputKey: 'model.disease.input',
      outputKey: 'model.disease.output',
      featured: true
    },
    {
      id: 'yield',
      tag: 'M2',
      svgPaths: ['M23 6l-9.5 9.5-5-5L1 18', 'M17 6h6v6'],
      accentColor: '#f9a825',
      titleKey: 'model.yield.title',
      hookKey: 'model.yield.hook',
      metricValue: 'R² 0.95',
      metricLabelKey: 'model.yield.metric',
      inputKey: 'model.yield.input',
      outputKey: 'model.yield.output'
    },
    {
      id: 'drought',
      tag: 'M3',
      svgPaths: ['M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z'],
      accentColor: '#ff7043',
      titleKey: 'model.drought.title',
      hookKey: 'model.drought.hook',
      metricValue: 'MAE 0.46',
      metricLabelKey: 'model.drought.metric',
      inputKey: 'model.drought.input',
      outputKey: 'model.drought.output'
    },
    {
      id: 'segmentation',
      tag: 'M4',
      svgPaths: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
      accentColor: '#ab47bc',
      titleKey: 'model.segmentation.title',
      hookKey: 'model.segmentation.hook',
      metricValue: '99.1%',
      metricLabelKey: 'model.segmentation.metric',
      inputKey: 'model.segmentation.input',
      outputKey: 'model.segmentation.output'
    },
    {
      id: 'irrigation',
      tag: 'M5',
      svgPaths: ['M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'],
      accentColor: '#00bcd4',
      titleKey: 'model.irrigation.title',
      hookKey: 'model.irrigation.hook',
      metricValue: '0.52mm',
      metricLabelKey: 'model.irrigation.metric',
      inputKey: 'model.irrigation.input',
      outputKey: 'model.irrigation.output'
    },
    {
      id: 'ndvi',
      tag: 'M6',
      svgPaths: ['M22 12h-4l-3 9L9 3l-3 9H2'],
      accentColor: '#29b6f6',
      titleKey: 'model.ndvi.title',
      hookKey: 'model.ndvi.hook',
      metricValue: '99.7%',
      metricLabelKey: 'model.ndvi.metric',
      inputKey: 'model.ndvi.input',
      outputKey: 'model.ndvi.output'
    },
    {
      id: 'pest',
      tag: 'M7',
      svgPaths: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
      accentColor: '#ef5350',
      titleKey: 'model.pest.title',
      hookKey: 'model.pest.hook',
      metricValue: '73.5%',
      metricLabelKey: 'model.pest.metric',
      inputKey: 'model.pest.input',
      outputKey: 'model.pest.output'
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
      { threshold: 0.1 }
    );
    observer.observe(this.el.nativeElement);
  }
}