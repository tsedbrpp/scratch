"""Extract EU AI Act ghost node cases for manuscript walkthrough."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('FULL_STUDY_EXPORT_1771511337410.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

all_cases = {}
ratings = {}
for rec in d['records']:
    for case in rec.get('customCases', []):
        cid = case.get('id', '')
        if cid not in all_cases:
            all_cases[cid] = case
    for case_key, resp in rec.get('responses', {}).items():
        if case_key not in ratings:
            ratings[case_key] = []
        ratings[case_key].append({
            'evaluator': rec.get('evaluatorCode', '?'),
            'strength': resp.get('strength'),
            'confidence': resp.get('confidence'),
            'missingRoles': resp.get('missingRoles', []),
        })

# Group by source policy
sources = {}
for cid, case in all_cases.items():
    sid = case.get('sourceId', '?')
    if sid not in sources:
        sources[sid] = []
    sources[sid].append(case)

for sid, cases in sorted(sources.items()):
    first_title = cases[0].get('title', '?')
    jurisdiction = first_title.split(':')[0] if ':' in first_title else '?'
    print("=" * 70)
    print("JURISDICTION: " + jurisdiction)
    print("SOURCE ID: " + sid)
    print("GHOST NODES: " + str(len(cases)))
    print("=" * 70)
    
    for case in cases:
        cid = case.get('id', '')
        title = case.get('title', '?')
        actor = title.split(': ')[1] if ': ' in title else title
        
        pane1 = case.get('pane1', {})
        pane2 = case.get('pane2', {})
        evidence = pane1.get('evidencePoints', [])
        
        print()
        print("  GHOST NODE: " + actor)
        print("  HYPOTHESIS: " + str(pane2.get('hypothesis', '?')))
        print("  REASONING: " + str(pane2.get('reasoning', '?')))
        print()
        
        for i, ep in enumerate(evidence):
            print("    EVIDENCE [" + str(i+1) + "]: " + ep)
        
        if cid in ratings:
            strengths = [r['strength'] for r in ratings[cid] if r['strength'] is not None]
            roles = []
            for r in ratings[cid]:
                roles.extend(r.get('missingRoles', []))
            avg = sum(strengths) / len(strengths) if strengths else 0
            print()
            print("    MEAN STRENGTH: " + str(round(avg, 1)) + " (n=" + str(len(strengths)) + ")")
            if roles:
                print("    MISSING ROLES: " + ", ".join(set(roles)))
        print()
