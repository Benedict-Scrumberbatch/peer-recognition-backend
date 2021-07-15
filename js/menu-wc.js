'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">@Benedict-Scrumberbatch/peer-recognition-backend documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter additional">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#additional-pages"'
                            : 'data-target="#xs-additional-pages"' }>
                            <span class="icon ion-ios-book"></span>
                            <span>Additional documentation</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="additional-pages"' : 'id="xs-additional-pages"' }>
                                    <li class="link ">
                                        <a href="additional-documentation/swagger-api-docs.html" data-type="entity-link" data-context-id="additional">Swagger API Docs</a>
                                    </li>
                        </ul>
                    </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-AppModule-cb4cc965d5b7fe8bb79ffcdcc06e3e97"' : 'data-target="#xs-controllers-links-module-AppModule-cb4cc965d5b7fe8bb79ffcdcc06e3e97"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-cb4cc965d5b7fe8bb79ffcdcc06e3e97"' :
                                            'id="xs-controllers-links-module-AppModule-cb4cc965d5b7fe8bb79ffcdcc06e3e97"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AppModule-cb4cc965d5b7fe8bb79ffcdcc06e3e97"' : 'data-target="#xs-injectables-links-module-AppModule-cb4cc965d5b7fe8bb79ffcdcc06e3e97"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-cb4cc965d5b7fe8bb79ffcdcc06e3e97"' :
                                        'id="xs-injectables-links-module-AppModule-cb4cc965d5b7fe8bb79ffcdcc06e3e97"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link">AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-AuthModule-f3a6df0d3d2af3919a2264b9a556bf01"' : 'data-target="#xs-controllers-links-module-AuthModule-f3a6df0d3d2af3919a2264b9a556bf01"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-f3a6df0d3d2af3919a2264b9a556bf01"' :
                                            'id="xs-controllers-links-module-AuthModule-f3a6df0d3d2af3919a2264b9a556bf01"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AuthModule-f3a6df0d3d2af3919a2264b9a556bf01"' : 'data-target="#xs-injectables-links-module-AuthModule-f3a6df0d3d2af3919a2264b9a556bf01"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-f3a6df0d3d2af3919a2264b9a556bf01"' :
                                        'id="xs-injectables-links-module-AuthModule-f3a6df0d3d2af3919a2264b9a556bf01"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtRefreshTokenStrategy.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>JwtRefreshTokenStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>JwtStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LocalStrategy.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>LocalStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CompanyModule.html" data-type="entity-link">CompanyModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-CompanyModule-a4982230d53d5f7ac41ddbd910875308"' : 'data-target="#xs-controllers-links-module-CompanyModule-a4982230d53d5f7ac41ddbd910875308"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CompanyModule-a4982230d53d5f7ac41ddbd910875308"' :
                                            'id="xs-controllers-links-module-CompanyModule-a4982230d53d5f7ac41ddbd910875308"' }>
                                            <li class="link">
                                                <a href="controllers/CompanyController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CompanyController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-CompanyModule-a4982230d53d5f7ac41ddbd910875308"' : 'data-target="#xs-injectables-links-module-CompanyModule-a4982230d53d5f7ac41ddbd910875308"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CompanyModule-a4982230d53d5f7ac41ddbd910875308"' :
                                        'id="xs-injectables-links-module-CompanyModule-a4982230d53d5f7ac41ddbd910875308"' }>
                                        <li class="link">
                                            <a href="injectables/CompanyService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>CompanyService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TagService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>TagService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/NotificationsModule.html" data-type="entity-link">NotificationsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-NotificationsModule-0568403c89f617e7ed272ce118db6026"' : 'data-target="#xs-controllers-links-module-NotificationsModule-0568403c89f617e7ed272ce118db6026"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-NotificationsModule-0568403c89f617e7ed272ce118db6026"' :
                                            'id="xs-controllers-links-module-NotificationsModule-0568403c89f617e7ed272ce118db6026"' }>
                                            <li class="link">
                                                <a href="controllers/NotificationsController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">NotificationsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-NotificationsModule-0568403c89f617e7ed272ce118db6026"' : 'data-target="#xs-injectables-links-module-NotificationsModule-0568403c89f617e7ed272ce118db6026"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-NotificationsModule-0568403c89f617e7ed272ce118db6026"' :
                                        'id="xs-injectables-links-module-NotificationsModule-0568403c89f617e7ed272ce118db6026"' }>
                                        <li class="link">
                                            <a href="injectables/NotificationsService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>NotificationsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RecognitionModule.html" data-type="entity-link">RecognitionModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-RecognitionModule-cb4a7a68d19af5adee0a2ddb6da17473"' : 'data-target="#xs-controllers-links-module-RecognitionModule-cb4a7a68d19af5adee0a2ddb6da17473"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-RecognitionModule-cb4a7a68d19af5adee0a2ddb6da17473"' :
                                            'id="xs-controllers-links-module-RecognitionModule-cb4a7a68d19af5adee0a2ddb6da17473"' }>
                                            <li class="link">
                                                <a href="controllers/RecognitionController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">RecognitionController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-RecognitionModule-cb4a7a68d19af5adee0a2ddb6da17473"' : 'data-target="#xs-injectables-links-module-RecognitionModule-cb4a7a68d19af5adee0a2ddb6da17473"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RecognitionModule-cb4a7a68d19af5adee0a2ddb6da17473"' :
                                        'id="xs-injectables-links-module-RecognitionModule-cb4a7a68d19af5adee0a2ddb6da17473"' }>
                                        <li class="link">
                                            <a href="injectables/RecognitionService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>RecognitionService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RockstarModule.html" data-type="entity-link">RockstarModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-RockstarModule-94301bf52d09a8c1127ad44d24241d88"' : 'data-target="#xs-controllers-links-module-RockstarModule-94301bf52d09a8c1127ad44d24241d88"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-RockstarModule-94301bf52d09a8c1127ad44d24241d88"' :
                                            'id="xs-controllers-links-module-RockstarModule-94301bf52d09a8c1127ad44d24241d88"' }>
                                            <li class="link">
                                                <a href="controllers/RockstarController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">RockstarController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-RockstarModule-94301bf52d09a8c1127ad44d24241d88"' : 'data-target="#xs-injectables-links-module-RockstarModule-94301bf52d09a8c1127ad44d24241d88"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RockstarModule-94301bf52d09a8c1127ad44d24241d88"' :
                                        'id="xs-injectables-links-module-RockstarModule-94301bf52d09a8c1127ad44d24241d88"' }>
                                        <li class="link">
                                            <a href="injectables/RockstarService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>RockstarService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TagModule.html" data-type="entity-link">TagModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-TagModule-1826bbe45d901c8371141db20436f05c"' : 'data-target="#xs-controllers-links-module-TagModule-1826bbe45d901c8371141db20436f05c"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-TagModule-1826bbe45d901c8371141db20436f05c"' :
                                            'id="xs-controllers-links-module-TagModule-1826bbe45d901c8371141db20436f05c"' }>
                                            <li class="link">
                                                <a href="controllers/TagController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TagController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-TagModule-1826bbe45d901c8371141db20436f05c"' : 'data-target="#xs-injectables-links-module-TagModule-1826bbe45d901c8371141db20436f05c"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TagModule-1826bbe45d901c8371141db20436f05c"' :
                                        'id="xs-injectables-links-module-TagModule-1826bbe45d901c8371141db20436f05c"' }>
                                        <li class="link">
                                            <a href="injectables/TagService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>TagService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link">UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-UsersModule-96ae83d688a4d2b30fa5adb39fbb2321"' : 'data-target="#xs-controllers-links-module-UsersModule-96ae83d688a4d2b30fa5adb39fbb2321"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-96ae83d688a4d2b30fa5adb39fbb2321"' :
                                            'id="xs-controllers-links-module-UsersModule-96ae83d688a4d2b30fa5adb39fbb2321"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-UsersModule-96ae83d688a4d2b30fa5adb39fbb2321"' : 'data-target="#xs-injectables-links-module-UsersModule-96ae83d688a4d2b30fa5adb39fbb2321"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-96ae83d688a4d2b30fa5adb39fbb2321"' :
                                        'id="xs-injectables-links-module-UsersModule-96ae83d688a4d2b30fa5adb39fbb2321"' }>
                                        <li class="link">
                                            <a href="injectables/UsersService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/authDto.html" data-type="entity-link">authDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/authDtoFull.html" data-type="entity-link">authDtoFull</a>
                            </li>
                            <li class="link">
                                <a href="classes/Comment.html" data-type="entity-link">Comment</a>
                            </li>
                            <li class="link">
                                <a href="classes/Company.html" data-type="entity-link">Company</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateRecDto.html" data-type="entity-link">CreateRecDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/EditLoginDto.html" data-type="entity-link">EditLoginDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Login.html" data-type="entity-link">Login</a>
                            </li>
                            <li class="link">
                                <a href="classes/Reaction.html" data-type="entity-link">Reaction</a>
                            </li>
                            <li class="link">
                                <a href="classes/Recognition.html" data-type="entity-link">Recognition</a>
                            </li>
                            <li class="link">
                                <a href="classes/RecognitionPagination.html" data-type="entity-link">RecognitionPagination</a>
                            </li>
                            <li class="link">
                                <a href="classes/Report.html" data-type="entity-link">Report</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReturnRockstarDto.html" data-type="entity-link">ReturnRockstarDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Rockstar.html" data-type="entity-link">Rockstar</a>
                            </li>
                            <li class="link">
                                <a href="classes/RockstarStats.html" data-type="entity-link">RockstarStats</a>
                            </li>
                            <li class="link">
                                <a href="classes/Tag.html" data-type="entity-link">Tag</a>
                            </li>
                            <li class="link">
                                <a href="classes/TagStats.html" data-type="entity-link">TagStats</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserNotification.html" data-type="entity-link">UserNotification</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserPagination.html" data-type="entity-link">UserPagination</a>
                            </li>
                            <li class="link">
                                <a href="classes/Users.html" data-type="entity-link">Users</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/JwtAuthGuard.html" data-type="entity-link">JwtAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtAuthRefreshGuard.html" data-type="entity-link">JwtAuthRefreshGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalAuthGuard.html" data-type="entity-link">LocalAuthGuard</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/RolesGuard.html" data-type="entity-link">RolesGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/UserStats.html" data-type="entity-link">UserStats</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});