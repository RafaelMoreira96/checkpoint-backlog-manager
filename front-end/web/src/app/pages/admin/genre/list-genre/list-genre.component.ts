import { Component, OnInit } from '@angular/core';
import { Genre } from '../../../../models/genre';
import { GenreService } from '../../../../services/genre.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-genre',
  templateUrl: './list-genre.component.html',
  styleUrls: ['./list-genre.component.css'],
})
export class ListGenreComponent implements OnInit {
  genreList: Genre[] = [];
  selectedGenreId: number | null = null;

  constructor(
    private service: GenreService,
    private router: Router,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.getGenres();
  }

  getGenres() {
    this.service.getGenres().subscribe(
      (result: any) => {
        this.genreList = result;
      },
      (error) => {
        this.toast.error('Erro ao carregar os gêneros', 'Erro');
      }
    );
  }

  openModal(id: number): void {
    this.selectedGenreId = id;
  }

  removeGenre() {
    if (this.selectedGenreId !== null) {
      this.service.deleteGenre(this.selectedGenreId).subscribe(
        () => {
          this.toast.success('Gênero removido com sucesso');
          this.getGenres();
          this.selectedGenreId = null;
        },
        (error) => {
          this.toast.error('Erro ao remover o gênero', 'Erro');
        }
      );
    }
  }

  editGenre(genre: Genre) {
    this.router.navigate(['admin/register-genre/', genre.id_genre]);
  }
}
