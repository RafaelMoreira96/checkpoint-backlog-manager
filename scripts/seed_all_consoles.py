#!/usr/bin/env python3
"""
Script para cadastrar todos os consoles existentes (IGDB + Histórico + Planilha)
no banco de dados PostgreSQL do CheckPOINT.
"""

import json
import os
import subprocess
import sys

def run_sql(sql: str) -> str:
    cmd = [
        "docker", "exec", "-i", "checkpoint-postgres",
        "psql", "-U", "postgres", "-d", "checkpoint_db",
        "-t", "-A", "-c", sql
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Erro SQL: {res.stderr}")
    return res.stdout.strip()

def main():
    print("🎮 Iniciando cadastro completo de consoles e fabricantes no CheckPOINT...")

    # 1. Lista de Fabricantes essenciais
    manufacturers_data = [
        ("Sony Interactive Entertainment", 1993),
        ("Nintendo", 1889),
        ("Microsoft Gaming", 2001),
        ("Valve / PC Gaming", 1996),
        ("Sega", 1960),
        ("Atari", 1972),
        ("SNK", 1978),
        ("NEC", 1987),
        ("Bandai", 1950),
        ("Panasonic / 3DO", 1918),
        ("Commodore", 1954),
        ("Apple", 1976),
        ("Google / Android", 1998),
        ("Arcade / Diversos", 1971),
        ("Mobile / Diversos", 2007),
        ("Capcom", 1979),
        ("Square Enix", 1975),
        ("Outras Fabricantes", 1970),
    ]

    for name, year in manufacturers_data:
        escaped_name = name.replace("'", "''")
        check_sql = f"SELECT id_manufacturer FROM manufacturers WHERE LOWER(name_manufacturer) = LOWER('{escaped_name}');"
        exists = run_sql(check_sql)
        if not exists:
            insert_sql = f"""
            INSERT INTO manufacturers (name_manufacturer, year_founded, is_active, created_at, updated_at)
            VALUES ('{escaped_name}', {year}, true, NOW(), NOW());
            """
            run_sql(insert_sql)

    # Obter mapa atualizado de fabricantes
    raw_mfg = run_sql("SELECT id_manufacturer, name_manufacturer FROM manufacturers;")
    mfg_map = {}
    for line in raw_mfg.split("\n"):
        if "|" in line:
            mid, mname = line.split("|", 1)
            mfg_map[mname.strip().lower()] = int(mid)

    def get_mfg_id(keyword: str) -> int:
        keyword = keyword.lower()
        for k, mid in mfg_map.items():
            if keyword in k:
                return mid
        return mfg_map.get("outras fabricantes", 1)

    # 2. Consoles da planilha do usuário que DEVEM existir exatamente com estes nomes
    spreadsheet_consoles = [
        ("Nintendo 8-bits", "Nintendo", "1983"),
        ("Super Nintendo", "Nintendo", "1990"),
        ("Nintendo 64", "Nintendo", "1996"),
        ("Nintendo GameCube", "Nintendo", "2001"),
        ("Nintendo Wii", "Nintendo", "2006"),
        ("Nintendo Wii U", "Nintendo", "2012"),
        ("Nintendo Switch", "Nintendo", "2017"),
        ("Nintendo Switch 2", "Nintendo", "2025"),
        ("Gameboy", "Nintendo", "1989"),
        ("Gameboy Color", "Nintendo", "1998"),
        ("Gameboy Advance", "Nintendo", "2001"),
        ("Nintendo DS", "Nintendo", "2004"),
        ("Nintendo 3DS", "Nintendo", "2011"),
        ("PlayStation", "Sony", "1994"),
        ("PlayStation 2", "Sony", "2000"),
        ("PlayStation 3", "Sony", "2006"),
        ("PlayStation 4", "Sony", "2013"),
        ("PlayStation 5", "Sony", "2020"),
        ("PlayStation Portable", "Sony", "2004"),
        ("PlayStation Vita", "Sony", "2011"),
        ("Xbox", "Microsoft", "2001"),
        ("Xbox 360", "Microsoft", "2005"),
        ("Xbox One", "Microsoft", "2013"),
        ("Xbox Series X|S", "Microsoft", "2020"),
        ("Sega Master System", "Sega", "1985"),
        ("Sega MegaDrive", "Sega", "1988"),
        ("Sega 32X", "Sega", "1994"),
        ("Sega CD", "Sega", "1991"),
        ("Sega Saturn", "Sega", "1994"),
        ("Sega Dreamcast", "Sega", "1998"),
        ("Sega Game Gear", "Sega", "1990"),
        ("PC", "Valve / PC", "1981"),
        ("PC (Steam)", "Valve / PC", "2003"),
        ("Arcade", "Arcade", "1971"),
        ("Mobile", "Mobile", "2007"),
        ("Atari 2600", "Atari", "1977"),
        ("Atari 5200", "Atari", "1982"),
        ("Atari 7800", "Atari", "1986"),
        ("Atari Lynx", "Atari", "1989"),
        ("Atari Jaguar", "Atari", "1993"),
        ("Neo Geo", "SNK", "1990"),
        ("Neo Geo Pocket", "SNK", "1998"),
        ("TurboGrafx-16 / PC Engine", "NEC", "1987"),
        ("WonderSwan", "Bandai", "1999"),
        ("3DO Interactive Multiplayer", "3DO", "1993"),
        ("Commodore 64", "Commodore", "1982"),
        ("Amiga", "Commodore", "1985"),
        ("MSX", "Valve / PC", "1983"),
    ]

    inserted_count = 0

    for name, mfg_key, release in spreadsheet_consoles:
        escaped_name = name.replace("'", "''")
        mfg_id = get_mfg_id(mfg_key)
        check_sql = f"SELECT id_console FROM consoles WHERE LOWER(name_console) = LOWER('{escaped_name}');"
        exists = run_sql(check_sql)
        if not exists:
            insert_sql = f"""
            INSERT INTO consoles (name_console, manufacturer_id, release_date, is_active, created_at, updated_at)
            VALUES ('{escaped_name}', {mfg_id}, '{release}', true, NOW(), NOW());
            """
            run_sql(insert_sql)
            inserted_count += 1

    # 3. Adicionar plataformas do IGDB do arquivo json
    igdb_path = "scripts/igdb_platforms_backup.json"
    if os.path.exists(igdb_path):
        with open(igdb_path, "r", encoding="utf-8") as f:
            platforms = json.load(f)

        for p in platforms:
            pname = p.get("name", "").strip()
            if not pname:
                continue

            escaped_pname = pname.replace("'", "''")
            check_sql = f"SELECT id_console FROM consoles WHERE LOWER(name_console) = LOWER('{escaped_pname}');"
            exists = run_sql(check_sql)
            if not exists:
                # Deduce manufacturer
                fam = ""
                if p.get("platform_family") and isinstance(p["platform_family"], dict):
                    fam = p["platform_family"].get("name", "")

                combined = f"{fam} {pname}".lower()
                mfg_id = mfg_map.get("outras fabricantes", 1)
                if "nintendo" in combined or "game boy" in combined or "switch" in combined or "famicom" in combined or "wii" in combined:
                    mfg_id = get_mfg_id("nintendo")
                elif "playstation" in combined or "sony" in combined or "psp" in combined or "vita" in combined or "psvr" in combined:
                    mfg_id = get_mfg_id("sony")
                elif "xbox" in combined or "microsoft" in combined:
                    mfg_id = get_mfg_id("microsoft")
                elif "sega" in combined or "genesis" in combined or "dreamcast" in combined or "saturn" in combined:
                    mfg_id = get_mfg_id("sega")
                elif "atari" in combined:
                    mfg_id = get_mfg_id("atari")
                elif "snk" in combined or "neo geo" in combined:
                    mfg_id = get_mfg_id("snk")
                elif "nec" in combined or "pc engine" in combined or "turbografx" in combined:
                    mfg_id = get_mfg_id("nec")
                elif "commodore" in combined or "amiga" in combined:
                    mfg_id = get_mfg_id("commodore")
                elif "apple" in combined or "mac" in combined or "ios" in combined:
                    mfg_id = get_mfg_id("apple")
                elif "android" in combined or "google" in combined:
                    mfg_id = get_mfg_id("google")
                elif "arcade" in combined:
                    mfg_id = get_mfg_id("arcade")
                elif "pc" in combined or "windows" in combined or "dos" in combined or "linux" in combined or "steam" in combined:
                    mfg_id = get_mfg_id("valve")
                elif "wonderswan" in combined or "bandai" in combined:
                    mfg_id = get_mfg_id("bandai")
                elif "3do" in combined:
                    mfg_id = get_mfg_id("3do")

                gen = p.get("generation", 0)
                year_str = f"Gen {gen}" if gen else "Clássico"

                insert_sql = f"""
                INSERT INTO consoles (name_console, manufacturer_id, release_date, is_active, created_at, updated_at)
                VALUES ('{escaped_pname}', {mfg_id}, '{year_str}', true, NOW(), NOW());
                """
                run_sql(insert_sql)
                inserted_count += 1

    total_consoles = run_sql("SELECT COUNT(*) FROM consoles;")
    total_manufacturers = run_sql("SELECT COUNT(*) FROM manufacturers;")
    print(f"✅ Concluído com sucesso!")
    print(f"📦 Total de Fabricantes no banco: {total_manufacturers}")
    print(f"🎮 Total de Consoles e Plataformas cadastrados no banco: {total_consoles}")

if __name__ == "__main__":
    main()
