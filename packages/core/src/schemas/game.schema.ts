import { z } from 'zod';

export const gameFormSchema = z.object({
  name_game: z
    .string({ required_error: 'Nome do jogo é obrigatório' })
    .min(1, 'Nome do jogo não pode ser vazio')
    .max(255, 'Nome muito longo'),
  genre_id: z
    .number({ required_error: 'Gênero é obrigatório' })
    .positive('Selecione um gênero válido'),
  console_id: z
    .number({ required_error: 'Plataforma/Console é obrigatória' })
    .positive('Selecione um console válido'),
  developer: z.string().max(255).optional().or(z.literal('')),
  release_year: z
    .number()
    .int('Ano deve ser inteiro')
    .min(1950, 'Ano deve ser maior que 1950')
    .max(new Date().getFullYear() + 5, 'Ano inválido')
    .optional(),
  time_beating: z
    .number()
    .min(0, 'Tempo não pode ser negativo')
    .optional(),
  date_beating: z.string().optional().or(z.literal('')),
  url_image: z.string().url('URL de imagem inválida').optional().or(z.literal('')),
});

export type GameFormData = z.infer<typeof gameFormSchema>;

export const backlogFormSchema = z.object({
  name_game: z
    .string({ required_error: 'Nome do jogo é obrigatório' })
    .min(1, 'Nome do jogo não pode ser vazio'),
  genre_id: z.number().positive('Selecione um gênero válido'),
  console_id: z.number().positive('Selecione um console válido'),
  developer: z.string().optional().or(z.literal('')),
  release_year: z.number().optional(),
  url_image: z.string().url().optional().or(z.literal('')),
});

export type BacklogFormData = z.infer<typeof backlogFormSchema>;
