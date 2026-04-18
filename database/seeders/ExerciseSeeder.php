<?php

namespace Database\Seeders;

use App\Models\AgeGroup;
use App\Models\Exercise;
use App\Models\Material;
use App\Models\User;
use Illuminate\Database\Seeder;

class ExerciseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'admin@basketball-trainer.local')->firstOrFail();
        $ageGroups = AgeGroup::all()->keyBy('label');
        $materials = Material::all()->keyBy('name');

        $exercises = [
            // --- Dribbelen (dribbling) ---
            [
                'title' => 'Zigzag dribbelen',
                'description' => 'Dribbel in zigzag-patroon tussen de pionnen door.',
                'explanation' => "Zet 6 pionnen in een zigzag-lijn met 2 meter ertussen.\n\nSpelers dribbelen met hun rechterhand naar rechts en wisselen naar links als ze naar links gaan. Focus op lage dribbel en snelle richtingsverandering.\n\nVariatie: gebruik alleen de zwakke hand.",
                'duration_minutes' => 10,
                'age_groups' => ['U8', 'U10', 'U12'],
                'materials' => ['basketball', 'cones'],
            ],
            [
                'title' => 'Dribbel tikspel',
                'description' => 'Tikspel waarbij iedereen moet dribbelen.',
                'explanation' => "Alle spelers dribbelen binnen het veld. Eén speler is de tikker en moet andere spelers tikken terwijl iedereen dribbelt.\n\nWie getikt wordt, wordt ook tikker. Laatste speler wint.\n\nRegel: als je de bal verliest, ben je automatisch af.",
                'duration_minutes' => 8,
                'age_groups' => ['U8', 'U10'],
                'materials' => ['basketball', 'cones'],
            ],
            [
                'title' => 'Crossover oefening',
                'description' => 'Oefen de crossover-dribbel op snelheid.',
                'explanation' => "Spelers staan op een rij bij de baseline. Op het fluitsignaal dribbelen ze naar voren en maken bij elke pion een crossover.\n\nLet op:\n- Bal laag houden\n- Explosieve eerste stap na de crossover\n- Hoofd omhoog\n\nDoe 3 sets per speler.",
                'duration_minutes' => 12,
                'age_groups' => ['U12', 'U14', 'U16'],
                'materials' => ['basketball', 'cones'],
            ],
            [
                'title' => 'Dribbelen met weerstand',
                'description' => 'Dribbel tegen lichte verdediging in.',
                'explanation' => "Spelers werken in tweetallen. De aanvaller dribbelt van baseline naar baseline, de verdediger biedt lichte weerstand (60%).\n\nDe aanvaller mag alle moves gebruiken: crossover, between the legs, behind the back.\n\nWissel na elke herhaling van rol.",
                'duration_minutes' => 15,
                'age_groups' => ['U14', 'U16', 'U18+'],
                'materials' => ['basketball'],
            ],
            [
                'title' => 'Blinde dribbel',
                'description' => 'Dribbelen zonder naar de bal te kijken.',
                'explanation' => "Spelers dribbelen vrij door de zaal. De trainer houdt vingers omhoog en spelers roepen het getal dat ze zien.\n\nDit traint balgevoel zonder visuele controle. Begin langzaam en verhoog het tempo.\n\nVariatie: voeg een tweede bal toe voor gevorderden.",
                'duration_minutes' => 8,
                'age_groups' => ['U10', 'U12', 'U14'],
                'materials' => ['basketball'],
            ],

            // --- Passen (passing) ---
            [
                'title' => 'Driehoek passen',
                'description' => 'Passeer de bal in driehoeksvorm met drie spelers.',
                'explanation' => "Drie spelers staan in een driehoek op 4 meter afstand. Ze passen de bal rond met chest passes.\n\nNa 1 minuut: wissel richting. Na 2 minuten: bounce pass. Na 3 minuten: overhead pass.\n\nLet op: stap naar de pass toe, handen als target.",
                'duration_minutes' => 6,
                'age_groups' => ['U8', 'U10', 'U12'],
                'materials' => ['basketball'],
            ],
            [
                'title' => 'Passeer en loop',
                'description' => 'Combineer passen met bewegen naar een nieuwe positie.',
                'explanation' => "Spelers staan in twee rijen tegenover elkaar. Speler 1 past naar speler 2 en sprint naar het einde van de andere rij.\n\nBegin met chest pass, daarna bounce pass. Verhoog het tempo geleidelijk.\n\nDoel: nauwkeurige passes terwijl je in beweging bent.",
                'duration_minutes' => 10,
                'age_groups' => ['U10', 'U12', 'U14'],
                'materials' => ['basketball'],
            ],
            [
                'title' => 'Full-court passing',
                'description' => 'Lange passes over het hele veld in tweetallen.',
                'explanation' => "Tweetallen rennen het veld op en neer terwijl ze de bal overpassen. De bal mag de grond niet raken.\n\nMaximaal 5 passes per lengte. Wie het in minder doet, wint.\n\nDit traint lange passes en communicatie.",
                'duration_minutes' => 10,
                'age_groups' => ['U14', 'U16', 'U18+'],
                'materials' => ['basketball'],
            ],

            // --- Schieten (shooting) ---
            [
                'title' => 'Lay-up lijnen',
                'description' => 'Basis lay-up oefening van beide kanten.',
                'explanation' => "Twee rijen: één rechts, één links van de basket. Spelers dribbelen naar de basket en maken een lay-up.\n\nRechts: rechterhand lay-up (links-rechts-omhoog)\nLinks: linkerhand lay-up (rechts-links-omhoog)\n\nTel de scores: doel is 20 raak per kant.",
                'duration_minutes' => 12,
                'age_groups' => ['U8', 'U10', 'U12', 'U14'],
                'materials' => ['basketball'],
            ],
            [
                'title' => 'Spot shooting',
                'description' => 'Schiet vanaf 5 vaste posities rondom de ring.',
                'explanation' => "Markeer 5 posities met pionnen: beide hoeken, beide vleugels en de top. Spelers schieten van elke positie en tellen hun score.\n\n2 punten per raak schot. Wie als eerste 20 punten heeft, wint.\n\nPas de afstand aan per leeftijdsgroep.",
                'duration_minutes' => 15,
                'age_groups' => ['U12', 'U14', 'U16'],
                'materials' => ['basketball', 'cones'],
            ],
            [
                'title' => 'Free throw challenge',
                'description' => 'Vrije worpen competitie onder druk.',
                'explanation' => "Elke speler schiet 10 vrije worpen. Na elk schot rent de speler naar de middenlijn en terug (vermoeidheid simuleren).\n\nHoud de scores bij op het scorebord. Bespreek routine en focus.\n\nVariatie: het team moet samen 50 raak scoren.",
                'duration_minutes' => 15,
                'age_groups' => ['U12', 'U14', 'U16', 'U18+'],
                'materials' => ['basketball'],
            ],
            [
                'title' => 'Shoot and relocate',
                'description' => 'Schiet, pak je rebound en verplaats naar een nieuwe positie.',
                'explanation' => "Speler schiet, pakt eigen rebound, dribbelt naar een nieuwe pion-positie en schiet opnieuw.\n\nDoel: 10 rake schoten zo snel mogelijk. Klok de tijd.\n\nDit traint snelle verplaatsing en schietklaarheid.",
                'duration_minutes' => 12,
                'age_groups' => ['U14', 'U16', 'U18+'],
                'materials' => ['basketball', 'cones'],
            ],

            // --- Verdedigen (defense) ---
            [
                'title' => 'Slidepass oefening',
                'description' => 'Defensieve slides langs de zijlijn.',
                'explanation' => "Spelers staan in de defensive stance op de baseline. Op het fluitsignaal maken ze defensieve slides naar de vrijworplijn, middenlijn, andere vrijworplijn en baseline.\n\nLet op:\n- Voeten kruisen niet\n- Blijf laag\n- Handen actief\n\nDoe 3 herhalingen.",
                'duration_minutes' => 8,
                'age_groups' => ['U10', 'U12', 'U14', 'U16'],
                'materials' => [],
            ],
            [
                'title' => '1-tegen-1 verdedigen',
                'description' => 'Individueel verdedigen in een afgekaderd gebied.',
                'explanation' => "Gebruik pionnen om een klein veld te markeren (5x5 meter). De aanvaller probeert te scoren, de verdediger probeert de bal te stelen of een slechte pass af te dwingen.\n\nSpeel tot 3 punten, dan wisselen.\n\nCoachpunt: dwing de aanvaller naar de zijlijn.",
                'duration_minutes' => 15,
                'age_groups' => ['U12', 'U14', 'U16', 'U18+'],
                'materials' => ['basketball', 'cones'],
            ],
            [
                'title' => 'Close-out drill',
                'description' => 'Sprint naar de aanvaller en neem een goede verdedigingspositie in.',
                'explanation' => "Verdediger start onder de basket. De aanvaller staat op de driepuntlijn met de bal.\n\nDe verdediger sprint naar de aanvaller (close-out) met korte stappen aan het einde. De aanvaller mag 1 dribbel maken of schieten.\n\nFocus: gecontroleerde close-out, niet te ver doorlopen.",
                'duration_minutes' => 10,
                'age_groups' => ['U14', 'U16', 'U18+'],
                'materials' => ['basketball'],
            ],

            // --- Conditie (conditioning) ---
            [
                'title' => 'Suicides',
                'description' => 'Klassieke hardloopoefening met toenemende afstand.',
                'explanation' => "Spelers starten op de baseline en sprinten naar:\n1. Vrijworplijn en terug\n2. Middenlijn en terug\n3. Andere vrijworplijn en terug\n4. Andere baseline en terug\n\nDoe 3-5 sets met 1 minuut rust ertussen.",
                'duration_minutes' => 10,
                'age_groups' => ['U14', 'U16', 'U18+'],
                'materials' => [],
            ],
            [
                'title' => 'Ladder footwork',
                'description' => 'Snelle voetenwerk oefeningen met de speedladder.',
                'explanation' => "Leg de speedladder op de grond. Spelers doen verschillende patronen:\n\n1. Twee voeten in elk vak\n2. Zijwaarts in-en-uit\n3. Icky shuffle\n4. Crossover stap\n\nElke speler doet elk patroon 3 keer. Focus op snelheid EN precisie.",
                'duration_minutes' => 12,
                'age_groups' => ['U10', 'U12', 'U14', 'U16'],
                'materials' => ['ladder'],
            ],
            [
                'title' => 'Hoepel sprint circuit',
                'description' => 'Sprintcircuit met hoepels voor voetcoördinatie.',
                'explanation' => "Leg hoepels in een parcours op de grond. Spelers sprinten naar elke hoepel en moeten met beide voeten erin landen.\n\nCombineer met zijwaartse sprongen en achterwaarts lopen.\n\nDoe 4 rondes, 30 seconden rust per ronde.",
                'duration_minutes' => 10,
                'age_groups' => ['U8', 'U10', 'U12'],
                'materials' => ['hoops', 'cones'],
            ],

            // --- Teamspel (team play) ---
            [
                'title' => '3-tegen-2 fastbreak',
                'description' => 'Fastbreak oefening met numeriek overwicht.',
                'explanation' => "3 aanvallers starten op de middenlijn, 2 verdedigers staan al bij de basket. De aanvallers moeten snel scoren voordat de verdediging georganiseerd is.\n\nRegel: maximaal 4 seconden om te scoren.\n\nNa de aanval worden de 2 verdedigers aanvallers (met 1 extra speler) en gaan de andere kant op.",
                'duration_minutes' => 15,
                'age_groups' => ['U14', 'U16', 'U18+'],
                'materials' => ['basketball', 'bibs'],
            ],
            [
                'title' => 'Give and go',
                'description' => 'Oefen de basiscombinatie: pass en loop naar de basket.',
                'explanation' => "Speler 1 staat op de vleugel, speler 2 op de top. Speler 1 past naar speler 2 en snijdt naar de basket. Speler 2 past terug voor de lay-up.\n\nDoe 5 herhalingen per kant, dan wisselen.\n\nCoachpunt: snij explosief, niet in een boog.",
                'duration_minutes' => 10,
                'age_groups' => ['U10', 'U12', 'U14'],
                'materials' => ['basketball'],
            ],
            [
                'title' => 'Shell drill',
                'description' => '4-tegen-4 defensieve rotatie oefening.',
                'explanation' => "4 aanvallers staan in een halve maan rondom de driepuntlijn. 4 verdedigers moeten juist roteren bij elke pass.\n\nRegels:\n- Aanvallers mogen alleen passen (niet dribbelen)\n- Verdedigers oefenen help-side en ball-side positie\n- Na 6 passes mogen aanvallers aanvallen\n\nDit is de basis van teamverdediging.",
                'duration_minutes' => 15,
                'age_groups' => ['U14', 'U16', 'U18+'],
                'materials' => ['basketball', 'bibs'],
            ],

            // --- Warming-up ---
            [
                'title' => 'Dynamische warming-up',
                'description' => 'Complete warming-up met dynamische stretches.',
                'explanation' => "Spelers lopen van baseline naar baseline met de volgende oefeningen:\n\n1. Hoge knieën\n2. Hakken tegen billen\n3. Zijwaarts shufflen\n4. Kariokaloop\n5. Armzwaaien\n6. Lunges met rotatie\n\nElke oefening 1 keer het veld over.",
                'duration_minutes' => 8,
                'age_groups' => ['U8', 'U10', 'U12', 'U14', 'U16', 'U18+'],
                'materials' => [],
            ],
            [
                'title' => 'Bal warming-up',
                'description' => 'Warming-up met de bal: dribbelen en passen combineren.',
                'explanation' => "Alle spelers hebben een bal. Ze dribbelen vrij door de zaal en voeren op het fluitsignaal een opdracht uit:\n\n1 fluit: stop en wissel van hand\n2 fluiten: bounce pass met dichtstbijzijnde speler\n3 fluiten: ga op je rug liggen, sta op en dribbel verder\n\nDuur: 5 minuten non-stop.",
                'duration_minutes' => 5,
                'age_groups' => ['U8', 'U10', 'U12', 'U14'],
                'materials' => ['basketball'],
            ],

            // --- Extra oefeningen voor paginatie ---
            [
                'title' => 'Rebound positionering',
                'description' => 'Oefen box-out techniek en rebound timing.',
                'explanation' => "Spelers werken in tweetallen bij de basket. De coach schiet, en beide spelers strijden om de rebound.\n\nDe verdediger moet eerst een box-out maken (contact, brede basis, billen laag) voordat hij de rebound pakt.\n\nDoe 10 herhalingen per tweetal.",
                'duration_minutes' => 12,
                'age_groups' => ['U12', 'U14', 'U16', 'U18+'],
                'materials' => ['basketball'],
            ],
            [
                'title' => 'Pylon dribbel race',
                'description' => 'Snelheidsdribbel wedstrijd door een pylonenparcours.',
                'explanation' => "Zet een parcours van 10 pylonen neer. Twee spelers racen tegelijk door het parcours terwijl ze dribbelen.\n\nBij elke pylon moeten ze een move maken (afwisselend crossover en between the legs).\n\nDe snelste wint. Verliezers doen 5 push-ups.",
                'duration_minutes' => 10,
                'age_groups' => ['U10', 'U12', 'U14'],
                'materials' => ['basketball', 'cones'],
            ],
            [
                'title' => 'Chest pass muur oefening',
                'description' => 'Individuele passtechniek oefening tegen de muur.',
                'explanation' => "Spelers staan op 2 meter van de muur en passen de bal met een chest pass tegen de muur.\n\nDoel: 50 passes in 1 minuut. Focus op techniek:\n- Duimen naar beneden bij het einde van de pass\n- Stap naar voren\n- Vang met zachte handen\n\nDoe 3 sets.",
                'duration_minutes' => 5,
                'age_groups' => ['U8', 'U10'],
                'materials' => ['basketball'],
            ],
            [
                'title' => 'Pivot voet oefening',
                'description' => 'Oefen de pivot voet met en zonder druk.',
                'explanation' => "Spelers pakken de bal op en mogen niet meer bewegen (reisregel). Ze oefenen:\n\n1. Voorwaartse pivot (sweep)\n2. Achterwaartse pivot\n3. Pivot naar schietpositie\n4. Pivot naar passpositie\n\nDaarna met een verdediger die lichte druk geeft.",
                'duration_minutes' => 8,
                'age_groups' => ['U8', 'U10', 'U12'],
                'materials' => ['basketball'],
            ],
            [
                'title' => 'Outlet pass drill',
                'description' => 'Oefen de outlet pass na een rebound.',
                'explanation' => "De rebounder pakt de bal van het bord en draait naar de zijlijn om een outlet pass te geven aan de guard.\n\nDe guard sprint naar de zijlijn en biedt zich aan als aanspeelpunt.\n\nDit is de start van de fastbreak. Oefen beide kanten.\n\nDoe 8 herhalingen per speler.",
                'duration_minutes' => 10,
                'age_groups' => ['U14', 'U16', 'U18+'],
                'materials' => ['basketball'],
            ],
            [
                'title' => 'Twee-bal dribbelen',
                'description' => 'Dribbel met twee ballen tegelijk voor coördinatie.',
                'explanation' => "Spelers dribbelen met twee ballen tegelijk. Begin stilstaand:\n\n1. Beide ballen tegelijk (sync)\n2. Afwisselend (async)\n3. Lopend naar voren\n4. Lopend met richtingsveranderingen\n\nDit is een uitstekende oefening voor balgevoel en coördinatie.",
                'duration_minutes' => 10,
                'age_groups' => ['U12', 'U14', 'U16'],
                'materials' => ['basketball'],
            ],
            [
                'title' => 'Hesitatie dribbel',
                'description' => 'Oefen de hesitatie (aarzeldribbel) om de verdediger te misleiden.',
                'explanation' => "Spelers dribbelen naar een pion en maken een hesitatie move: doe alsof je stopt, en versnel dan.\n\nBelangrijke punten:\n- Verander van snelheid (niet alleen richting)\n- Gebruik je schouders en ogen om te faken\n- Explosieve versnelling na de hesitatie\n\n5 herhalingen per kant.",
                'duration_minutes' => 10,
                'age_groups' => ['U12', 'U14', 'U16', 'U18+'],
                'materials' => ['basketball', 'cones'],
            ],
        ];

        foreach ($exercises as $data) {
            $exercise = Exercise::create([
                'user_id' => $user->id,
                'title' => $data['title'],
                'description' => $data['description'],
                'explanation' => $data['explanation'],
                'youtube_url' => 'https://www.youtube.com/watch?v=jg6C7fJdUrc',
                'duration_minutes' => $data['duration_minutes'],
            ]);

            $ageGroupIds = collect($data['age_groups'])
                ->map(fn (string $label) => $ageGroups[$label]->id)
                ->all();
            $exercise->ageGroups()->attach($ageGroupIds);

            if (! empty($data['materials'])) {
                $materialIds = collect($data['materials'])
                    ->map(fn (string $name) => $materials[$name]->id)
                    ->all();
                $exercise->materials()->attach($materialIds);
            }
        }
    }
}
