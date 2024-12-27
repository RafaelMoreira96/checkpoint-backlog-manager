import { Component, OnInit } from '@angular/core';
import { LandingPageFunctionsService } from '../../../services/landing-page-functions.service';

interface InfoStat {
  registeredPlayers: number;
  beatedGames: number;
  totalHours: number;
}
@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
})
export class IndexComponent implements OnInit {
  infoStat: InfoStat | undefined;

  faqItems = [
    {
      title: 'Este projeto é pago?',
      content:
        'Não, o projeto não é pago, ele é gratuito, porém, nesta versão beta, pode ocorrer de ter delay na hora de carregar seu perfil. No momento, o projeto está utilizando-se de servidores gratuitos.',
    },
    {
      title: 'Quero ajudar a manter o projeto, como faço?',
      content:
        'Em breve, irei disponibilizar alguma forma para que seja possível poder ajudar o site financeiramente, seja com um real ou com dez reais. Esse valor será útil para ajudar o programador a conseguir manter o site no ar.',
    },
    {
      title: 'Encontrei um bug, como reportar?',
      content:
        'Não existem bugs neste site, seu mentiroso... Brincadeiras a parte, iremos disponibilizar uma parte no sistema onde você pode reportar eventuais bugs ou problemas no site.',
    },
    {
      title: 'O projeto será só sobre criar lista de jogos zerados e backlog?',
      content:
        "O motivo dele existir é para exatamente isso. Entretanto, depois de refinar melhor este projeto, existem planos de criar sessões de 'detonado' dos jogos, reviews e até mesmo fóruns. Não é o foco ainda, mas basicamente existe o plano para isso.",
    },
    {
      title: 'Eu consigo ver o perfil dos outros?',
      content:
        'Por enquanto, essa função ainda não existe. Estamos trabalhando nisso para que fique melhor para o usuário.',
    },
    {
      title:
        'Existe algum grupo no Telegram/WhatsApp ou algum server do Discord em que eu possa entrar?',
      content: 'Por enquanto, ainda não, mas está nos planos.',
    },
  ];

  constructor(private service: LandingPageFunctionsService) {}

  ngOnInit(): void {
    this.getStats();
  }

  getStats() {
    this.service.getStats().subscribe((result: any) => {
      if (result) {
        this.infoStat = {
          registeredPlayers: result.registered_players,
          beatedGames: result.beated_games,
          totalHours: result.hours_played,
        };
      }
      console.log(this.infoStat);
    });
  }
}
