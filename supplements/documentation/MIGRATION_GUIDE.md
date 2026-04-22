# Migration Guide: Theoretical Repositioning

## Overview

This guide explains the gradual migration from a conflated ANT/Assemblage system to a theoretically rigorous three-layer architecture.

---

## What Changed and Why

### Problem
The original system conflated Actor-Network Theory (ANT) and Assemblage Theory, treating them as a unified framework. This is theoretically incoherent:
- **ANT (Latour)**: A method for empirical tracing, explicitly anti-ontological
- **Assemblage Theory (DeLanda)**: A realist ontology with mechanisms and capacities

### Solution
Three-layer architecture:
1. **ANT Layer** (Methodological): Empirical tracing of actors and associations
2. **Assemblage Layer** (Ontological): Explanatory mechanisms and capacities
3. **STS Layer** (Reflexive): Provisional inscriptions and contestation

---

## New Type System

### ANT Types (`src/types/ant.ts`)

```typescript
import { TracedActor, Association, ANTTraceResult } from '@/types/ant';

// Example: Creating a traced actor
const tracedActor: TracedActor = {
  id: "actor-1",
  name: "GDPR",
  type: "LegalObject",
  trace_source: "document_extraction",
  trace_evidence: "Article 5, GDPR text line 47",
  provisional: false,
  confidence: 0.9
};
```

### Assemblage Types (`src/types/assemblage-realist.ts`)

```typescript
import { AssemblageMechanism, AssemblageCapacity } from '@/types/assemblage-realist';

// Example: Detecting a mechanism
const mechanism: AssemblageMechanism = {
  type: "territorialization",
  intensity: 0.8,
  evidence: [tracedActor], // Grounded in ANT traces
  explanation: "High boundary-making through legal definitions",
  confidence: 0.75
};
```

### Provisional Types (`src/types/provisional.ts`)

```typescript
import { ProvisionalInscription } from '@/types/provisional';

// Example: Wrapping AI output
const inscription: ProvisionalInscription = {
  content: "This assemblage shows high coding intensity...",
  source: "ai_generated",
  fragility_score: {
    value: 0.67,
    factors: {
      input_completeness: 0.7,
      model_uncertainty: 0.6,
      theoretical_tension: 0.5,
      empirical_grounding: 0.7
    },
    interpretation: "provisional"
  },
  authority_conditions: ["Empirical validation needed"],
  contestation_risks: ["Alternative interpretations possible"],
  created_at: "2026-01-08T10:00:00Z"
};
```

---

## Service Layer Usage

### ANTTraceService

```typescript
import { ANTTraceService } from '@/lib/ant-trace-service';

// Convert existing actors to traced actors
const tracedActors = ANTTraceService.hydrateWithProvenance(
  existingActors,
  "ai_inference"
);

// Generate trace result
const traceResult = ANTTraceService.generateTraceResult(
  tracedActors,
  associations,
  translationSequence
);
```

### AssemblageMechanismService

```typescript
import { AssemblageMechanismService } from '@/lib/assemblage-mechanism-service';

// Detect mechanisms (requires ANT traces as input)
const mechanisms = AssemblageMechanismService.detectTerritorialization(
  tracedActors,
  associations,
  configurations
);

// Identify capacities
const capacities = AssemblageMechanismService.identifyCapacities(
  tracedActors,
  associations
);

// Calculate hull metrics (both ANT and Assemblage perspectives)
const hullMetrics = AssemblageMechanismService.calculateHullMetrics(
  configuration,
  tracedActors,
  associations
);
```

### ProvisionalWrapper

```typescript
import { ProvisionalWrapper } from '@/lib/provisional-wrapper';

// Wrap AI output as provisional
const wrapped = ProvisionalWrapper.wrap(
  aiGeneratedText,
  "ai_generated",
  0.7 // input completeness
);

// Add alternative interpretation
const contested = ProvisionalWrapper.addAlternativeInterpretation(
  wrapped,
  "Alternative: This could be deterritorialization instead",
  "Deleuze & Guattari (1987)",
  0.6 // plausibility
);
```

---

## Backward Compatibility

### Existing Code Continues to Work

All existing code using `EcosystemActor` continues to work. The new `trace_metadata` field is optional:

```typescript
// Old code (still works)
const actor: EcosystemActor = {
  id: "1",
  name: "EU Commission",
  type: "Policymaker",
  description: "...",
  influence: "High"
};

// New code (with trace metadata)
const tracedActor: EcosystemActor = {
  ...actor,
  trace_metadata: {
    source: "document_extraction",
    evidence: "Mentioned in Article 5",
    provisional: false,
    confidence: 0.9
  }
};
```

### Legacy Assemblage Types

The original `src/types/assemblage.ts` remains unchanged. New code uses `src/types/assemblage-realist.ts`:

```typescript
// Legacy (still works)
import { AssemblageExtractionResult } from '@/types/assemblage';

// New (for theoretical rigor)
import { AssemblageAnalysisResult } from '@/types/assemblage-realist';
```

---

## Migration Checklist

### For Developers

- [ ] Read this migration guide
- [ ] Understand ANT (method) vs. Assemblage (ontology) distinction
- [ ] Use new types for new features
- [ ] Gradually migrate existing code (no rush)
- [ ] Add trace_metadata when creating new actors
- [ ] Wrap AI outputs with ProvisionalWrapper

### For API Consumers

- [ ] No immediate changes required
- [ ] New endpoints will be added (`/api/analyze/trace`, `/api/analyze/mechanisms`)
- [ ] Existing `/api/analyze` endpoint continues to work
- [ ] Watch for deprecation warnings (2-week notice before removal)

---

## Examples

### Example 1: Creating ANT Trace

```typescript
import { ANTTraceService } from '@/lib/ant-trace-service';

async function performANTTrace(document: string) {
  // Extract actors from document
  const actors = await extractActorsFromDocument(document);
  
  // Convert to traced actors
  const tracedActors = ANTTraceService.hydrateWithProvenance(
    actors,
    "document_extraction"
  );
  
  // Generate associations
  const associations = ANTTraceService.traceAssociations(
    tracedActors,
    links
  );
  
  // Return trace result
  return ANTTraceService.generateTraceResult(
    tracedActors,
    associations
  );
}
```

### Example 2: Detecting Assemblage Mechanisms

```typescript
import { AssemblageMechanismService } from '@/lib/assemblage-mechanism-service';

async function analyzeAssemblage(traceResult: ANTTraceResult) {
  // Detect territorialization
  const mechanisms = AssemblageMechanismService.detectTerritorialization(
    traceResult.traced_actors,
    traceResult.associations,
    configurations
  );
  
  // Identify capacities
  const capacities = AssemblageMechanismService.identifyCapacities(
    traceResult.traced_actors,
    traceResult.associations
  );
  
  return {
    mode: "assemblage_realist",
    detected_mechanisms: mechanisms,
    identified_capacities: capacities,
    based_on_trace: {
      actor_count: traceResult.traced_actors.length,
      association_count: traceResult.associations.length
    }
  };
}
```

### Example 3: Wrapping AI Output

```typescript
import { ProvisionalWrapper } from '@/lib/provisional-wrapper';

async function generateAIAnalysis(input: string) {
  // Call AI model
  const aiOutput = await callOpenAI(input);
  
  // Wrap as provisional inscription
  const provisional = ProvisionalWrapper.wrap(
    aiOutput,
    "ai_generated",
    calculateInputCompleteness(input)
  );
  
  // Return with fragility score
  return {
    content: provisional.content,
    fragility: provisional.fragility_score,
    authority_conditions: provisional.authority_conditions,
    contestation_risks: provisional.contestation_risks
  };
}
```

---

## Theoretical Positioning

### ANT as Method
- Use for: Tracing actors, mapping associations, tracking translations
- Avoid: Ontological claims about mechanisms or capacities
- Output: Empirical traces with provenance

### Assemblage as Ontology
- Use for: Explaining mechanisms, identifying capacities, predicting reconfigurations
- Requires: ANT traces as empirical foundation
- Output: Explanatory narratives grounded in evidence

### Provisional Inscriptions
- All AI outputs are provisional, not authoritative
- Fragility scores make uncertainty visible
- Authority conditions specify when inscriptions gain traction
- Contestation risks acknowledge alternative interpretations

---

## FAQ

**Q: Do I need to update all existing code immediately?**
A: No. The migration is gradual. Existing code continues to work.

**Q: What's the difference between `assemblage.ts` and `assemblage-realist.ts`?**
A: `assemblage.ts` is legacy (kept for backward compatibility). `assemblage-realist.ts` is the new DeLandian ontology layer.

**Q: Why separate ANT and Assemblage?**
A: Theoretical rigor. ANT is a method (tracing), Assemblage is an ontology (explaining). Conflating them is theoretically incoherent.

**Q: What are provisional inscriptions?**
A: AI outputs with acknowledged fragility. They're not "spokespersons" (Latour) but contested, reversible interpretations.

**Q: How do fragility scores work?**
A: Four factors: input completeness, model uncertainty, theoretical tension, empirical grounding. Higher score = more fragile.

---

## Next Steps

- **Week 2**: New API endpoints (`/api/analyze/trace`, `/api/analyze/mechanisms`)
- **Week 3**: UI components (ModeSelector, ProvisionalBadge, FragilityIndicator)
- **Week 4**: Prompt updates and documentation

---

## Support

For questions or issues:
1. Check this migration guide
2. Review implementation plan (`migration-implementation-plan.md`)
3. Consult theoretical architecture docs
4. Ask in team chat

---

**Last Updated**: 2026-01-08
**Migration Status**: Complete. All phases (Weeks 1-4) finished. System is fully migrated to the 3-layer architecture.
