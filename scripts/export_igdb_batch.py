#!/usr/bin/env python3
"""
CheckPOINT - Script de Exportação e Enriquecimento em Lote via IGDB
Converte 'Jogos Zerados.xlsx' para CSV e busca dados oficiais (capa, produtora, ano, sinopse) no catálogo IGDB.
"""

import sys
import os
import re
import csv
import json
import time
import zipfile
import datetime
import argparse
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

# Configurações padrão
EXCEL_PATH = "Jogos Zerados.xlsx"
CACHE_FILE = ".igdb_cache.json"
OUTPUT_ENRICHED_CSV = "jogos_zerados_export_igdb.csv"
OUTPUT_CHECKPOINT_CSV = "jogos_zerados_checkpoint_import.csv"
OUTPUT_ORIGINAL_CSV = "jogos_zerados_original.csv"

# Carregar credenciais do .env
def load_env_credentials():
    client_id = os.environ.get("TWITCH_CLIENT_ID")
    client_secret = os.environ.get("TWITCH_CLIENT_SECRET")
    
    env_paths = [".env", "back-end/.env"]
    for path in env_paths:
        if os.path.exists(path) and (not client_id or not client_secret):
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip().strip("\"'")
                    if k == "TWITCH_CLIENT_ID" and not client_id:
                        client_id = v
                    elif k == "TWITCH_CLIENT_SECRET" and not client_secret:
                        client_secret = v

    # Fallbacks conhecidos do repositório
    if not client_id:
        client_id = "zlv00a8uei2v4b7a7nhyqe484c9t1v"
    if not client_secret:
        client_secret = "1omcqufibxh4igw2ar14qbgndaau7i"
        
    return client_id, client_secret


# Autenticação Twitch OAuth
def get_twitch_token(client_id, client_secret):
    data = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "client_credentials"
    }).encode("utf-8")
    
    req = urllib.request.Request("https://id.twitch.tv/oauth2/token", data=data, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            token_data = json.loads(resp.read().decode("utf-8"))
            return token_data.get("access_token")
    except Exception as e:
        print(f"[-] Erro ao autenticar na Twitch OAuth: {e}")
        return None


# Conversão de data serial do Excel (ex: 45960 -> 30/10/2025)
def excel_serial_to_date_str(serial_val):
    if not serial_val:
        return ""
    try:
        val_float = float(serial_val)
        if val_float <= 0:
            return ""
        # 1899-12-30 é a época base do Excel considerando o bug do ano bissexto 1900
        d = datetime.date(1899, 12, 30) + datetime.timedelta(days=int(val_float))
        # Formato esperado pelo CheckPOINT: DD/MM/YYYY
        return d.strftime("%d/%m/%Y")
    except Exception:
        # Se já for string de data
        return str(serial_val).strip()


# Leitura direta do arquivo XLSX sem dependências externas (usa zipfile e xml nativos)
def read_games_from_xlsx(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Arquivo '{file_path}' não encontrado.")

    print(f"[*] Lendo planilha '{file_path}'...")
    with zipfile.ZipFile(file_path) as z:
        # 1. Carregar strings compartilhadas
        shared_strings = []
        if "xl/sharedStrings.xml" in z.namelist():
            tree = ET.fromstring(z.read("xl/sharedStrings.xml"))
            ns = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
            for si in tree.findall(f"{ns}si"):
                text = "".join(t.text for t in si.findall(f".//{ns}t") if t.text)
                shared_strings.append(text)

        # 2. Ler primeira planilha (Jogos Zerados)
        sheet_xml = "xl/worksheets/sheet1.xml"
        tree = ET.fromstring(z.read(sheet_xml))
        ns = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
        rows = tree.findall(f".//{ns}row")

        games = []
        for r in rows:
            r_num = int(r.attrib.get("r", 0))
            if r_num <= 3:
                # Linhas 1-3 são cabeçalhos
                continue

            row_cells = {}
            for c in r.findall(f"{ns}c"):
                ref = c.attrib.get("r", "")
                col_letter = "".join([ch for ch in ref if ch.isalpha()])
                cell_type = c.attrib.get("t")
                v = c.find(f"{ns}v")
                val = v.text if v is not None else None
                if cell_type == "s" and val is not None:
                    val = shared_strings[int(val)]
                row_cells[col_letter] = val

            game_name = row_cells.get("B")
            if not game_name or not str(game_name).strip():
                continue

            # Extrair e sanitizar campos
            index_num = str(row_cells.get("A") or "").strip()
            genre = str(row_cells.get("C") or "").strip()
            developer = str(row_cells.get("D") or "").strip()
            console = str(row_cells.get("E") or "").strip()
            date_raw = row_cells.get("F")
            date_finished = excel_serial_to_date_str(date_raw)
            time_hours = str(row_cells.get("G") or "").strip()
            release_year = str(row_cells.get("H") or "").strip()
            ra_mode = str(row_cells.get("I") or "").strip()
            notes = str(row_cells.get("J") or "").strip()

            games.append({
                "index": index_num,
                "name": game_name.strip(),
                "genre": genre,
                "developer": developer,
                "console": console,
                "date_finished": date_finished,
                "time_hours": time_hours,
                "release_year": release_year,
                "ra_mode": ra_mode,
                "notes": notes,
            })

    print(f"[+] Total de jogos identificados na planilha: {len(games)}")
    return games


# Limpeza do título do jogo para otimizar busca no IGDB
def clean_title_for_search(title):
    # Remove sufixos como (All Stars), (USA), (Remastered), etc.
    cleaned = re.sub(r"\(.*?\)", "", title)
    cleaned = re.sub(r"\[.*?\]", "", cleaned)
    cleaned = cleaned.replace(" - ", " ")
    return cleaned.strip()


# Consulta e pontuação inteligente na API do IGDB
def search_igdb_game(title, console, release_year_expected, client_id, access_token):
    search_term = clean_title_for_search(title)
    if not search_term:
        search_term = title

    safe_query = search_term.replace('"', '\\"')
    igdb_body = (
        f'fields id, name, cover.image_id, first_release_date, '
        f'involved_companies.developer, involved_companies.company.name, '
        f'genres.name, platforms.name, summary, rating, total_rating_count, url; '
        f'search "{safe_query}"; limit 6;'
    )

    req = urllib.request.Request(
        "https://api.igdb.com/v4/games",
        data=igdb_body.encode("utf-8"),
        headers={
            "Client-ID": client_id,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "text/plain"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            candidates = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        # Se erro de cota ou conexão, espera brevemente
        time.sleep(1)
        return None

    if not candidates:
        # Tenta uma busca mais aberta com o título original direto
        if search_term != title:
            safe_orig = title.replace('"', '\\"')
            igdb_body_orig = (
                f'fields id, name, cover.image_id, first_release_date, '
                f'involved_companies.developer, involved_companies.company.name, '
                f'genres.name, platforms.name, summary, rating, total_rating_count, url; '
                f'search "{safe_orig}"; limit 6;'
            )
            req_orig = urllib.request.Request(
                "https://api.igdb.com/v4/games",
                data=igdb_body_orig.encode("utf-8"),
                headers={
                    "Client-ID": client_id,
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "text/plain"
                },
                method="POST"
            )
            try:
                with urllib.request.urlopen(req_orig, timeout=10) as resp:
                    candidates = json.loads(resp.read().decode("utf-8"))
            except Exception:
                return None

    if not candidates:
        return None

    # Algoritmo de escolha do melhor candidato
    best_candidate = None
    best_score = -1

    title_lower = title.lower().strip()
    search_lower = search_term.lower().strip()
    console_lower = (console or "").lower()

    for cand in candidates:
        cand_name = cand.get("name", "")
        cand_lower = cand_name.lower().strip()
        score = 0

        # Pontuação por correspondência de título
        if cand_lower == title_lower:
            score += 100
        elif cand_lower == search_lower:
            score += 80
        elif cand_lower.startswith(search_lower) or search_lower.startswith(cand_lower):
            score += 40

        # Pontuação por plataforma correspondente
        cand_platforms = [p.get("name", "").lower() for p in cand.get("platforms", [])]
        if any(console_lower in p or p in console_lower for p in cand_platforms):
            score += 40

        # Pontuação por proximidade do ano
        if release_year_expected and cand.get("first_release_date"):
            try:
                exp_year = int(release_year_expected)
                cand_year = time.gmtime(cand["first_release_date"]).tm_year
                diff = abs(exp_year - cand_year)
                if diff == 0:
                    score += 30
                elif diff <= 2:
                    score += 15
            except Exception:
                pass

        # Bônus por ter capa
        if cand.get("cover") and cand["cover"].get("image_id"):
            score += 15

        # Bônus por relevância geral (quantidade de ratings)
        ratings_count = cand.get("total_rating_count", 0) or 0
        if ratings_count > 50:
            score += 10

        if score > best_score:
            best_score = score
            best_candidate = cand

    if not best_candidate:
        best_candidate = candidates[0]

    # Monta objeto formatado
    cover_id = best_candidate.get("cover", {}).get("image_id") if best_candidate.get("cover") else None
    cover_url = f"https://images.igdb.com/igdb/image/upload/t_cover_big/{cover_id}.jpg" if cover_id else ""

    cand_year = ""
    if best_candidate.get("first_release_date"):
        cand_year = str(time.gmtime(best_candidate["first_release_date"]).tm_year)

    developer = ""
    for comp in best_candidate.get("involved_companies", []):
        if comp.get("developer") and comp.get("company", {}).get("name"):
            developer = comp["company"]["name"]
            break
        elif not developer and comp.get("company", {}).get("name"):
            developer = comp["company"]["name"]

    genres_list = [g.get("name", "") for g in best_candidate.get("genres", [])]
    summary = best_candidate.get("summary", "") or ""
    summary_clean = re.sub(r"[\r\n\t]+", " ", summary).strip()

    return {
        "igdb_id": best_candidate.get("id"),
        "igdb_name": best_candidate.get("name", ""),
        "igdb_cover_url": cover_url,
        "igdb_developer": developer,
        "igdb_release_year": cand_year,
        "igdb_genres": ", ".join(genres_list),
        "igdb_summary": summary_clean,
        "igdb_rating": str(best_candidate.get("rating") or ""),
        "igdb_url": best_candidate.get("url", "")
    }


def main():
    parser = argparse.ArgumentParser(description="Exporta jogos da planilha para CSV enriquecido com dados do IGDB.")
    parser.add_argument("--excel", default=EXCEL_PATH, help=f"Caminho do arquivo Excel (padrão: {EXCEL_PATH})")
    parser.add_argument("--limit", type=int, default=None, help="Limite de jogos a processar (útil para testes rápidos)")
    parser.add_argument("--no-cache", action="store_true", help="Ignora cache existente e re-consulta todos os jogos")
    args = parser.parse_args()

    # 1. Carregar credenciais
    client_id, client_secret = load_env_credentials()
    if not client_id or not client_secret:
        print("[-] Erro: Credenciais TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET não encontradas.")
        sys.exit(1)

    print("[*] Autenticando na API Twitch/IGDB...")
    token = get_twitch_token(client_id, client_secret)
    if not token:
        print("[-] Falha na obtenção do token OAuth da Twitch.")
        sys.exit(1)
    print("[+] Autenticado com sucesso na Twitch OAuth!")

    # 2. Ler jogos do Excel
    games = read_games_from_xlsx(args.excel)
    if not games:
        print("[-] Nenhum jogo encontrado na planilha.")
        sys.exit(1)

    # 3. Exportar CSV original imediatamente
    print(f"[*] Gerando '{OUTPUT_ORIGINAL_CSV}'...")
    with open(OUTPUT_ORIGINAL_CSV, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(["#", "Jogo", "Gênero", "Desenvolvedora", "Console", "Data Término", "Tempo", "Ano de Lançamento", "Modo Zeramento (RA)", "Observações"])
        for g in games:
            writer.writerow([g["index"], g["name"], g["genre"], g["developer"], g["console"], g["date_finished"], g["time_hours"], g["release_year"], g["ra_mode"], g["notes"]])
    print(f"[+] '{OUTPUT_ORIGINAL_CSV}' criado com sucesso ({len(games)} registros).")

    # 4. Carregar cache existente
    cache = {}
    if not args.no_cache and os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                cache = json.load(f)
            print(f"[+] Cache carregado com {len(cache)} jogos já consultados.")
        except Exception:
            cache = {}

    # Aplicar limite se informado
    total_to_process = games[:args.limit] if args.limit else games

    print(f"\n[*] Iniciando enriquecimento de {len(total_to_process)} jogos via IGDB...")
    print("=" * 70)

    enriched_games = []
    checkpoint_rows = []
    
    start_time = time.time()
    
    for idx, g in enumerate(total_to_process, 1):
        name = g["name"]
        cache_key = name.lower().strip()

        if cache_key in cache:
            igdb_data = cache[cache_key]
            status_tag = "[CACHE]"
        else:
            igdb_data = search_igdb_game(name, g["console"], g["release_year"], client_id, token)
            cache[cache_key] = igdb_data
            status_tag = "[IGDB] "
            # Limite seguro de 3.5 req/segundo
            time.sleep(0.28)

        # Salva cache incremental a cada 20 jogos
        if idx % 20 == 0:
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(cache, f, ensure_ascii=False, indent=2)

        # Dados combinados
        combined = dict(g)
        if igdb_data:
            combined.update(igdb_data)
            cover_info = "COM Capa" if igdb_data.get("igdb_cover_url") else "SEM Capa"
            cand_name = igdb_data.get("igdb_name") or name
            cand_year = igdb_data.get("igdb_release_year") or g["release_year"]
            print(f"{status_tag} [{idx:03d}/{len(total_to_process)}] {name} -> {cand_name} ({cand_year}) [{cover_info}]")
        else:
            combined.update({
                "igdb_id": "", "igdb_name": "", "igdb_cover_url": "",
                "igdb_developer": "", "igdb_release_year": "", "igdb_genres": "",
                "igdb_summary": "", "igdb_rating": "", "igdb_url": ""
            })
            print(f"{status_tag} [{idx:03d}/{len(total_to_process)}] {name} -> Não localizado no IGDB")

        enriched_games.append(combined)

        # Linha para o formato do CheckPOINT:
        # Nome do Jogo;Gênero;Desenvolvedora;Console;Data Término;Tempo;Ano de Lançamento;URL Capa
        final_dev = g["developer"] or combined.get("igdb_developer") or "Desconhecido"
        final_year = g["release_year"] or combined.get("igdb_release_year") or "2000"
        final_cover = combined.get("igdb_cover_url") or ""
        
        checkpoint_rows.append([
            g["name"],
            g["genre"],
            final_dev,
            g["console"],
            g["date_finished"],
            g["time_hours"],
            final_year,
            final_cover
        ])

    # Salva cache final
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

    elapsed = time.time() - start_time
    print("=" * 70)
    print(f"[+] Processamento concluído em {elapsed:.1f} segundos!")

    # 5. Gravar CSV Completo Enriquecido
    print(f"[*] Salvando relatório completo em '{OUTPUT_ENRICHED_CSV}'...")
    fieldnames = [
        "index", "name", "genre", "developer", "console", "date_finished", "time_hours",
        "release_year", "ra_mode", "notes",
        "igdb_id", "igdb_name", "igdb_cover_url", "igdb_developer", "igdb_release_year",
        "igdb_genres", "igdb_rating", "igdb_summary", "igdb_url"
    ]
    with open(OUTPUT_ENRICHED_CSV, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=",")
        writer.writeheader()
        writer.writerows(enriched_games)
    print(f"[+] '{OUTPUT_ENRICHED_CSV}' gerado com sucesso!")

    # 6. Gravar CSV Pronto para Importação no CheckPOINT
    print(f"[*] Salvando arquivo pronto para importação no CheckPOINT em '{OUTPUT_CHECKPOINT_CSV}'...")
    with open(OUTPUT_CHECKPOINT_CSV, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(["Nome do Jogo", "Gênero", "Desenvolvedora", "Console", "Data Término", "Tempo", "Ano de Lançamento", "URL Capa"])
        writer.writerows(checkpoint_rows)
    print(f"[+] '{OUTPUT_CHECKPOINT_CSV}' gerado com sucesso!")
    print(f"\n🎉 Todos os arquivos foram gerados na raiz do projeto com sucesso!")


if __name__ == "__main__":
    main()
