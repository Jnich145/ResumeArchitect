# Opportunity to test: a private draft workspace for resume coaching

**Hypothesis:** independent resume coaches and career programs may benefit from a simple editor that lets a participant retain control of their draft while sharing an explicit file for review. The local workspace is a way to test that workflow without introducing accounts, AI processing, billing, or a shared personal-data store.

The current user journey is concrete: a participant edits a resume, exports JSON, transfers the file through a channel they choose, receives an edited copy, and reviews it before saving. ResumeArchitect itself does not provide transfer, coach comments, version history, collaborative editing, or identity verification.

Before building more, test the following with synthetic profiles and consenting reviewers:

1. Can a first-time participant edit and print a useful draft without assistance?
2. Can a coach return an edited file that the participant can import without losing work?
3. Do both understand where the draft is stored and what clear/export actually do?
4. Is file exchange acceptable, or is change comparison the more valuable next feature?

Record completion time, points of confusion, unsuccessful imports, and whether the workflow earns a repeat use. These observations would inform the next slice. They are not evidence of customer demand, willingness to pay, placement results, or ATS performance. Any future hosted or AI feature needs its own explicit data boundary and validated operating model.
