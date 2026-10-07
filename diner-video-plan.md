# Diner footage: turning the stills into video (needs your approval)

Each clip starts from a still you've already seen, so the people, table, and lighting stay exactly as they are now. Each one is a single unbroken shot with a fixed camera. Everyone stays framed below the nose throughout, and there's no text or sound.

**Model:** Veo 3.1 image-to-video (the most photoreal option available), 1080p, 4 seconds per clip, no audio. Estimated cost: about $0.80 per clip, so about $2.40 for all three.

**Look (same for every clip):** Candid fine-dining footage at night: a 50mm lens on a tripod, shallow depth of field, warm candlelight. Deep blacks, soft highlights, an amber palette, and fine film grain.

| # | Where it goes | Starting still | What happens on screen |
|---|---|---|---|
| A | Hero film (replaces the toast still) | `blm-food-v4/diners-toast-v1.png` | The two red-wine glasses meet in a gentle clink and the wine ripples. The glasses ease back, both guests smile, and the woman laughs. |
| B | Hero film (replaces the steak still) | `blm-food-v4/diners-savor-v1.png` | He raises the forkful of steak toward his mouth at the top edge of the frame. The woman beside him laughs, and he smiles while chewing. |
| C | Gallery middle panel (replaces the laughing-guests photo, loops silently) | `blm-food-v4/laugh-9x16-start.png` | The three guests keep laughing together. The woman in green touches her collarbone, the guest on the right lifts her white wine slightly, and the candle flickers. |

## Prompts (sent exactly as written)

**A: Toast**
> Candid fine-dining editorial footage at night, 50mm lens on a locked-off tripod, shallow depth of field. The woman on the left and the man on the right bring their red wine glasses together at the centre of frame in one gentle clink; the wine ripples from the touch. The glasses ease back a few centimetres, both of them break into relaxed smiles, and the woman laughs, her shoulders lifting slightly. Background diners and candles stay softly out of focus. The framing stays cropped below the nose for the entire clip — eyes never enter the frame; camera does not tilt or pan, only an almost imperceptible push-in. Warm tungsten candlelight, deep blacks, soft highlight roll-off, low-contrast amber palette, fine film grain. No text, no new people entering, no cuts.

**B: Savouring the steak**
> Candid fine-dining editorial footage at night, 50mm lens on a locked-off tripod, shallow depth of field. The man in the navy jacket lifts the bite of steak on his fork slowly upward toward his mouth at the top edge of frame and takes the bite; he lowers the empty fork and smiles while chewing. The woman beside him on the left laughs warmly, her hand resting near her collarbone. Steam and candle flicker are subtle; the wine glass and plate stay still on the table. The framing stays cropped below the nose for the entire clip — eyes never enter the frame; camera does not tilt or pan. Warm tungsten candlelight, deep blacks, soft highlight roll-off, low-contrast amber palette, fine film grain. No text, no new people entering, no cuts.

**C: Guests laughing (gallery loop)**
> Candid fine-dining editorial footage at night, 50mm lens on a locked-off tripod, shallow depth of field. Three guests at a candlelit table keep laughing together at a shared story: the woman in the green velvet dress laughs with her head tipping back slightly and her fingertips at her collarbone, the guest on the right lifts her white wine glass a little and laughs, the man on the left chuckles with his hand on the table. The brass table lamp's candle flickers gently; plates and glasses stay in place. The framing stays cropped below the nose for the entire clip — eyes never enter the frame; camera does not move. Warm tungsten candlelight, deep blacks, soft highlight roll-off, low-contrast amber palette, fine film grain. No text, no new people entering, no cuts.

## After generation
- Each clip gets the same color grade as the rest of the film and is trimmed to about 3.6 seconds. A and B go into the 15-second hero film in place of the stills, keeping the existing crossfades. C becomes a silent looping video in the gallery panel, with its still kept as the backup image.
- I'll review every clip before installing it, checking that faces stay below the nose, hands look natural, and nothing warps or duplicates. Any clip that fails gets regenerated with a fix for that specific problem.

## Outcome
- A (toast): Veo take showed faces → re-rolled on Kling 3.0 Pro; used with a slight top crop.
- B (steak bite): Veo take used, top-cropped to keep it below the nose.
- C (laugh): Veo and Kling takes both reveal her eyes after ~2.6 s; the safe opening is used as a 5 s boomerang loop in the gallery.
- Spend ≈ $4.64 vs $2.40 quoted (extra Kling re-rolls).

## Update (film v8)
- The AI laugh loop was replaced by real Pexels footage (8922360), cropped to mouths only, per the owner's request.
- A walk-away shot was added after the pour (Kling 3.0 Pro, $0.56). AI video spend is now about $5.20 in total.
