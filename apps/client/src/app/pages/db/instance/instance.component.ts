import { Component } from '@angular/core';
import { SeoService } from '../../../core/seo/seo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiService } from '@xivapi/angular-client';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable } from 'rxjs';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyInstance } from '@ffxiv-teamcraft/data/model/lazy-instance';
import { I18nName } from '@ffxiv-teamcraft/types';

@Component({
  selector: 'app-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.less']
})
export class InstanceComponent extends TeamcraftPageComponent {

  public lazyInstance$: Observable<LazyInstance>;

  public drops$: Observable<number[]>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private lazyData: LazyDataFacade,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, public settings: SettingsService,
              seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'instances', 'instanceId');

    const instanceId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('instanceId'))
    );

    this.lazyInstance$ = instanceId$.pipe(
      switchMap(id => {
        return this.lazyData.getRow('instances', +id);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.drops$ = instanceId$.pipe(
      switchMap(id => this.lazyData.getRow('reverseInstanceSources', +id))
    );

    this.links$ = this.lazyInstance$.pipe(
      map((instance) => {
        return [
          {
            title: 'GarlandTools',
            url: `https://www.garlandtools.org/db/#instance/${instance.id}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${encodeURIComponent(instance.en.toString().split(' ').join('_'))}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.lazyInstance$.pipe(
      map(instance => {
        return {
          title: this.getName(instance),
          description: this.getDescription(instance),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/instance/${instance.id}/${this.getName(instance).split(' ').join('-')}`,
          image: `https://xivapi.com/${instance.banner}`
        };
      })
    );
  }

  private getDescription(instance: any): string {
    return this.i18n.getName(this.i18n.xivapiToI18n(instance, 'Description'));
  }

  private getName(item: I18nName): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(item);
  }

}
