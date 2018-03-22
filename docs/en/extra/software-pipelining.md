---
showToc: false
---

Técnica de reorganización de bucles, de tal manera que en cada iteración se construye con operaciones elegidas de distintas iteraciones del bucle original.

### Original loop

{%ace lang='asm'%}
LOOP:
	LF 		F1 (R2)
	ADDF	F2 F1 F0
	SF		F2 (R2)
	DADDUI 	R2 R2 #1
	BNE		R2 R5 LOOP
{%endace%}

### New loop (start-up and finish code ommited)

{%ace lang='asm'%}
LOOP:
	// SF belongs to 2 previous iterations
	SF 		F2 (R2)
	// ADDF belongs to 1 previous iteration
	ADDF	F2 F1 F0
	// LF belongs to this iteration
	LF 		F1 2(R2)
	DADDUI 	R2 R2 #1
	BNE		R2 R5 LOOP
{%endace%}