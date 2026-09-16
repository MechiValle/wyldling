# Wyldling

An interactive companion guide for **Wylde Flowers**, built for completionists who want to track missable content without browsing through the wiki.

Live site: [Wyldling](https://wyldling.vercel.app)

## About

Wyldling is not a wiki. It intentionally avoids duplicating information the game already displays clearly on screen — ingredient lists, prices, stats. Instead, it focuses on the things that are easy to miss or forget across a long playthrough: where and when to find something, who wants it as a gift, and when relationship events actually trigger.

All game data was collected by hand through a full 100% playthrough on both PC and Switch, cross-referenced against community resources where noted.

## Features

### Fish
Browse every catchable fish, filterable by location. Each entry shows its shape (relevant to the fishing minigame) and every valid combination of bait, weather, and time of day needed to catch it. Mark fish as caught to track your progress.

### Food
Every cookable dish and giftable edible or drinkable item, organized by kitchen station (Raw, Cooking Pot, Stovetop, Oven, Dessert, Drink) to mirror the game's own menu structure. Each entry shows how and where to unlock its recipe. Mark recipes as found to track your
progress.

### Characters
Browse all villagers, or switch to the Favorite Gifts view for an at-a-glance table of every character's favorite foods and whether you've delivered them. Each character's page also lists every relationship milestone, from Acquaintance through Partner for romanceable characters, with plain-language instructions for when and where each one triggers.

### Shops
Browse every shop and its owner, or switch to the Schedule view for a full weekly grid showing which shops are open on which days at a glance.

### Animals
Browse the six farmable animals, or switch to the Breeding Chart view to see which color variant each animal produces per season, and what that variant yields.

### Clothing
All craftable outfits, organized by category (Casual, Work, Formal, Magic), each showing the
exact materials and quantities required. A dedicated "Items still needed" view calculates,
in real time, the total remaining materials required to complete every outfit you haven't yet crafted — automatically updating as you check outfits off.

### Hairstyles
The same system as Clothing, applied to unlockable hairstyles: browse by materials required, track what you've unlocked, and see a live-updating total of what's still needed.

### Tips
A collection of strategy notes and lesser-known tips from an experienced player, tagged by topic (including a dedicated Spoilers tag for anyone wanting to avoid story-related information) and filterable accordingly.

### Cheats
A calculator for the well-known, developer-acknowledged Fish Fingers trick — enter a budget and instantly see how much to spend on tuna and flour, and what the resulting profit looks
like after selling.

### Search
A site-wide search across fish, food, characters, shops, outfits, and hairstyles, with debounced input and results that open directly into the same detail view used throughout the rest of the site.

### Progress tracking
No accounts, no sign-in. All progress (fish caught, recipes found, gifts delivered, relationship milestones reached, outfits crafted, hairstyles unlocked) is stored locally in your browser. A Settings page allows exporting your progress to a file for backup, importing it back on any device or after clearing browser data, and resetting individual categories or everything at once.

## Tech stack

- **React** with **TypeScript**, built on **Vite**
- **Tailwind CSS** for styling
- **React Router** for client-side navigation
- **Supabase** (PostgreSQL with an auto-generated REST API and file storage) as the backend
- **Lucide** for iconography
- Hosted on **Vercel**

## Disclaimer

This is an unofficial, fan-made project and is not affiliated with, endorsed by, or sponsored by Studio Drydock. All game content, names, and imagery rights belong to their respective owners.