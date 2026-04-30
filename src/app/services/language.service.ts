import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'fr' | 'ar';

export interface Translations {
  [key: string]: {
    fr: string;
    ar: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLang = new BehaviorSubject<Language>('ar');
  currentLang$ = this.currentLang.asObservable();

  private translations: Translations = {
    // ──── NAV ────
    'nav.features': {
      fr: 'Avantages',
      ar: 'المزايا'
    },
    'nav.solution': {
      fr: 'Comment',
      ar: 'كيفاش'
    },
    'nav.stats': {
      fr: 'Chiffres',
      ar: 'أرقام'
    },
    'nav.contact': {
      fr: 'Contact',
      ar: 'تواصل'
    },

    // ──── HERO ────
    'hero.headline': {
      fr: 'Votre terre, plus forte',
      ar: 'أرضك، أقوى'
    },
    'hero.subheadline': {
      fr: 'Photographiez. Comprenez. Agissez.',
      ar: 'صوّر. افهم. اعمل.'
    },
    'hero.cta': {
      fr: 'Essayer maintenant',
      ar: 'جرّب توّا'
    },
    'hero.cta_secondary': {
      fr: 'Voir comment',
      ar: 'شوف كيفاش'
    },
    'hero.badge': {
      fr: 'Pour les agriculteurs',
      ar: 'للفلاحين'
    },

    // ──── PIPELINE ────
    'pipeline.title': {
      fr: 'Simple comme 1-2-3-4',
      ar: 'ساهل كيف 1-2-3-4'
    },
    'pipeline.step1.title': {
      fr: 'Photographiez',
      ar: 'صوّر'
    },
    'pipeline.step2.title': {
      fr: 'On trouve',
      ar: 'نلقاو المشكل'
    },
    'pipeline.step3.title': {
      fr: 'On vous dit',
      ar: 'نقولولك'
    },
    'pipeline.step4.title': {
      fr: 'On vous aide',
      ar: 'نعاونوك'
    },

    // ──── FEATURES ────
    'features.title': {
      fr: 'Tout dans une app',
      ar: 'الكل في تطبيق واحد'
    },
    'feature.disease.title': {
      fr: 'Trouver la maladie',
      ar: 'لقا المرض'
    },
    'feature.disease.action': {
      fr: 'Photo de la plante',
      ar: 'صوّر النبتة'
    },
    'feature.ndvi.title': {
      fr: 'Santé du champ',
      ar: 'صحّة الغلّة'
    },
    'feature.ndvi.action': {
      fr: 'Voir la carte',
      ar: 'شوف الخريطة'
    },
    'feature.irrigation.title': {
      fr: 'Quand arroser',
      ar: 'وقتاش تسقي'
    },
    'feature.irrigation.action': {
      fr: 'Alerte automatique',
      ar: 'تنبيه وحدو'
    },
    'feature.weather.title': {
      fr: 'Alertes',
      ar: 'تنبيهات'
    },
    'feature.weather.action': {
      fr: 'Avant le danger',
      ar: 'قبل الخطر'
    },
    'feature.market.title': {
      fr: 'Prix du marché',
      ar: 'أسعار السوق'
    },
    'feature.market.action': {
      fr: 'Vendre mieux',
      ar: 'بيع خير'
    },
    'feature.offline.title': {
      fr: 'Sans internet',
      ar: 'بلا أنترنات'
    },
    'feature.offline.action': {
      fr: 'Toujours prêt',
      ar: 'ديما جاهز'
    },

    // ──── STATS ────
    'stats.regions': {
      fr: 'régions',
      ar: 'ولاية'
    },
    'stats.crops': {
      fr: 'cultures',
      ar: 'نوع زرع'
    },
    'stats.water': {
      fr: "d'eau économisée",
      ar: 'توفير ماء'
    },
    'stats.fast': {
      fr: 'secondes',
      ar: 'ثواني'
    },

    // ──── PROBLEM / STORY ────
    'problem.title': {
      fr: "L'histoire de Mohamed",
      ar: 'قصّة محمد'
    },
    'problem.who': {
      fr: 'Agriculteur, Sidi Bouzid',
      ar: 'فلاح، سيدي بوزيد'
    },
    'problem.pain1': {
      fr: 'Maladie trop tard',
      ar: 'مرض فات الوقت'
    },
    'problem.pain2': {
      fr: 'Trop ou pas assez d\'eau',
      ar: 'ماء برشا ولا قليل'
    },
    'problem.pain3': {
      fr: 'Récolte perdue',
      ar: 'محصول ضاع'
    },
    'problem.solution': {
      fr: 'Avec ZAHRA, il sauve sa récolte.',
      ar: 'بزهرة، ينجّم ينقذ المحصول.'
    },

    // ──── CTA ────
    'cta.title': {
      fr: 'Prêt ?',
      ar: 'مستعد؟'
    },
    'cta.download': {
      fr: 'Essayer',
      ar: 'جرّب'
    },
    'cta.demo': {
      fr: 'Voir',
      ar: 'شوف'
    },
    'cta.contact': {
      fr: 'Contacter',
      ar: 'تواصل'
    },

    // ──── FOOTER ────
    'footer.tagline': {
      fr: 'Pour chaque agriculteur tunisien',
      ar: 'لكل فلاح تونسي'
    },
    'footer.rights': {
      fr: '© 2025 ZAHRA.',
      ar: '© 2025 زهرة.'
    }
  };

  get lang(): Language {
    return this.currentLang.value;
  }

  get isArabic(): boolean {
    return this.currentLang.value === 'ar';
  }

  toggleLanguage(): void {
    const newLang: Language = this.currentLang.value === 'fr' ? 'ar' : 'fr';
    this.currentLang.next(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  }

  t(key: string): string {
    const translation = this.translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[this.currentLang.value];
  }
}
