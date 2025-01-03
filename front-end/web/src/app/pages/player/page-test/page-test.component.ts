import { Component } from '@angular/core';
import { ApiIgdbService } from '../../../services/api-igdb.service';
import { Game } from '../../../models/game';

export interface GameFromIGDBService {
  id: number;
  name: string;
  developer: string;
  url_image: string;
  release_year: number;
}

@Component({
  selector: 'app-page-test',
  templateUrl: './page-test.component.html',
  styleUrls: ['./page-test.component.css'],
})
export class PageTestComponent {
  game: Game = new Game();

  name_game: string = '';
  results_game: GameFromIGDBService[] = [];
  loading = false;

  constructor(private service: ApiIgdbService) {}

  searchFunction() {
    const query = `fields name, cover, first_release_date; limit 15; search "${this.name_game}";`;
    this.loading = true;

    this.service.getGames(query).subscribe(
      (result) => {
        this.results_game = [];
        let requestIndex = 0; // Para controlar a fila de requisições

        if (result) {
          console.log(result);

          const processGame = (game: any) => {
            let gameItem: GameFromIGDBService = {
              id: 0,
              name: '',
              developer: '',
              url_image: '',
              release_year: 0,
            };

            const cover_query = `fields image_id; where game = ${game.id};`;

            // Get Cover
            this.service.getCoverById(cover_query).subscribe(
              (cover: any) => {
                const url_image = cover[0]?.image_id
                  ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${cover[0].image_id}.jpg`
                  : '';

                gameItem.id = game.id;
                gameItem.name = game.name;
                gameItem.url_image = url_image;
                
                if (game.first_release_date) {
                  gameItem.release_year = game.first_release_date;
                } else {
                  gameItem.release_year = 0; // Ou "Sem data", conforme necessidade
                }

                console.log('Game Item:', gameItem);
                this.results_game.push(gameItem);
              },
              (error) => {
                console.error('Error fetching cover:', error);
              }
            );

            // Get Involved Companies
            const companies_query = `fields company.name; where game = ${game.id};`;
            this.service.getInvolvedCompanyById(companies_query).subscribe(
              (company_result: any) => {
                gameItem.developer = company_result[0].company.name;
                console.log('Game Item:', gameItem.developer);
              },
              (error) => {
                console.error('Error fetching companies:', error);
              }
            );
          };

          const processGamesSequentially = () => {
            if (requestIndex < result.length) {
              const game = result[requestIndex];
              processGame(game);
              requestIndex++;
              // Aguarda 250ms antes de processar o próximo jogo (4 requisições por segundo)
              setTimeout(processGamesSequentially, 500);
            } else {
              this.loading = false; // Desativa o carregamento ao finalizar
            }
          };

          processGamesSequentially();
        }
      },
      (error) => {
        console.error('Error fetching games:', error);
        this.loading = false;
      }
    );
  }

  createGameRegisterFunction() {
    throw new Error('Method not implemented.');
  }

  getYearFromUnix(unixTimestamp: number | null): string {
    if (!unixTimestamp || isNaN(unixTimestamp)) {
      return 'Sem data';
    }

    const date = new Date(unixTimestamp * 1000);
    return date.getFullYear().toString();
  }
}
