import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
export class MyMissingTranslationHandler implements MissingTranslationHandler {
  /**
   *
   */
  constructor() {}
  handle(params: MissingTranslationHandlerParams) {
    console.log(params.key);
    // return params.key;
    const split = params.key.split('.');
    const last = split[split.length - 1];
    return last;
    // if (!environment.production) {
    //   console.log(params.key);
    //   const languageService = InjectorInstance.get<LanguageService>(LanguageService);
    //   const key = params.key.toString();
    //   languageService.addMissingTranslation(params.translateService.currentLang, params.key).subscribe((f) => {
    //     params.translateService.setTranslation(params.translateService.currentLang, { key: key });
    //   });
    // }
    // return params.key;
  }
}
