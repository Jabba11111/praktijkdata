import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'ggz.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ============================================================
// DATABASE SCHEMA
// ============================================================

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clienten (
      id TEXT PRIMARY KEY,
      voornaam TEXT NOT NULL,
      achternaam TEXT NOT NULL,
      geboortedatum TEXT,
      bsn TEXT,
      email TEXT,
      telefoon TEXT,
      adres TEXT,
      postcode TEXT,
      woonplaats TEXT,
      verzekeraar TEXT,
      polisnummer TEXT,
      huisarts TEXT,
      verwijzer TEXT,
      zorgtype TEXT CHECK(zorgtype IN ('basis_ggz', 'specialistisch', 'jeugd')),
      zorgvraagtypering TEXT,
      status TEXT CHECK(status IN ('actief', 'inactief', 'wachtlijst')) DEFAULT 'actief',
      aanmelddatum TEXT,
      notities TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS dossier_notities (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      datum TEXT NOT NULL,
      type TEXT CHECK(type IN ('consult', 'intake', 'aantekening', 'brief', 'verslag')),
      onderwerp TEXT,
      inhoud TEXT,
      behandelaar TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES clienten(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS behandelplannen (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      diagnose_code TEXT,
      diagnose_omschrijving TEXT,
      hoofdklacht TEXT,
      behandeldoelen TEXT,
      interventies TEXT,
      startdatum TEXT,
      einddatum TEXT,
      status TEXT CHECK(status IN ('actief', 'afgerond', 'onderbroken')) DEFAULT 'actief',
      evaluatie TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES clienten(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS afspraken (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      datum TEXT NOT NULL,
      starttijd TEXT NOT NULL,
      eindtijd TEXT NOT NULL,
      type TEXT CHECK(type IN ('intake', 'consult', 'crisis', 'groep', 'telefonisch', 'ehealth')),
      status TEXT CHECK(status IN ('gepland', 'bevestigd', 'afgerond', 'no_show', 'geannuleerd')) DEFAULT 'gepland',
      locatie TEXT,
      notities TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES clienten(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS facturen (
      id TEXT PRIMARY KEY,
      factuurnummer TEXT UNIQUE NOT NULL,
      client_id TEXT NOT NULL,
      datum TEXT NOT NULL,
      vervaldatum TEXT,
      status TEXT CHECK(status IN ('concept', 'verstuurd', 'betaald', 'herinnering', 'oninbaar')) DEFAULT 'concept',
      totaal REAL DEFAULT 0,
      btw REAL DEFAULT 0,
      declaratie_type TEXT CHECK(declaratie_type IN ('verzekerd', 'onverzekerd', 'pgb')),
      vecozo_status TEXT,
      notities TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES clienten(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS factuur_regels (
      id TEXT PRIMARY KEY,
      factuur_id TEXT NOT NULL,
      prestatiecode TEXT,
      omschrijving TEXT,
      datum TEXT,
      aantal INTEGER DEFAULT 1,
      tarief REAL DEFAULT 0,
      totaal REAL DEFAULT 0,
      FOREIGN KEY (factuur_id) REFERENCES facturen(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rom_templates (
      id TEXT PRIMARY KEY,
      naam TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      vragen TEXT NOT NULL,
      scoring_info TEXT
    );

    CREATE TABLE IF NOT EXISTS rom_metingen (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      template_id TEXT NOT NULL,
      datum TEXT NOT NULL,
      antwoorden TEXT,
      score REAL,
      interpretatie TEXT,
      type TEXT CHECK(type IN ('voormeting', 'tussenmeting', 'nameting')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES clienten(id) ON DELETE CASCADE,
      FOREIGN KEY (template_id) REFERENCES rom_templates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS correspondentie (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      datum TEXT NOT NULL,
      type TEXT CHECK(type IN ('brief', 'email', 'zorgmail', 'zorgdomein', 'fax')),
      richting TEXT CHECK(richting IN ('inkomend', 'uitgaand')),
      onderwerp TEXT,
      inhoud TEXT,
      ontvanger_afzender TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES clienten(id) ON DELETE CASCADE
    );
  `);
}

// ============================================================
// SEED ROM TEMPLATES
// ============================================================

function seedRomTemplates() {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM rom_templates').get() as { cnt: number };
  if (count.cnt > 0) return;

  const insert = db.prepare('INSERT INTO rom_templates (id, naam, code, vragen, scoring_info) VALUES (?, ?, ?, ?, ?)');

  const phq9Vragen = [
    'Weinig interesse of plezier in het doen van dingen',
    'Neerslachtig, depressief of hopeloos voelen',
    'Moeilijk in slaap komen, doorslapen of juist te veel slapen',
    'Vermoeid zijn of weinig energie hebben',
    'Weinig eetlust of juist te veel eten',
    'Negatief over uzelf denken – of het gevoel hebben dat u een mislukkeling bent, of dat u uzelf of uw familie teleurgesteld heeft',
    'Moeite om u te concentreren, bijvoorbeeld bij het lezen van de krant of het kijken van televisie',
    'Zo traag bewegen of spreken dat andere mensen dit gemerkt zouden kunnen hebben? Of het tegenovergestelde: zo onrustig of rusteloos zijn dat u meer bewoog dan gebruikelijk',
    'Gedachten dat u beter dood zou kunnen zijn, of dat u uzelf op een of andere manier pijn zou willen doen'
  ];

  const phq9VragenJson = JSON.stringify(phq9Vragen.map((v, i) => ({
    nummer: i + 1,
    tekst: v,
    antwoordopties: [
      { waarde: 0, label: 'Helemaal niet' },
      { waarde: 1, label: 'Meerdere dagen' },
      { waarde: 2, label: 'Meer dan de helft van de dagen' },
      { waarde: 3, label: 'Bijna elke dag' }
    ]
  })));

  const phq9Scoring = JSON.stringify({
    min: 0,
    max: 27,
    interpretatie: [
      { range: [0, 4], label: 'Minimale depressie' },
      { range: [5, 9], label: 'Milde depressie' },
      { range: [10, 14], label: 'Matige depressie' },
      { range: [15, 19], label: 'Matig-ernstige depressie' },
      { range: [20, 27], label: 'Ernstige depressie' }
    ]
  });

  insert.run(uuidv4(), 'Patient Health Questionnaire-9', 'PHQ-9', phq9VragenJson, phq9Scoring);

  const gad7Vragen = [
    'Nerveus, angstig of gespannen voelen',
    'Niet in staat zijn om zorgen te stoppen of onder controle te houden',
    'Zich te veel zorgen maken over verschillende dingen',
    'Moeite met ontspannen',
    'Zo rusteloos zijn dat het moeilijk is om stil te zitten',
    'Snel geïrriteerd of prikkelbaar zijn',
    'Bang zijn alsof er iets vreselijks zou kunnen gebeuren'
  ];

  const gad7VragenJson = JSON.stringify(gad7Vragen.map((v, i) => ({
    nummer: i + 1,
    tekst: v,
    antwoordopties: [
      { waarde: 0, label: 'Helemaal niet' },
      { waarde: 1, label: 'Meerdere dagen' },
      { waarde: 2, label: 'Meer dan de helft van de dagen' },
      { waarde: 3, label: 'Bijna elke dag' }
    ]
  })));

  const gad7Scoring = JSON.stringify({
    min: 0,
    max: 21,
    interpretatie: [
      { range: [0, 4], label: 'Minimale angst' },
      { range: [5, 9], label: 'Milde angst' },
      { range: [10, 14], label: 'Matige angst' },
      { range: [15, 21], label: 'Ernstige angst' }
    ]
  });

  insert.run(uuidv4(), 'Generalized Anxiety Disorder-7', 'GAD-7', gad7VragenJson, gad7Scoring);

  const oq45Vragen = [
    'Ik ga moeilijk om met anderen',
    'Ik voel me moe',
    'Ik heb geen interesse in dingen',
    'Ik voel me gestrest op het werk of op school',
    'Ik geef mezelf de schuld van dingen',
    'Ik voel me geïrriteerd',
    'Ik voel me ongelukkig in mijn huwelijk of relatie',
    'Ik heb gedachten om een einde aan mijn leven te maken',
    'Ik voel me zwak',
    'Ik ben bang',
    'Na het drinken van alcohol voel ik me schuldig of schaam ik me',
    'Ik ben tevreden met mijn werk of school',
    'Ik ben een gelukkig persoon',
    'Ik werk of studeer te veel',
    'Ik voel me nutteloos',
    'Ik maak me zorgen over mijn gezin',
    'Ik heb een onbevredigend seksleven',
    'Ik voel me eenzaam',
    'Ik heb vaak ruzie',
    'Ik voel me geliefd en gewaardeerd',
    'Ik geniet van mijn vrije tijd',
    'Ik heb moeite met concentreren',
    'Ik voel me hopeloos over de toekomst',
    'Ik ben tevreden met mezelf',
    'Ik heb opdringerige gedachten die me storen',
    'Ik voel me geërgerd door mensen die mij commanderen',
    'Ik heb last van een verstoorde maag',
    'Ik werk of studeer niet zo goed als vroeger',
    'Ik heb moeite met het hart of de borst',
    'Ik voel me zeker als ik met anderen omga',
    'Ik ben tevreden met mijn relaties met anderen',
    'Ik heb pijnlijke spierspanning',
    'Ik voel me niet op mijn gemak bij anderen',
    'Ik voel me angstig',
    'Ik heb het gevoel dat alles fout gaat',
    'Ik voel me nerveus',
    'Ik voel dat mijn liefdesrelatie goed gaat',
    'Ik voel dat ik niet zo goed presteer op het werk of op school',
    'Ik heb te veel conflicten',
    'Ik heb last van hoofdpijn',
    'Ik voel me somber',
    'Ik ben tevreden over hoe dingen gaan in mijn leven',
    'Ik ben boos genoeg op het werk of school dat ik iets doe waar ik later spijt van krijg',
    'Ik heb last van duizeligheid',
    'Ik voel me verdrietig'
  ];

  const oq45VragenJson = JSON.stringify(oq45Vragen.map((v, i) => ({
    nummer: i + 1,
    tekst: v,
    antwoordopties: [
      { waarde: 0, label: 'Nooit' },
      { waarde: 1, label: 'Zelden' },
      { waarde: 2, label: 'Soms' },
      { waarde: 3, label: 'Vaak' },
      { waarde: 4, label: 'Bijna altijd' }
    ]
  })));

  const oq45Scoring = JSON.stringify({
    min: 0,
    max: 180,
    schalen: [
      { naam: 'Symptomatisch onwelbevinden', items: '1-25', max: 100 },
      { naam: 'Interpersoonlijk functioneren', items: '26-36', max: 44 },
      { naam: 'Sociale rolvervulling', items: '37-45', max: 36 }
    ],
    interpretatie: [
      { range: [0, 63], label: 'Normaal functioneren' },
      { range: [64, 180], label: 'Klinisch significante klachten' }
    ],
    klinische_grenswaarde: 64
  });

  insert.run(uuidv4(), 'Outcome Questionnaire-45', 'OQ-45', oq45VragenJson, oq45Scoring);

  const sq48Vragen = [
    'Ik had last van gevoelens van angst',
    'Ik voelde me somber of depressief',
    'Ik had last van ongewenste gedachten die steeds terugkomen',
    'Ik kon niet van het leven genieten',
    'Ik had last van concentratieproblemen',
    'Ik voelde me gespannen',
    'Ik had last van slapeloosheid',
    'Ik had last van paniekaanvallen',
    'Ik voelde me prikkelbaar',
    'Ik had last van vermoeidheid',
    'Ik had last van huilbuien',
    'Ik voelde me onzeker in contact met anderen',
    'Ik had last van lichamelijke klachten waarvoor geen medische oorzaak is gevonden',
    'Ik had last van nachtmerries',
    'Ik maakte me zorgen over mijn uiterlijk',
    'Ik had last van dwanghandelingen (steeds herhaalde handelingen)',
    'Ik voelde me eenzaam',
    'Ik had last van woede-uitbarstingen',
    'Ik had moeite met het aangaan van contacten met anderen',
    'Ik voelde me nutteloos',
    'Ik had gedachten over de dood of zelfdoding',
    'Ik had weinig zelfvertrouwen',
    'Ik had last van transpireren, trillen of beven',
    'Ik vermeed situaties die mij angst bezorgen',
    'Ik voelde me zenuwachtig',
    'Ik had last van herbelevingen van een nare gebeurtenis',
    'Ik voelde me schuldig',
    'Ik had last van hartkloppingen',
    'Ik had moeite met het nemen van beslissingen',
    'Ik voelde me verdrietig',
    'Ik had last van misselijkheid of buikpijn',
    'Ik had last van opvliegers of koude rillingen',
    'Ik had een beperkt gevoel van eigenwaarde',
    'Ik voelde me lusteloos',
    'Ik had last van nare herinneringen aan een schokkende gebeurtenis',
    'Ik had last van duizeligheid of een licht gevoel in het hoofd',
    'Ik maakte me veel zorgen',
    'Ik had last van eetproblemen (te weinig of te veel eten)',
    'Ik voelde me hopeloos over de toekomst',
    'Ik had last van controledwang (steeds controleren of dingen goed gaan)',
    'Ik had moeite met het uiten van mijn gevoelens',
    'Ik gebruikte alcohol of drugs om me beter te voelen',
    'Ik voelde me afgesneden van andere mensen',
    'Ik had last van benauwdheid of kortademigheid',
    'Ik had last van hoofdpijn',
    'Ik had last van onrust',
    'Ik voelde me ongelukkig',
    'Ik had last van spierpijn of spierspanning'
  ];

  const sq48VragenJson = JSON.stringify(sq48Vragen.map((v, i) => ({
    nummer: i + 1,
    tekst: v,
    antwoordopties: [
      { waarde: 0, label: 'Helemaal niet' },
      { waarde: 1, label: 'Een beetje' },
      { waarde: 2, label: 'Nogal' },
      { waarde: 3, label: 'Tamelijk veel' },
      { waarde: 4, label: 'Heel erg' }
    ]
  })));

  const sq48Scoring = JSON.stringify({
    min: 0,
    max: 192,
    schalen: [
      { naam: 'Depressie', items: [2, 4, 11, 20, 21, 30, 34, 39, 47] },
      { naam: 'Angst', items: [1, 6, 8, 23, 24, 25, 28, 37, 44] },
      { naam: 'Somatische klachten', items: [13, 31, 32, 36, 40, 45, 46, 48] },
      { naam: 'Agorafobie', items: [7, 10, 14, 29, 38] },
      { naam: 'Sociale fobie', items: [12, 15, 19, 22, 33, 41, 43] },
      { naam: 'Cognitieve klachten', items: [3, 5, 9, 16, 27] },
      { naam: 'Vijandigheid', items: [18, 26, 35, 42] },
      { naam: 'Werkgerelateerde klachten', items: [17] }
    ],
    interpretatie: [
      { range: [0, 48], label: 'Laag klachtenniveau' },
      { range: [49, 96], label: 'Matig klachtenniveau' },
      { range: [97, 144], label: 'Hoog klachtenniveau' },
      { range: [145, 192], label: 'Zeer hoog klachtenniveau' }
    ]
  });

  insert.run(uuidv4(), 'Symptom Questionnaire-48', 'SQ-48', sq48VragenJson, sq48Scoring);
}

// ============================================================
// INITIALIZE
// ============================================================

createTables();
seedRomTemplates();

// ============================================================
// HELPER
// ============================================================

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowISO(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

// ============================================================
// ROUTES: STATS
// ============================================================

app.get('/api/ggz/stats', (_req, res) => {
  try {
    const today = todayISO();
    const firstOfMonth = today.slice(0, 8) + '01';

    const totalClienten = (db.prepare('SELECT COUNT(*) as cnt FROM clienten').get() as any).cnt;
    const actieveClienten = (db.prepare("SELECT COUNT(*) as cnt FROM clienten WHERE status = 'actief'").get() as any).cnt;
    const wachtlijst = (db.prepare("SELECT COUNT(*) as cnt FROM clienten WHERE status = 'wachtlijst'").get() as any).cnt;
    const afsprakenVandaag = (db.prepare('SELECT COUNT(*) as cnt FROM afspraken WHERE datum = ?').get(today) as any).cnt;
    const openFacturen = (db.prepare("SELECT COUNT(*) as cnt FROM facturen WHERE status IN ('verstuurd', 'herinnering')").get() as any).cnt;
    const openFacturenBedrag = (db.prepare("SELECT COALESCE(SUM(totaal), 0) as bedrag FROM facturen WHERE status IN ('verstuurd', 'herinnering')").get() as any).bedrag;
    const omzetDezeMaand = (db.prepare("SELECT COALESCE(SUM(totaal), 0) as bedrag FROM facturen WHERE status = 'betaald' AND datum >= ?").get(firstOfMonth) as any).bedrag;
    const noShowDezeMaand = (db.prepare("SELECT COUNT(*) as cnt FROM afspraken WHERE status = 'no_show' AND datum >= ?").get(firstOfMonth) as any).cnt;

    res.json({
      totalClienten,
      actieveClienten,
      wachtlijst,
      afsprakenVandaag,
      openFacturen,
      openFacturenBedrag,
      omzetDezeMaand,
      noShowDezeMaand
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ROUTES: CLIENTEN
// ============================================================

app.get('/api/ggz/clienten', (req, res) => {
  try {
    const { status, zoek } = req.query;
    let sql = 'SELECT * FROM clienten WHERE 1=1';
    const params: any[] = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (zoek) {
      sql += ' AND (voornaam LIKE ? OR achternaam LIKE ? OR bsn LIKE ? OR email LIKE ?)';
      const term = `%${zoek}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY achternaam, voornaam';
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ggz/clienten/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM clienten WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Client niet gevonden' });
    res.json(row);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ggz/clienten', (req, res) => {
  try {
    const id = uuidv4();
    const now = nowISO();
    const {
      voornaam, achternaam, geboortedatum, bsn, email, telefoon,
      adres, postcode, woonplaats, verzekeraar, polisnummer,
      huisarts, verwijzer, zorgtype, zorgvraagtypering, status,
      aanmelddatum, notities
    } = req.body;

    db.prepare(`
      INSERT INTO clienten (id, voornaam, achternaam, geboortedatum, bsn, email, telefoon,
        adres, postcode, woonplaats, verzekeraar, polisnummer, huisarts, verwijzer,
        zorgtype, zorgvraagtypering, status, aanmelddatum, notities, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, voornaam, achternaam, geboortedatum || null, bsn || null,
      email || null, telefoon || null, adres || null, postcode || null,
      woonplaats || null, verzekeraar || null, polisnummer || null,
      huisarts || null, verwijzer || null, zorgtype || null,
      zorgvraagtypering || null, status || 'actief',
      aanmelddatum || todayISO(), notities || null, now, now);

    const created = db.prepare('SELECT * FROM clienten WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/ggz/clienten/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM clienten WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Client niet gevonden' });

    const fields = [
      'voornaam', 'achternaam', 'geboortedatum', 'bsn', 'email', 'telefoon',
      'adres', 'postcode', 'woonplaats', 'verzekeraar', 'polisnummer',
      'huisarts', 'verwijzer', 'zorgtype', 'zorgvraagtypering', 'status',
      'aanmelddatum', 'notities'
    ];

    const setClauses: string[] = [];
    const params: any[] = [];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'Geen velden om bij te werken' });
    }

    setClauses.push("updated_at = ?");
    params.push(nowISO());
    params.push(req.params.id);

    db.prepare(`UPDATE clienten SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
    const updated = db.prepare('SELECT * FROM clienten WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/ggz/clienten/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM clienten WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Client niet gevonden' });

    db.prepare('DELETE FROM clienten WHERE id = ?').run(req.params.id);
    res.json({ message: 'Client verwijderd' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ROUTES: DOSSIER NOTITIES
// ============================================================

app.get('/api/ggz/clienten/:id/dossier', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM dossier_notities WHERE client_id = ? ORDER BY datum DESC, created_at DESC').all(req.params.id);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ggz/clienten/:id/dossier', (req, res) => {
  try {
    const client = db.prepare('SELECT id FROM clienten WHERE id = ?').get(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client niet gevonden' });

    const id = uuidv4();
    const { datum, type, onderwerp, inhoud, behandelaar } = req.body;

    db.prepare(`
      INSERT INTO dossier_notities (id, client_id, datum, type, onderwerp, inhoud, behandelaar, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.params.id, datum || todayISO(), type || null, onderwerp || null, inhoud || null, behandelaar || null, nowISO());

    const created = db.prepare('SELECT * FROM dossier_notities WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ROUTES: BEHANDELPLANNEN
// ============================================================

app.get('/api/ggz/clienten/:id/behandelplannen', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM behandelplannen WHERE client_id = ? ORDER BY startdatum DESC').all(req.params.id);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ggz/clienten/:id/behandelplannen', (req, res) => {
  try {
    const client = db.prepare('SELECT id FROM clienten WHERE id = ?').get(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client niet gevonden' });

    const id = uuidv4();
    const now = nowISO();
    const {
      diagnose_code, diagnose_omschrijving, hoofdklacht, behandeldoelen,
      interventies, startdatum, einddatum, status, evaluatie
    } = req.body;

    db.prepare(`
      INSERT INTO behandelplannen (id, client_id, diagnose_code, diagnose_omschrijving, hoofdklacht,
        behandeldoelen, interventies, startdatum, einddatum, status, evaluatie, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.params.id, diagnose_code || null, diagnose_omschrijving || null,
      hoofdklacht || null, behandeldoelen || null, interventies || null,
      startdatum || todayISO(), einddatum || null, status || 'actief',
      evaluatie || null, now, now);

    const created = db.prepare('SELECT * FROM behandelplannen WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ROUTES: CORRESPONDENTIE
// ============================================================

app.get('/api/ggz/clienten/:id/correspondentie', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM correspondentie WHERE client_id = ? ORDER BY datum DESC, created_at DESC').all(req.params.id);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ggz/clienten/:id/correspondentie', (req, res) => {
  try {
    const client = db.prepare('SELECT id FROM clienten WHERE id = ?').get(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client niet gevonden' });

    const id = uuidv4();
    const { datum, type, richting, onderwerp, inhoud, ontvanger_afzender } = req.body;

    db.prepare(`
      INSERT INTO correspondentie (id, client_id, datum, type, richting, onderwerp, inhoud, ontvanger_afzender, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.params.id, datum || todayISO(), type || null, richting || null,
      onderwerp || null, inhoud || null, ontvanger_afzender || null, nowISO());

    const created = db.prepare('SELECT * FROM correspondentie WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ROUTES: AFSPRAKEN
// ============================================================

app.get('/api/ggz/afspraken', (req, res) => {
  try {
    const { week, client_id, status } = req.query;
    let sql = `
      SELECT a.*, c.voornaam, c.achternaam
      FROM afspraken a
      LEFT JOIN clienten c ON a.client_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (week) {
      const weekStart = String(week);
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      sql += ' AND a.datum >= ? AND a.datum <= ?';
      params.push(weekStart, endDate.toISOString().slice(0, 10));
    }

    if (client_id) {
      sql += ' AND a.client_id = ?';
      params.push(client_id);
    }

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY a.datum, a.starttijd';
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ggz/afspraken/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT a.*, c.voornaam, c.achternaam
      FROM afspraken a
      LEFT JOIN clienten c ON a.client_id = c.id
      WHERE a.id = ?
    `).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Afspraak niet gevonden' });
    res.json(row);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ggz/afspraken', (req, res) => {
  try {
    const id = uuidv4();
    const { client_id, datum, starttijd, eindtijd, type, status, locatie, notities } = req.body;

    if (!client_id || !datum || !starttijd || !eindtijd) {
      return res.status(400).json({ error: 'client_id, datum, starttijd en eindtijd zijn verplicht' });
    }

    db.prepare(`
      INSERT INTO afspraken (id, client_id, datum, starttijd, eindtijd, type, status, locatie, notities, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, client_id, datum, starttijd, eindtijd, type || null, status || 'gepland', locatie || null, notities || null, nowISO());

    const created = db.prepare(`
      SELECT a.*, c.voornaam, c.achternaam
      FROM afspraken a
      LEFT JOIN clienten c ON a.client_id = c.id
      WHERE a.id = ?
    `).get(id);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/ggz/afspraken/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM afspraken WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Afspraak niet gevonden' });

    const fields = ['client_id', 'datum', 'starttijd', 'eindtijd', 'type', 'status', 'locatie', 'notities'];
    const setClauses: string[] = [];
    const params: any[] = [];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'Geen velden om bij te werken' });
    }

    params.push(req.params.id);
    db.prepare(`UPDATE afspraken SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare(`
      SELECT a.*, c.voornaam, c.achternaam
      FROM afspraken a
      LEFT JOIN clienten c ON a.client_id = c.id
      WHERE a.id = ?
    `).get(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/ggz/afspraken/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM afspraken WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Afspraak niet gevonden' });

    db.prepare('DELETE FROM afspraken WHERE id = ?').run(req.params.id);
    res.json({ message: 'Afspraak verwijderd' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ROUTES: FACTUREN
// ============================================================

app.get('/api/ggz/facturen', (req, res) => {
  try {
    const { status, client_id } = req.query;
    let sql = `
      SELECT f.*, c.voornaam, c.achternaam
      FROM facturen f
      LEFT JOIN clienten c ON f.client_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND f.status = ?';
      params.push(status);
    }

    if (client_id) {
      sql += ' AND f.client_id = ?';
      params.push(client_id);
    }

    sql += ' ORDER BY f.datum DESC';
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ggz/facturen/:id', (req, res) => {
  try {
    const factuur = db.prepare(`
      SELECT f.*, c.voornaam, c.achternaam
      FROM facturen f
      LEFT JOIN clienten c ON f.client_id = c.id
      WHERE f.id = ?
    `).get(req.params.id) as any;

    if (!factuur) return res.status(404).json({ error: 'Factuur niet gevonden' });

    const regels = db.prepare('SELECT * FROM factuur_regels WHERE factuur_id = ? ORDER BY datum').all(req.params.id);
    factuur.regels = regels;

    res.json(factuur);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ggz/facturen', (req, res) => {
  try {
    const id = uuidv4();
    const {
      client_id, datum, vervaldatum, status, declaratie_type,
      vecozo_status, notities, regels
    } = req.body;

    if (!client_id) {
      return res.status(400).json({ error: 'client_id is verplicht' });
    }

    // Generate factuurnummer
    const year = new Date().getFullYear();
    const countResult = db.prepare("SELECT COUNT(*) as cnt FROM facturen WHERE factuurnummer LIKE ?").get(`F${year}%`) as any;
    const nummer = `F${year}-${String(countResult.cnt + 1).padStart(4, '0')}`;

    // Calculate totals from regels
    let totaal = 0;
    let btw = 0;
    const regelItems: Array<{
      prestatiecode?: string; omschrijving?: string; datum?: string;
      aantal?: number; tarief?: number; totaal?: number;
    }> = regels || [];

    for (const regel of regelItems) {
      const regelTotaal = (regel.aantal || 1) * (regel.tarief || 0);
      totaal += regelTotaal;
    }

    // GGZ is BTW-vrijgesteld, but allow override
    btw = req.body.btw || 0;

    const factuurDatum = datum || todayISO();
    const factuurVervaldatum = vervaldatum || (() => {
      const d = new Date(factuurDatum);
      d.setDate(d.getDate() + 30);
      return d.toISOString().slice(0, 10);
    })();

    const insertFactuur = db.prepare(`
      INSERT INTO facturen (id, factuurnummer, client_id, datum, vervaldatum, status, totaal, btw,
        declaratie_type, vecozo_status, notities, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertRegel = db.prepare(`
      INSERT INTO factuur_regels (id, factuur_id, prestatiecode, omschrijving, datum, aantal, tarief, totaal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      insertFactuur.run(id, nummer, client_id, factuurDatum, factuurVervaldatum,
        status || 'concept', totaal, btw, declaratie_type || null,
        vecozo_status || null, notities || null, nowISO());

      for (const regel of regelItems) {
        const regelTotaal = (regel.aantal || 1) * (regel.tarief || 0);
        insertRegel.run(uuidv4(), id, regel.prestatiecode || null,
          regel.omschrijving || null, regel.datum || factuurDatum,
          regel.aantal || 1, regel.tarief || 0, regelTotaal);
      }
    });

    transaction();

    const factuur = db.prepare(`
      SELECT f.*, c.voornaam, c.achternaam
      FROM facturen f
      LEFT JOIN clienten c ON f.client_id = c.id
      WHERE f.id = ?
    `).get(id) as any;
    factuur.regels = db.prepare('SELECT * FROM factuur_regels WHERE factuur_id = ?').all(id);

    res.status(201).json(factuur);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/ggz/facturen/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM facturen WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Factuur niet gevonden' });

    const fields = ['datum', 'vervaldatum', 'status', 'totaal', 'btw', 'declaratie_type', 'vecozo_status', 'notities'];
    const setClauses: string[] = [];
    const params: any[] = [];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'Geen velden om bij te werken' });
    }

    params.push(req.params.id);
    db.prepare(`UPDATE facturen SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);

    const factuur = db.prepare(`
      SELECT f.*, c.voornaam, c.achternaam
      FROM facturen f
      LEFT JOIN clienten c ON f.client_id = c.id
      WHERE f.id = ?
    `).get(req.params.id) as any;
    factuur.regels = db.prepare('SELECT * FROM factuur_regels WHERE factuur_id = ?').all(req.params.id);

    res.json(factuur);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/ggz/facturen/:id/status', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM facturen WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Factuur niet gevonden' });

    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is verplicht' });

    db.prepare('UPDATE facturen SET status = ? WHERE id = ?').run(status, req.params.id);

    const factuur = db.prepare(`
      SELECT f.*, c.voornaam, c.achternaam
      FROM facturen f
      LEFT JOIN clienten c ON f.client_id = c.id
      WHERE f.id = ?
    `).get(req.params.id) as any;
    factuur.regels = db.prepare('SELECT * FROM factuur_regels WHERE factuur_id = ?').all(req.params.id);

    res.json(factuur);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/ggz/facturen/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM facturen WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Factuur niet gevonden' });

    db.prepare('DELETE FROM facturen WHERE id = ?').run(req.params.id);
    res.json({ message: 'Factuur verwijderd' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ROUTES: ROM TEMPLATES
// ============================================================

app.get('/api/ggz/rom/templates', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM rom_templates ORDER BY naam').all();
    const parsed = rows.map((r: any) => ({
      ...r,
      vragen: JSON.parse(r.vragen),
      scoring_info: r.scoring_info ? JSON.parse(r.scoring_info) : null
    }));
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ROUTES: ROM METINGEN
// ============================================================

app.get('/api/ggz/rom/metingen', (req, res) => {
  try {
    const { client_id } = req.query;
    let sql = `
      SELECT m.*, t.naam as template_naam, t.code as template_code,
             c.voornaam, c.achternaam
      FROM rom_metingen m
      LEFT JOIN rom_templates t ON m.template_id = t.id
      LEFT JOIN clienten c ON m.client_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (client_id) {
      sql += ' AND m.client_id = ?';
      params.push(client_id);
    }

    sql += ' ORDER BY m.datum DESC';
    const rows = db.prepare(sql).all(...params);

    const parsed = rows.map((r: any) => ({
      ...r,
      antwoorden: r.antwoorden ? JSON.parse(r.antwoorden) : null
    }));

    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ggz/rom/metingen', (req, res) => {
  try {
    const id = uuidv4();
    const { client_id, template_id, datum, antwoorden, score, interpretatie, type } = req.body;

    if (!client_id || !template_id) {
      return res.status(400).json({ error: 'client_id en template_id zijn verplicht' });
    }

    // Calculate score from antwoorden if not provided
    let calculatedScore = score;
    if (calculatedScore === undefined && antwoorden) {
      const antwoordenArray = Array.isArray(antwoorden) ? antwoorden : [];
      calculatedScore = antwoordenArray.reduce((sum: number, a: any) => {
        const val = typeof a === 'number' ? a : (a?.waarde ?? 0);
        return sum + val;
      }, 0);
    }

    // Auto-interpret if not provided
    let calculatedInterpretatie = interpretatie;
    if (!calculatedInterpretatie && calculatedScore !== undefined) {
      const template = db.prepare('SELECT * FROM rom_templates WHERE id = ?').get(template_id) as any;
      if (template && template.scoring_info) {
        const scoring = JSON.parse(template.scoring_info);
        if (scoring.interpretatie) {
          for (const interp of scoring.interpretatie) {
            if (calculatedScore >= interp.range[0] && calculatedScore <= interp.range[1]) {
              calculatedInterpretatie = interp.label;
              break;
            }
          }
        }
      }
    }

    db.prepare(`
      INSERT INTO rom_metingen (id, client_id, template_id, datum, antwoorden, score, interpretatie, type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, client_id, template_id, datum || todayISO(),
      antwoorden ? JSON.stringify(antwoorden) : null,
      calculatedScore ?? null, calculatedInterpretatie || null,
      type || 'voormeting', nowISO());

    const created = db.prepare(`
      SELECT m.*, t.naam as template_naam, t.code as template_code
      FROM rom_metingen m
      LEFT JOIN rom_templates t ON m.template_id = t.id
      WHERE m.id = ?
    `).get(id) as any;

    if (created.antwoorden) {
      created.antwoorden = JSON.parse(created.antwoorden);
    }

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(`GGZ Practice Management API running on http://localhost:${PORT}`);
  console.log(`Database: ${path.join(dataDir, 'ggz.db')}`);
});

export default app;
