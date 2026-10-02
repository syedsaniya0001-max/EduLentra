# VERITAS-X

**Adversarial Multi-Agent AI Verification Engine**

> AI that doesn't just answer. It proves, challenges, corrects — or refuses.

## HackFusion 2026 — Theme 8
This prototype is designed around generation/verification separation, evidence grounding, contradiction detection, adversarial testing, self-correction, and auditable decisions.

## Current prototype
- Interactive judge-facing dashboard
- Task input and adversarial demo cases
- Claim-level proof graph UI
- Verification verdicts: ACCEPT / CORRECT / REJECT / INSUFFICIENT EVIDENCE
- Prompt-injection isolation demo
- Audit trail
- Responsive UI

The current front-end runs in **demo mode** so the UI can be tested without API keys. The next implementation step is to connect the verification pipeline to the selected model provider and real retrieval/execution tools.

## Run
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Production architecture
Planner → Researcher → Reasoner → Claim Extractor → Independent Verifiers → Adversarial Critic → Decision Gate → Correction/Re-verification → Finalizer/Audit.

Treat all retrieved documents and tool outputs as untrusted data. Never allow external content to modify system/developer verification policy. Use least-privilege tools and sandboxed execution for code/API checks.
