import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isScrolled = false;
  isMobileMenuOpen = false;
  activeSection = '';

  /** Section IDs to track (in scroll order) */
  private sectionIds = ['pipeline', 'features', 'stats', 'cta-section'];
  private scrollHandler: (() => void) | null = null;
  private ticking = false;

  constructor(public lang: LanguageService) {}

  ngOnInit(): void {
    // Use a passive scroll listener with requestAnimationFrame throttling
    this.scrollHandler = () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.updateScrollState();
          this.ticking = false;
        });
        this.ticking = true;
      }
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  ngOnDestroy(): void {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  /** Update both isScrolled and activeSection */
  private updateScrollState(): void {
    const scrollY = window.scrollY;
    this.isScrolled = scrollY > 50;

    // Determine which section is currently in view
    const offset = window.innerHeight * 0.35; // trigger when 35% from top
    let currentSection = '';

    for (const id of this.sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= offset && rect.bottom > 0) {
          currentSection = id;
        }
      }
    }

    if (this.activeSection !== currentSection) {
      this.activeSection = currentSection;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    // Prevent body scroll when menu is open
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  scrollTo(sectionId: string): void {
    this.closeMobileMenu();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
