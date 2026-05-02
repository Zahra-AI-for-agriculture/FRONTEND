import { Component, OnInit } from '@angular/core';
import { AIService } from '../../services/ai.service';

@Component({
  selector: 'app-drought',
  templateUrl: './drought.component.html',
  styleUrls: ['./drought.component.css']
})
export class DroughtComponent implements OnInit {
  city = localStorage.getItem('zahra_governorate') || 'Tunis';
  drought: any = null;
  isLoading = true;

  constructor(private aiService: AIService) {}

  ngOnInit() {
    this.aiService.getCurrentDrought(this.city).subscribe({
      next: (d) => { this.drought = d; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  getSpiColor(level: string): string {
    const map: Record<string,string> = {
      'normal': '#10b981', 'modéré': '#f59e0b',
      'sévère': '#ef4444', 'extrême': '#7f1d1d'
    };
    return map[level] || '#6b7280';
  }
}