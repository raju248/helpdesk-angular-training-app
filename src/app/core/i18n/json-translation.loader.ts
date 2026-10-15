import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class JsonTranslationLoader implements TranslateLoader {
  private readonly http = inject(HttpClient);

  getTranslation(language: string): Observable<TranslationObject> {
    return this.http.get<TranslationObject>(`./i18n/${language}.json`);
  }
}
