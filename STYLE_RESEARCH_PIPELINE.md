# Style Research Pipeline

## 1. Research goal

FitMuse should build its stylist brain from expert styling knowledge, not random outfit picking.

The goal is to collect styling knowledge from:

- fashion experts
- personal stylists
- creators
- image consultants
- body and fit educators
- region-aware and culture-aware fashion sources

Then FitMuse should convert that knowledge into original app rules that improve:

- recommendation quality
- match reasoning
- quiz inputs
- product selection
- region-aware styling logic
- culture-aware and modesty-aware styling logic

## 2. Important principle

FitMuse should not copy anyone’s content directly.

FitMuse should extract general styling principles, patterns, and decision rules, then convert those into original recommendation logic. The product should learn from expert knowledge without duplicating wording, exact outfits, or proprietary content.

## 3. Expert categories to research

- Menswear minimal / smart casual
- Old money / quiet luxury
- Feminine minimalist / clean style
- Modest fashion
- Indian ethnic / Indo-western
- Southeast Asian / tropical styling
- European smart casual / winter layering
- USA casual / creator / streetwear
- Body shape and proportions
- Color analysis
- Budget fashion
- Creator/photoshoot styling

## 4. Initial source map

### Menswear

- Tim Dessaint
- Daniel Simmons
- The Modest Man / Brock McGoff
- Gentleman’s Gazette
- Parker York Smith

### Old money / quiet luxury

- Lydia Tomlinson
- Alyssa Beltempo
- Gentleman’s Gazette

### Feminine minimalist

- Dearly Bethany
- Alyssa Beltempo
- Lydia Tomlinson

### Modest fashion

- Aishcream
- The Modest Fashionista
- other modest fashion creators from Indonesia, India, Middle East, and Europe

### Body/color/proportion

- color analysis stylists
- image consultants
- body-shape stylists
- menswear fit/proportion educators

### Region-aware

- Indian ethnic/fusion stylists
- Indonesian modest/tropical creators
- Romanian/European smart casual creators
- USA streetwear/smart casual creators

## 5. What to extract from each source

Use this template:

`Source name:`
`Source type:`
`Region/culture focus:`
`Gender/style focus:`
`Aesthetic:`
`Occasion:`
`Recommended items:`
`Recommended colors:`
`Recommended fits:`
`Recommended materials:`
`Shoes:`
`Accessories:`
`Avoid:`
`Budget alternatives:`
`Body/proportion notes:`
`Climate/region notes:`
`Modesty/culture notes:`
`Why it works:`
`FitMuse rule:`
`Confidence level:`
`Notes to verify:`

## 6. Rule conversion format

Use this format when turning research into app logic:

`IF user selects:`

- `aesthetic:`
- `occasion:`
- `style preference:`
- `budget:`
- `body/proportion:`
- `region/climate:`
- `modesty preference:`

`THEN prioritize:`

- `items:`
- `colors:`
- `fits:`
- `materials:`
- `shoes:`
- `accessories:`

`AVOID:`
`WHY:`
`SCORING IMPACT:`

## 7. Source quality checklist

- Is the advice practical?
- Is it repeatable?
- Is it not just trend-based?
- Does it explain why?
- Does it respect culture and preference?
- Is it usable for an app rule?
- Does it avoid stereotypes?
- Does it work on a budget?

## 8. Research priority order

1. Masculine old money/date/smart casual
2. Feminine clean/minimal/date
3. Office smart casual
4. Travel
5. Modest styling
6. Region-aware India/USA/Romania/Indonesia
7. Body shape and color rules
8. Creator/photoshoot styling

## 9. How this connects to app development

This research should later become:

- `STYLE_INTELLIGENCE_BASE.md`
- style rule data files
- scoring weights
- match reasons
- quiz improvements
- product selection criteria
- real product curation rules

The research layer should guide how FitMuse:

- ranks outfits
- explains recommendations
- handles budget alternatives
- adapts to region and climate
- respects user-stated modesty and clothing direction

## 10. Next action

The first research target is:

`Masculine Old Money Date Outfit System`
