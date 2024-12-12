export class Player {
    id_player: number; 
    name_player: string; 
    email: string; 
    nickname: string;
    password: string;
    is_active: boolean;
    created_at: Date; 
    updated_at: Date; 
  
    constructor() {
      this.id_player = 0;
      this.name_player = '';
      this.email = '';
      this.nickname = '';
      this.password = '';
      this.is_active = true;
      this.created_at = new Date();
      this.updated_at = new Date();
    }
  }
  