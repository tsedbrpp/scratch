"""Explore study export data for empirical grounding."""
import json

with open('FULL_STUDY_EXPORT_1771511337410.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

print(f"Total records: {d['totalRecords']}")
print()

for i, rec in enumerate(d['records']):
    print(f"=== RECORD {i} ===")
    print(f"  Evaluator: {rec.get('evaluatorCode','?')}")
    print(f"  Complete: {rec.get('isComplete')}")
    print(f"  Playlist: {rec.get('playlist',[])}")
    
    resp = rec.get('responses', {})
    print(f"  Responses: {len(resp)}")
    for k, v in resp.items():
        print(f"    Case: {k}")
        print(f"      Strength: {v.get('strength')}")
        print(f"      Confidence: {v.get('confidence')}")
        print(f"      Missing Roles: {v.get('missingRoles', [])}")
        print(f"      Is Uncertain: {v.get('isUncertain')}")
        refl = str(v.get('reflexivity', ''))
        print(f"      Reflexivity ({len(refl)} chars): {refl[:300]}...")
    
    cc = rec.get('customCases', [])
    print(f"  Custom Cases: {len(cc)}")
    for j, case in enumerate(cc[:2]):
        print(f"    Custom {j}: {json.dumps(case, indent=2)[:500]}")
    print()
