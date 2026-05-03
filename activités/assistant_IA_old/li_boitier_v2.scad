// ============================================================
//  LI — Boîtier Assistant Vocal IA
//  Raspberry Pi 5 + Écran TFT ST7735 240×240 + ReSpeaker HAT
//  Fichier OpenSCAD paramétrique — exportable en STL
//
//  USAGE :
//    1. Ouvrir dans OpenSCAD (openscad.org — gratuit)
//    2. Choisir la pièce à afficher : variable PIECE ci-dessous
//       "base"      → partie inférieure avec piliers RPi5
//       "couvercle" → partie supérieure avec écran + micro
//       "both"      → aperçu assemblé (non imprimable tel quel)
//    3. Appuyer sur F6 (rendu final) puis Fichier → Exporter → STL
//
//  IMPRESSION RECOMMANDÉE :
//    Matériau  : PETG (résistance thermique) ou PLA+
//    Buse      : 0.4 mm
//    Couche    : 0.2 mm
//    Rempliss. : 25 % Gyroid
//    Supports  : oui (fenêtre écran, grilles)
//    Périmètres: 3 minimum
// ============================================================

// ── Pièce à afficher ─────────────────────────────────────────
// Mettre à true/false selon ce que vous voulez voir/exporter
AFFICHER_BASE      = true;
AFFICHER_COUVERCLE = true;
// Si les deux sont true  → aperçu assemblé (non imprimable tel quel)
// Si seulement BASE      → exporter en STL pour impression
// Si seulement COUVERCLE → exporter en STL pour impression

// ── Paramètres globaux du boîtier ────────────────────────────
L  = 130;   // longueur extérieure (mm)
la = 85;    // largeur extérieure  (mm)
H  = 60;    // hauteur totale assemblée (mm)

ep = 2.8;   // épaisseur de paroi
jeu = 0.3;  // jeu d'assemblage base/couvercle

H_base = 35;       // hauteur de la partie base
H_couvercle = H - H_base + ep; // chevauchement inclus

// ── Raspberry Pi 5 ───────────────────────────────────────────
// Dimensions PCB officiel : 85 × 56 mm
// Trous de fixation : 58 × 49 mm (centre à centre)
RPI_L  = 85;
RPI_la = 56;
RPI_trou_L  = 58;   // espacement trous axe longueur
RPI_trou_la = 49;   // espacement trous axe largeur
RPI_trou_r  = 1.4;  // rayon trou M2.5 (perçage)
RPI_pilier_r = 3.0; // rayon pilier de montage
RPI_pilier_h = 4.0; // hauteur pilier (garde-PCB)
RPI_ep_pcb   = 1.6; // épaisseur PCB

// Position du RPi5 dans la base (centré, décalé vers l'arrière)
RPI_x = (L - RPI_L) / 2;
RPI_y = (la - RPI_la) / 2 + 4;
RPI_z = ep;  // posé sur le fond + piliers

// ── Écran TFT ST7735 240×240 1.3" ────────────────────────────
// Dimensions PCB module : 33.5 × 33.5 mm
// Zone visible : 25 × 25 mm (ouverture fenêtre)
SCR_pcb_l  = 33.5;
SCR_pcb_la = 33.5;
SCR_fenetre_l  = 27;   // fenêtre visible + 1mm marge
SCR_fenetre_la = 27;
SCR_ep     = 3.0;   // épaisseur totale module écran
SCR_bordure = 3.0;  // cadre autour de la fenêtre

// Position écran : centré sur la façade, haut du couvercle
SCR_x = (L - SCR_fenetre_l) / 2;
SCR_y = la - ep - SCR_ep;  // encastré dans la paroi arrière
SCR_z_depuis_fond_couv = 12; // depuis le haut intérieur du couvercle

// ── Microphone ReSpeaker HAT ──────────────────────────────────
// Ouverture circulaire sur le dessus du couvercle
MIC_r     = 11;    // rayon ouverture (22mm diamètre)
MIC_grille_r = 0.8; // rayon des trous de la grille
MIC_x     = L / 2; // centré en longueur
MIC_y     = la - 28; // décalé vers l'avant

// ── Haut-parleur 40mm ─────────────────────────────────────────
HP_r      = 20;    // rayon ouverture HP 40mm
HP_grille_r = 1.0; // trous grille HP
HP_x      = L / 2;
HP_y      = 28;    // côté avant de la base

// ── Ports latéraux (côté droit = RPi5 ports natifs) ──────────
// USB-A × 2 : 14 × 8 mm
// USB-C     : 10 × 4 mm (arrondi)
// Ethernet  : 16 × 14 mm
// HDMI micro: 12 × 6 mm × 2

// Position Z des ports depuis le bas intérieur de la base
PORTS_z_base = ep + RPI_pilier_h + RPI_ep_pcb + 1;

// Côté droit du boîtier (x = L)
USB_A_w = 14; USB_A_h = 8.5;
USB_C_w = 10; USB_C_h = 5;
ETH_w   = 17; ETH_h   = 14.5;
HDMI_w  = 12; HDMI_h  = 6.5;

// Positions Y sur le côté droit (correspondant aux ports RPi5)
USB_A1_y = RPI_y + 9;
USB_A2_y = RPI_y + 27;
USB_C_y  = RPI_y + 56;
ETH_y    = RPI_y + 45;
HDMI1_y  = la - ep - 25;
HDMI2_y  = la - ep - 10;

// ── Passage câble USB-C alimentation (côté gauche) ───────────
ALIM_w = 14; ALIM_h = 8;
ALIM_y = la / 2;

// ── Visserie assemblage base/couvercle ────────────────────────
// 4 vis M2.5 dans les coins
VIS_r    = 1.35; // perçage M2.5
INSERT_r = 2.0;  // insert laiton Ø4mm
INSERT_h = 5.0;
VIS_marge = 6;   // distance au coin

// Positions des 4 vis
vis_positions = [
    [VIS_marge,      VIS_marge     ],
    [L - VIS_marge,  VIS_marge     ],
    [VIS_marge,      la - VIS_marge],
    [L - VIS_marge,  la - VIS_marge]
];

// ── Pieds antidérapants (base) ────────────────────────────────
PIED_r = 5;
PIED_h = 2;

// ── Rendu de la scène ─────────────────────────────────────────
if (AFFICHER_BASE && AFFICHER_COUVERCLE) {
    color("#1e2d3d") base();
    translate([0, 0, H_base - ep])
        color("#243545", 0.85) couvercle();
} else if (AFFICHER_BASE) {
    base();
} else if (AFFICHER_COUVERCLE) {
    couvercle();
}


// ============================================================
//  MODULE BASE
// ============================================================
module base() {
    difference() {
        union() {
            // Corps principal arrondi
            coque_arrondie(L, la, H_base, ep, r=4);

            // Piliers de montage RPi5
            piliers_rpi();

            // Bossages vis assemblage (intérieur)
            bossages_vis_base();

            // Rebord femelle d'assemblage
            rebord_femelle();
        }

        // ── Découpes ──────────────────────────────────────

        // Évider l'intérieur
        translate([ep, ep, ep])
            cube([L - 2*ep, la - 2*ep, H_base]);

        // Ports côté droit (x = L)
        ports_droit();

        // Passage câble alimentation côté gauche (x = 0)
        translate([-1, ALIM_y - ALIM_w/2, PORTS_z_base])
            cube([ep + 2, ALIM_w, ALIM_h]);

        // Grille haut-parleur façade avant (y = 0)
        grille_hp();

        // Perçages vis
        percages_vis_base();

        // Logo "Li" gravé sur le dessus
        logo_grave();
    }

    // Pieds sous la base
    pieds();
}


// ============================================================
//  MODULE COUVERCLE
// ============================================================
module couvercle() {
    difference() {
        union() {
            // Corps principal
            coque_arrondie(L, la, H_couvercle, ep, r=4);

            // Tenon mâle d'assemblage (s'emboîte dans rebord base)
            tenon_male();

            // Bossages vis (intérieur couvercle)
            bossages_vis_couvercle();

            // Cadre de maintien écran (intérieur)
            cadre_ecran();
        }

        // ── Découpes ──────────────────────────────────────

        // Évider l'intérieur
        translate([ep, ep, ep])
            cube([L - 2*ep, la - 2*ep, H_couvercle]);

        // Fenêtre écran TFT (façade arrière y = la)
        fenetre_ecran();

        // Grille microphone ReSpeaker (dessus)
        grille_micro();

        // Grille ventilation Active Cooler (dessus)
        grille_ventilation();

        // Perçages vis couvercle
        percages_vis_couvercle();
    }
}


// ============================================================
//  MODULES CONSTRUCTIFS
// ============================================================

// ── Coque de base arrondie ────────────────────────────────────
module coque_arrondie(lx, ly, lz, e, r=4) {
    hull() {
        translate([r,    r,    0]) cylinder(r=r, h=lz, $fn=32);
        translate([lx-r, r,    0]) cylinder(r=r, h=lz, $fn=32);
        translate([r,    ly-r, 0]) cylinder(r=r, h=lz, $fn=32);
        translate([lx-r, ly-r, 0]) cylinder(r=r, h=lz, $fn=32);
    }
}

// ── Piliers de montage RPi5 ───────────────────────────────────
module piliers_rpi() {
    // Les 4 trous de fixation du RPi5
    offsets = [
        [0,          0         ],
        [RPI_trou_L, 0         ],
        [0,          RPI_trou_la],
        [RPI_trou_L, RPI_trou_la]
    ];
    // Origine du réseau de trous (coin bas-gauche du PCB)
    ox = RPI_x + (RPI_L  - RPI_trou_L)  / 2;
    oy = RPI_y + (RPI_la - RPI_trou_la) / 2;

    for (off = offsets) {
        translate([ox + off[0], oy + off[1], ep]) {
            difference() {
                cylinder(r=RPI_pilier_r, h=RPI_pilier_h, $fn=24);
                cylinder(r=RPI_trou_r,  h=RPI_pilier_h + 1, $fn=18);
            }
        }
    }
}

// ── Rebord femelle (base reçoit le couvercle) ────────────────
module rebord_femelle() {
    ep_rebord = 1.5;
    h_rebord  = 6;
    translate([ep, ep, H_base - h_rebord])
        difference() {
            cube([L - 2*ep, la - 2*ep, h_rebord]);
            translate([ep_rebord, ep_rebord, -1])
                cube([L - 2*ep - 2*ep_rebord,
                      la - 2*ep - 2*ep_rebord,
                      h_rebord + 2]);
        }
}

// ── Tenon mâle (couvercle s'insère dans rebord base) ─────────
module tenon_male() {
    ep_tenon = 1.5 - jeu;
    h_tenon  = 5.5;
    translate([ep + ep_tenon + jeu, ep + ep_tenon + jeu, 0])
        difference() {
            cube([L - 2*ep - 2*(ep_tenon + jeu),
                  la - 2*ep - 2*(ep_tenon + jeu),
                  h_tenon]);
            translate([ep_tenon, ep_tenon, -1])
                cube([L - 2*ep - 4*ep_tenon - 4*jeu,
                      la - 2*ep - 4*ep_tenon - 4*jeu,
                      h_tenon + 2]);
        }
}

// ── Cadre de maintien de l'écran (intérieur couvercle) ───────
module cadre_ecran() {
    // Cadre qui retient le module écran par l'arrière
    cx = SCR_x - SCR_bordure;
    cy = la - ep - SCR_ep - 2;
    cz = ep + SCR_z_depuis_fond_couv;
    cL = SCR_pcb_l + 2 * SCR_bordure;
    cla = SCR_ep + 2;

    translate([cx, cy, cz])
        difference() {
            cube([cL, cla, SCR_pcb_la + 2 * SCR_bordure]);
            // Logement PCB écran
            translate([SCR_bordure - 0.5, -1, SCR_bordure - 0.5])
                cube([SCR_pcb_l + 1, cla + 2, SCR_pcb_la + 1]);
        }
}

// ── Bossages pour inserts laiton (base) ──────────────────────
module bossages_vis_base() {
    for (pos = vis_positions) {
        translate([pos[0], pos[1], ep])
            cylinder(r=INSERT_r + 2, h=INSERT_h + 2, $fn=20);
    }
}

// ── Perçages vis dans la base ─────────────────────────────────
module percages_vis_base() {
    for (pos = vis_positions) {
        translate([pos[0], pos[1], -1])
            cylinder(r=INSERT_r, h=INSERT_h + ep + 2, $fn=18);
    }
}

// ── Bossages et perçages vis dans le couvercle ───────────────
module bossages_vis_couvercle() {
    for (pos = vis_positions) {
        translate([pos[0], pos[1], ep])
            cylinder(r=VIS_r + 3, h=8, $fn=20);
    }
}

module percages_vis_couvercle() {
    for (pos = vis_positions) {
        translate([pos[0], pos[1], -1])
            cylinder(r=VIS_r, h=H_couvercle + 2, $fn=18);
    }
}

// ── Fenêtre écran TFT dans le couvercle ──────────────────────
module fenetre_ecran() {
    // Ouverture rectangulaire arrondie pour la fenêtre visible
    translate([SCR_x, la - ep - 1, ep + SCR_z_depuis_fond_couv + SCR_bordure])
        cube([SCR_fenetre_l, ep + 2, SCR_fenetre_la]);

    // Logement PCB complet (légèrement plus grand que fenêtre)
    translate([SCR_x - 2, la - ep - SCR_ep, ep + SCR_z_depuis_fond_couv])
        cube([SCR_fenetre_l + 4, SCR_ep + ep, SCR_fenetre_la + 4]);
}

// ── Grille micro ReSpeaker (cercle de petits trous) ──────────
module grille_micro() {
    z_top = H_couvercle - 1; // depuis le bas du couvercle
    // Cercle externe de trous
    for (angle = [0 : 30 : 359]) {
        translate([MIC_x + (MIC_r - 3) * cos(angle),
                   MIC_y + (MIC_r - 3) * sin(angle),
                   z_top])
            cylinder(r=MIC_grille_r, h=ep + 2, $fn=14);
    }
    // Cercle intermédiaire
    for (angle = [0 : 45 : 359]) {
        translate([MIC_x + (MIC_r - 7) * cos(angle),
                   MIC_y + (MIC_r - 7) * sin(angle),
                   z_top])
            cylinder(r=MIC_grille_r, h=ep + 2, $fn=14);
    }
    // Trou central
    translate([MIC_x, MIC_y, z_top])
        cylinder(r=MIC_grille_r * 1.5, h=ep + 2, $fn=14);
}

// ── Grille de ventilation Active Cooler (dessus couvercle) ────
module grille_ventilation() {
    // Zone : 55 × 30 mm centrée au-dessus de l'emplacement cooler
    grill_x0 = (L - 55) / 2;
    grill_y0 = la / 2 - 8;
    z_top    = H_couvercle - 1;

    // Fentes horizontales
    for (j = [0 : 5 : 25]) {
        translate([grill_x0, grill_y0 + j, z_top])
            cube([55, 2.5, ep + 2]);
    }
}

// ── Grille haut-parleur 40mm (façade avant base) ─────────────
module grille_hp() {
    // Trous circulaires en nid d'abeille sur la façade y=0
    pitch = 4.5;
    r_trou = 1.4;
    for (col = [-4 : 4]) {
        for (row = [-4 : 4]) {
            px = HP_x + col * pitch + ((row % 2 == 0) ? 0 : pitch/2);
            pz = H_base / 2 + row * pitch * 0.866;
            d  = sqrt(pow(px - HP_x, 2) + pow(pz - H_base/2, 2));
            if (d < HP_r - 2) {
                translate([px, -1, pz])
                    rotate([-90, 0, 0])
                        cylinder(r=r_trou, h=ep + 2, $fn=12);
            }
        }
    }
}

// ── Ports côté droit (USB, Ethernet, HDMI) ───────────────────
module ports_droit() {
    z = PORTS_z_base;

    // USB-A × 2
    translate([L - ep - 1, USB_A1_y, z])
        cube([ep + 2, USB_A_w, USB_A_h]);
    translate([L - ep - 1, USB_A2_y, z])
        cube([ep + 2, USB_A_w, USB_A_h]);

    // USB-C alimentation
    translate([L - ep - 1, USB_C_y, z])
        rounded_slot(ep + 2, USB_C_w, USB_C_h, 2);

    // Ethernet
    translate([L - ep - 1, ETH_y, z])
        cube([ep + 2, ETH_w, ETH_h]);

    // Micro-HDMI × 2
    translate([L - ep - 1, HDMI1_y, z + 2])
        cube([ep + 2, HDMI_w, HDMI_h]);
    translate([L - ep - 1, HDMI2_y, z + 2])
        cube([ep + 2, HDMI_w, HDMI_h]);
}

// ── Logo "Li" gravé en creux ──────────────────────────────────
module logo_grave() {
    // Gravure 0.4mm de profondeur sur le dessus de la base
    translate([L / 2, la / 2, H_base - 0.4])
        linear_extrude(height=1)
            text("Li", size=10, font="Arial:style=Bold",
                 halign="center", valign="center");
}

// ── Pieds antidérapants ───────────────────────────────────────
module pieds() {
    pied_positions = [
        [PIED_r + 6,     PIED_r + 6    ],
        [L - PIED_r - 6, PIED_r + 6    ],
        [PIED_r + 6,     la - PIED_r - 6],
        [L - PIED_r - 6, la - PIED_r - 6]
    ];
    for (pos = pied_positions) {
        translate([pos[0], pos[1], 0])
            cylinder(r=PIED_r, h=PIED_h, $fn=24);
    }
}

// ── Utilitaire : slot arrondi ─────────────────────────────────
module rounded_slot(depth, width, height, r) {
    hull() {
        translate([0, r, r])
            rotate([0, 90, 0]) cylinder(r=r, h=depth, $fn=16);
        translate([0, r, height - r])
            rotate([0, 90, 0]) cylinder(r=r, h=depth, $fn=16);
        translate([0, width - r, r])
            rotate([0, 90, 0]) cylinder(r=r, h=depth, $fn=16);
        translate([0, width - r, height - r])
            rotate([0, 90, 0]) cylinder(r=r, h=depth, $fn=16);
    }
}

// (% est natif en OpenSCAD 2021+)


// ============================================================
//  NOTES D'ASSEMBLAGE
// ============================================================
//
//  ORDRE DE MONTAGE :
//  1. Imprimer base et couvercle séparément
//  2. Insérer 4 inserts laiton M2.5×5 dans la base (fer à souder)
//  3. Fixer le RPi5 sur les piliers avec 4 vis M2.5×8
//  4. Câbler l'écran ST7735 sur les GPIO (voir tableau dans TP)
//  5. Placer l'écran dans son cadre (couvercle)
//  6. Connecter le ReSpeaker HAT sur les GPIO 40 broches
//  7. Faire passer les câbles, emboîter couvercle sur base
//  8. Visser avec 4 vis M2.5×12
//
//  TOLÉRANCES :
//  - Jeu base/couvercle : 0.3 mm (ajuster si impression serrée)
//  - Jeu piliers RPi5   : trous à 1.4 mm pour M2.5 (autofiletant)
//  - Fenêtre écran      : ±0.5 mm selon imprimante
//
//  MATÉRIAU :
//  - PETG recommandé (Tg ~80°C, Active Cooler chauffe)
//  - PLA+ acceptable si ventilation suffisante
//
// ============================================================
