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
    'hero.headline.start': {
      fr: 'Votre terre,',
      ar: 'أرضك،'
    },
    'hero.headline.highlight': {
      fr: 'plus forte',
      ar: 'أقوى'
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
    'pipeline.step1.desc': {
      fr: 'Prenez une photo de votre plante ou de votre champ avec votre téléphone.',
      ar: 'صوّر نبتتك أو أرضك بتليفونك.'
    },
    'pipeline.step2.title': {
      fr: 'On trouve',
      ar: 'نلقاو المشكل'
    },
    'pipeline.step2.desc': {
      fr: 'Nos 7 modèles IA analysent l\'image et détectent le problème en moins de 3 secondes.',
      ar: '7 نماذج ذكاء اصطناعي يحللو الصورة ويلقاو المشكل في أقل من 3 ثواني.'
    },
    'pipeline.step3.title': {
      fr: 'On vous dit',
      ar: 'نقولولك'
    },
    'pipeline.step3.desc': {
      fr: 'Vous recevez un diagnostic clair : maladie, sécheresse, ravageur ou alerte NDVI.',
      ar: 'تقبض تشخيص واضح: مرض، جفاف، آفة أو تنبيه NDVI.'
    },
    'pipeline.step4.title': {
      fr: 'On vous aide',
      ar: 'نعاونوك'
    },
    'pipeline.step4.desc': {
      fr: 'Traitement, dose d\'irrigation, prévision de récolte — tout ce qu\'il faut pour agir.',
      ar: 'دواء، كمية سقي، توقع محصول — كل ما تحتاجه باش تعمل.'
    },

    // ──── FEATURES ────
    'features.title': {
      fr: '7 modèles IA au service de ta terre',
      ar: '7 نماذج ذكاء اصطناعي في خدمة أرضك'
    },
    'features.badge': {
      fr: 'Intelligence artificielle',
      ar: 'ذكاء اصطناعي'
    },
    'features.subtitle': {
      fr: 'Chaque modèle résout un vrai problème du terrain tunisien',
      ar: 'كل نموذج يحل مشكل حقيقي في الأرض التونسية'
    },

    // M1 — Disease Detection
    'model.disease.title': {
      fr: 'Diagnostic plante',
      ar: 'تشخيص النبتة'
    },
    'model.disease.hook': {
      fr: 'Photo → maladie identifiée en moins de 20ms',
      ar: 'تصويرة → المرض يتحدد في أقل من 20 ميلي ثانية'
    },
    'model.disease.metric': {
      fr: 'précision',
      ar: 'دقة'
    },
    'model.disease.input': {
      fr: '📸 Photo feuille',
      ar: '📸 تصويرة ورقة'
    },
    'model.disease.output': {
      fr: '💊 Maladie + traitement',
      ar: '💊 مرض + دواء'
    },

    // M2 — Crop Yield
    'model.yield.title': {
      fr: 'Prévision récolte',
      ar: 'توقع المحصول'
    },
    'model.yield.hook': {
      fr: 'Estimez votre rendement avant la récolte',
      ar: 'قدّر محصولك قبل الحصاد'
    },
    'model.yield.metric': {
      fr: 'fiabilité',
      ar: 'موثوقية'
    },
    'model.yield.input': {
      fr: '🌱 Culture, météo, sol',
      ar: '🌱 زرع، طقس، تربة'
    },
    'model.yield.output': {
      fr: '📊 T/ha + revenu DT',
      ar: '📊 طن/هكتار + مدخول'
    },

    // M3 — Drought
    'model.drought.title': {
      fr: 'Alerte sécheresse',
      ar: 'تنبيه جفاف'
    },
    'model.drought.hook': {
      fr: 'Prévision à 7, 14 et 30 jours avec SPI',
      ar: 'توقع على 7، 14 و 30 يوم'
    },
    'model.drought.metric': {
      fr: 'erreur SPI',
      ar: 'خطأ SPI'
    },
    'model.drought.input': {
      fr: '🌡️ 90 jours météo',
      ar: '🌡️ 90 يوم طقس'
    },
    'model.drought.output': {
      fr: '⚠️ Niveau risque',
      ar: '⚠️ مستوى الخطر'
    },

    // M4 — Segmentation
    'model.segmentation.title': {
      fr: 'Découpe parcelle',
      ar: 'تقطيع الأرض'
    },
    'model.segmentation.hook': {
      fr: 'Touchez votre champ, on dessine les limites',
      ar: 'حط صبعك على أرضك، نرسمو الحدود'
    },
    'model.segmentation.metric': {
      fr: 'confiance',
      ar: 'ثقة'
    },
    'model.segmentation.input': {
      fr: '🛰️ Satellite + clic',
      ar: '🛰️ ساتاليت + نقرة'
    },
    'model.segmentation.output': {
      fr: '🗺️ Contour + hectares',
      ar: '🗺️ حدود + هكتارات'
    },

    // M5 — Irrigation
    'model.irrigation.title': {
      fr: 'Irrigation intelligente',
      ar: 'سقي ذكي'
    },
    'model.irrigation.hook': {
      fr: '-20% d\'eau, zéro stress hydrique',
      ar: '-20% ما، بلا إجهاد مائي'
    },
    'model.irrigation.metric': {
      fr: 'RMSE/jour',
      ar: 'RMSE/يوم'
    },
    'model.irrigation.input': {
      fr: '🌿 Culture, sol, météo',
      ar: '🌿 زرع، تربة، طقس'
    },
    'model.irrigation.output': {
      fr: '💧 Dose + horaire',
      ar: '💧 كمية + وقت السقي'
    },

    // M6 — NDVI
    'model.ndvi.title': {
      fr: 'Santé végétation',
      ar: 'صحة النبات'
    },
    'model.ndvi.hook': {
      fr: 'Anomalie détectée 5-10 jours avant l\'œil nu',
      ar: 'تكشف المشكل 5-10 أيام قبل العين'
    },
    'model.ndvi.metric': {
      fr: 'rappel',
      ar: 'استرجاع'
    },
    'model.ndvi.input': {
      fr: '📡 NDVI + météo + sol',
      ar: '📡 NDVI + طقس + تربة'
    },
    'model.ndvi.output': {
      fr: '🚨 Alerte + cause',
      ar: '🚨 تنبيه + السبب'
    },

    // M7 — Pest
    'model.pest.title': {
      fr: 'Prédiction ravageurs',
      ar: 'توقع الآفات'
    },
    'model.pest.hook': {
      fr: 'Mouche olive, Tuta, pucerons, criquet, acariens',
      ar: 'ذبانة الزيتون، توتا، من، جراد، عنكبوت'
    },
    'model.pest.metric': {
      fr: 'F1-score',
      ar: 'F1-score'
    },
    'model.pest.input': {
      fr: '🌾 Météo, culture, saison',
      ar: '🌾 طقس، زرع، موسم'
    },
    'model.pest.output': {
      fr: '🛡️ Ravageur + traitement',
      ar: '🛡️ آفة + علاج'
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
      fr: 'Maladie non détectée',
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
