### The Last Standup

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-w4rh83wl)

Something I built to get a feel of vibe coding.

## The Story: 
A rogue former CTO named Dr. Marcus Pivot got tired of pivoting the company every sprint. He made contact with aliens and now commands their invasion from a modified standing desk using a Kanban board of doom.

## Characters

- **Chad Thunderpitch (CEO)** -- balanced fighter with motivational speeches  
- **Kay "K8s" Kubernetes (DevOps)** -- high defense, containerizes alien threats  
- **Devin Overflow (Full-Stack Dev)** -- high attack, copy-pastes from Stack Overflow  
- **Pixel McFigma (UX Designer)** -- tanky, makes aliens question their life choices  
- **Bug Buster Betty (QA Tester)** -- strong attacker, finds bugs in the invasion plan  
- **Patience "Ping" Patterson (Support Engineer)** -- tanky with good defense, decent HP. Weaponizes the thousand-yard customer service stare.  
- **Jira "Blocker" Jenkins (Product Manager)** -- Balanced all-around stats. Defeats aliens by scheduling them into back-to-back meetings.  
- **Gary "Always Closing" Grimes (Sales Representative)** -- Glass cannon -- highest attack potential but paper-thin defense. Tries to sell SaaS subscriptions mid-combat.  
- **Linda "Culture Fit" Liu (Recruiter/HR)** -- The ultimate tank -- highest HP and defense growths but barely any attack. Weaponizes rejection emails.  
- **Timmy "No-Salary" (The Intern)** -- works for experience, including combat experience  

Level-up stat growths by class (per level, random within range):

| Class       | HP   | ATK   | DEF   | Identity            |
|-------------|------|-------|-------|---------------------|
| CEO         | 1-4  | 1-3   | 0-3   | Strong leader       |
| Full-Stack  | 0-3  | 2-4   | 0-2   | Glass cannon        |
| DevOps      | 1-3  | 0-2   | 2-4   | Defensive           |
| Designer    | 1-4  | 1-3   | 1-3   | Balanced            |
| QA          | 0-3  | 1-4   | 0-3   | Offense-leaning     |
| Support     | 1-4  | 0-2   | 1-4   | Defensive tank      |
| PM          | 1-3  | 1-3   | 1-3   | Jack of all trades  |
| Sales       | 0-2  | 2-5   | 0-1   | Max offense, fragile|
| Recruiter   | 2-4  | 0-1   | 2-4   | Pure tank           |
| Intern      | 0-2  | 0-2   | 0-2   | Lowest growths      |

Each class has a unique pixel sprite, and premium overlays apply to all of them automatically through the existing Avatar system.

## Game Features

- Sign in with Google or email/password  
- Create, rename, and manage multiple agents  
- Turn-based battles against 8 alien enemy types plus the final boss  
- **"Knowledge Strike"** -- answer a computer science trivia question for double damage  
- **"Brain Shield"** -- answer a math trivia question to halve incoming damage  
- Characters gain EXP, level up, and randomly increase HP/Attack/Defense  
- Boss fight unlocks at level 3  
- Trivia is from [Open Trivia Database](https://opentdb.com/api_config.php)

## "Paying to Win" Premium Tier ($9.99/month via Stripe)

- Triples HP, Attack, and Defense on all characters  
- Adds a top hat, monocle, and fake mustache to character avatars  
- Gold "3x STATS" badge on character cards  
- Two Stripe edge functions deployed (checkout + webhook) to handle subscriptions  