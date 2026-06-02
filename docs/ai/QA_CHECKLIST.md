# QA Checklist

Run these before implementation approval unless the task says otherwise:

```bash
npm run check:data-hygiene
npm run check:real-board-matching
npm run check:real-products
npm run check:recommendations
npm run check:style-rules
npm run lint
npm run typecheck
npm run build
git diff --check
```

## Visual QA

- Desktop: `1440x900`.
- Mobile: `390x844`.
- Check homepage, sample looks, quiz, and results.
- Check real-board modal when UI touches real boards.
- Confirm no overflow, text clipping, console errors, hydration errors, or `NaN`.
- Save screenshots for review.
- Do not commit screenshots unless approved.
