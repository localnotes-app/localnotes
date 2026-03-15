# Screenshot Templates for localnotes

Use these markdown templates to create notes in the app, then take screenshots for the landing page.

---

## Template 1: "Editor View" Screenshot

Create a note titled **"Meeting Notes — Q1 Planning"** with these tags: `#work` `#planning`

Paste this content into the editor:

```
# Q1 Planning — Engineering Team

## Key Objectives

- [ ] Launch v2.0 of the dashboard by March 15
- [ ] Migrate auth system to OAuth 2.0
- [x] Complete API rate limiting implementation
- [x] Set up monitoring and alerting pipeline

## Budget Allocation

| Department | Q1 Budget | Status |
|------------|-----------|--------|
| Frontend   | $45,000   | Approved |
| Backend    | $62,000   | Approved |
| DevOps     | $28,000   | Pending  |

## Technical Notes

The new architecture uses a **microservices** pattern with `gRPC` for inter-service communication. Key formula for capacity:

$$C = \frac{R \times T}{1 - U}$$

Where $R$ is the request rate, $T$ is the processing time, and $U$ is the target utilization.

> "Make it work, make it right, make it fast." — Kent Beck

### Next Steps

1. Finalize the database schema
2. Set up CI/CD pipeline with GitHub Actions
3. Schedule security audit for week 3
```

---

## Template 2: "Preview & KaTeX" Screenshot

Create a note titled **"Calculus Notes — Integration"** with tags: `#math` `#university`

Paste this content:

```
# Integration Techniques

## The Fundamental Theorem

If $f$ is continuous on $[a, b]$ and $F$ is an antiderivative of $f$, then:

$$\int_a^b f(x)\,dx = F(b) - F(a)$$

## Common Integrals

$$\int x^n\,dx = \frac{x^{n+1}}{n+1} + C \quad (n \neq -1)$$

$$\int e^x\,dx = e^x + C$$

$$\int \sin(x)\,dx = -\cos(x) + C$$

## Integration by Parts

$$\int u\,dv = uv - \int v\,du$$

**Example:** Evaluate $\int x \cdot e^x\,dx$

Let $u = x$ and $dv = e^x\,dx$, then:

$$\int x \cdot e^x\,dx = x \cdot e^x - \int e^x\,dx = e^x(x - 1) + C$$

## Practice Problems

- [x] Compute $\int_0^1 x^2\,dx$
- [x] Evaluate $\int \frac{1}{x^2 + 1}\,dx$
- [ ] Solve $\int \sqrt{1 - x^2}\,dx$
- [ ] Find $\int \ln(x)\,dx$ using integration by parts

> Remember: Always check your answer by differentiating!
```

---

## How to Take the Screenshots

1. Open the app at `/app`
2. Create both notes with the content above
3. **Editor screenshot:** Select the "Meeting Notes" note, make sure both editor and preview panes are visible. Take a full-window screenshot.
4. **Preview screenshot:** Select the "Calculus Notes" note, focus on the preview pane to show KaTeX rendering. Take a full-window screenshot.
5. Save as:
   - `public/screenshots/editor.png`
   - `public/screenshots/preview.png`
6. Recommended: crop to ~1280×800 for a clean look
