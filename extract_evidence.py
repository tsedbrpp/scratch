"""Extract all ghost node evidence from study export for manuscript use."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('FULL_STUDY_EXPORT_1771511337410.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

# Collect all custom cases with their evidence
all_cases = {}
for rec in d['records']:
    for case in rec.get('customCases', []):
        cid = case.get('id', '')
        if cid not in all_cases:
            all_cases[cid] = case

# Collect evaluator ratings
ratings = {}
for rec in d['records']:
    evaluator = rec.get('evaluatorCode', '?')
    for case_key, resp in rec.get('responses', {}).items():
        if case_key not in ratings:
            ratings[case_key] = []
        ratings[case_key].append({
            'evaluator': evaluator,
            'strength': resp.get('strength'),
            'confidence': resp.get('confidence'),
            'missingRoles': resp.get('missingRoles', []),
            'isUncertain': resp.get('isUncertain'),
        })

print("=" * 80)
print("GHOST NODE EVIDENCE INVENTORY")
print("=" * 80)

for cid, case in sorted(all_cases.items()):
    print(f"\n{'-' * 80}")
    print(f"CASE ID: {cid}")
    print(f"TITLE:   {case.get('title', '?')}")
    print(f"NODE:    {case.get('nodeId', '?')}")
    print(f"SOURCE:  {case.get('sourceId', '?')}")
    
    # Evidence from pane1
    pane1 = case.get('pane1', {})
    evidence = pane1.get('evidencePoints', [])
    print(f"\n  EVIDENCE POINTS ({len(evidence)}):")
    for i, ep in enumerate(evidence):
        print(f"    [{i+1}] {ep[:500]}")
    
    connections = pane1.get('connections', [])
    if connections:
        print(f"\n  CONNECTIONS ({len(connections)}):")
        for c in connections:
            print(f"    → {json.dumps(c)[:300]}")
    
    # Other pane1 fields
    for k, v in pane1.items():
        if k not in ('evidencePoints', 'connections') and v:
            val_str = json.dumps(v) if not isinstance(v, str) else v
            print(f"    {k}: {val_str[:300]}")
    
    # Pane2 if exists
    pane2 = case.get('pane2', {})
    if pane2:
        print(f"\n  PANE2 FIELDS:")
        for k, v in pane2.items():
            if v:
                val_str = json.dumps(v) if not isinstance(v, str) else v
                print(f"    {k}: {val_str[:400]}")
    
    # Evaluator ratings
    if cid in ratings:
        print(f"\n  EVALUATOR RATINGS:")
        for r in ratings[cid]:
            mr = ', '.join(r['missingRoles']) if r['missingRoles'] else 'none'
            print(f"    {r['evaluator']}: strength={r['strength']}, "
                  f"confidence={r['confidence']}, missingRoles=[{mr}]")
    
    # Average strength
    if cid in ratings:
        strengths = [r['strength'] for r in ratings[cid] if r['strength'] is not None]
        if strengths:
            print(f"    → MEAN STRENGTH: {sum(strengths)/len(strengths):.1f} (n={len(strengths)})")

print(f"\n{'=' * 80}")
print(f"TOTAL UNIQUE CASES: {len(all_cases)}")
print(f"TOTAL EVALUATOR RESPONSES: {sum(len(v) for v in ratings.values())}")
