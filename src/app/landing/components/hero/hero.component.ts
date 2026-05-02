import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit {
  isVisible = false;

  constructor(public lang: LanguageService) {}

  ngOnInit(): void {
    // Stagger the reveal animation slightly after component mounts
    setTimeout(() => {
      this.isVisible = true;
    }, 200);
  }

  scrollTo(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}