# Tracing Structural Absence in Algorithmic Governance: Policy Prism as an Interpretive Artifact

## Abstract

Top-down governance of algorithmic systems usually takes the form of legislative rules that define risk, determine responsibility, and measure compliance. This approach, however, does not provide a clear understanding of how organizations actually sustain stable governance across complex algorithmic ecosystems. Beyond seeing governance merely as a static legislative framework, this paper conceptualizes governance as an "algorithmic assemblage" wherein legal documents, standard-setting bodies, technical infrastructures, firms, and affected populations continuously translate one another.

The primary contribution of this paper is methodological: it introduces Policy Prism, an open-source, LLM-assisted interpretive artifact designed to empirically trace how governance assemblages render different actors visible, actionable, or structurally silent. Applied across five global AI-governance frameworks, the artifact surfaces a recurring analytical pattern—the Ghost Node—wherein actors whose systematically reproduced structural exclusion appears to function as a stabilizing force for the assemblage. To organize these observations across jurisdictions, the paper proposes Translational Stratification Theory (TST) as a provisional sensitizing framework for tracing how portable governance vocabularies travel, embed within infrastructures, and produce stratified legibility. Ultimately, this study demonstrates how interpretive artifacts can make structural absences empirically traceable, offering organizational scholars new propositions for understanding how compliance infrastructures reorganize who becomes legible, who bears interpretive labor, and where accountability flows.

## 1. Introduction

Regulatory design for artificial intelligence is typically framed around developing rules and defining risks. AI governance policies must address who is liable and how compliance will be assessed. As AI systems integrate into broader social and organizational fields, regulatory frameworks evolve through continuous interactions among governmental agencies, standards bodies, technology providers, businesses, and impacted groups. However, to understand how these systems actually operate, the governance of AI must be conceptualized not merely as static law, but as an algorithmic assemblage (Callon et al., 2009). In this view, authority, accountability, and meaning are stabilized through ongoing sociomaterial interactions among heterogeneous actors.

This perspective has direct implications for how we understand information systems and organizational life. When compliance architectures determine which actors are rendered legible to governance processes and which are not, they reorganize the sociomaterial infrastructure of organizational sensemaking (Orlikowski & Scott, 2008). They determine where interpretive labor settles, how accountability flows are routed, and which forms of knowledge count as evidence. These are fundamentally questions about the politics of visibility in information systems (Introna & Nissenbaum, 2000)—questions that this paper addresses by tracing how policy texts organize regimes of differential visibility.

To unpack these dynamics, we draw upon both Actor-Network Theory (Latour, 2005; Callon, 1986) and Assemblage Theory (Deleuze & Guattari, 1987; DeLanda, 2016). While these theories share a relational ontology, this paper purposefully bridges them by assigning distinct analytical labor to each. ANT provides the micro-mechanisms of governance: the vocabulary of translation and inscription to trace how specific policy documents, audits, and populations negotiate power through localized routines. Assemblage Theory provides the macro-dynamics of institutional power: the vocabulary of territorialization and deterritorialization to explain how localized translations aggregate to stabilize massive, transnational structures. However, while both theories excel at describing relational connections, they are less explicit about the systematic exclusions that occur as governance evolves.

Driven by the need to critically interrogate these evolving structures, our overarching research question is: *How do algorithmic governance assemblages textually organize and embed regimes of stratified legibility and structural absence?*

To answer this, the primary contribution of this paper is methodological: we develop and introduce Policy Prism, an LLM-assisted interpretive artifact designed to trace relational dynamics and structural exclusions within policy texts. Through the application of this artifact across five global AI governance configurations (the EU AI Act, Colorado SB 24-205, India's AI Governance Framework, Brazil's PL 2338/2023, and the U.S. Federal assemblage), we surface the Ghost Node as an analytical construct and propose Translational Stratification Theory (TST) as a provisional sensitizing framework for organizing these observations comparatively. We trace how apex technocratic nodes concentrate interpretive authority while rendering some affected populations only weakly or selectively legible within governance architectures. Finally, we conclude by offering interpretive propositions for future organizational fieldwork, outlining how these macro-level textual architectures shape the meso-level buffering and decoupling labor of corporate compliance. This paper speaks to the themes animating the *Information & Organization* special issue on "Algorithmic Assemblages—Fields, Ecosystems, and Platforms," which invites interpretive work that treats algorithmic systems as relational, emergent sociomaterial formations.

The paper proceeds as follows. Section 2 establishes the theoretical foundations: the problem of structural absence, the Ghost Node construct, and TST as a sensitizing framework. Section 3 presents the methodology: Policy Prism as an interpretive artifact, its technical architecture, epistemic reflexivity, trustworthiness criteria, and case selection. Section 4 reports the empirical traces across five jurisdictions, including deep interpretive analyses and cross-policy themes. Section 5 discusses the organizational implications, offering interpretive propositions for future fieldwork. Section 6 concludes with limitations and future directions.

## 2. AI Governance and the Problem of Absence

AI governance architectures frequently recognize the harm caused by technology, but rarely provide those harmed with procedural organizational standing to participate in compliance processes. This is not merely a lack of oversight; it creates durable organizational outcomes through structural foreclosure. In Law's (2009) terms, some actors are "absent presences"—entities that shape the network precisely through their exclusion from it. Floridi's (2013, 2023) theory of distributed moral responsibility illustrates how complex systems may render some actors structurally invisible, protecting the core technical system from accountability. Within information systems scholarship, this resonates with Star's (1991) foundational work on the invisible labor of infrastructure maintenance and Suchman's (2007) analysis of how categories of visibility are organized through sociotechnical practice. Shaikh et al. (2023) have recently extended this concern to algorithmic accountability, demonstrating how relational spaces of accountability are constructed through the interactions of multiple organizational actors—a framing that our Ghost Node construct complements by identifying the actors who are *architecturally excluded* from these relational spaces.

### 2.1 Ghost Nodes

A Ghost Node is a structural omission that contributes to the stability of an assemblage. While it is possible to think about Ghost Nodes in terms of "strategic silences" or "institutional voids," we conceptualize them as systematically reproduced structural exclusions. The Ghost Node differs from Law's (2009) "absent presences" in a crucial respect: where Law identifies absence as a general feature of relational ontology—all networks necessarily exclude—the Ghost Node construct specifies the *conditions* under which a particular absence serves a stabilizing function. Not every excluded actor is a Ghost Node; only those whose exclusion meets the three criteria below qualify, ensuring analytical precision rather than ontological generality. We do not characterize the lack of inclusion of particular actors as simply institutional oversight; rather, their foreclosure is a recurring stabilizing pattern that is institutionally compatible with the dominant logics of the assemblage (e.g., market harmonization or technocratic control). This institutional compatibility may allow these dominant logics to operate while reducing the friction that procedural inclusion could introduce.

For an absent actor to be identified as a Ghost Node, three conditions must be observed:

1. **Functional Relevance**: There must be a plausible governance function that could involve the actor, given the regulatory objectives stated in the text.
2. **Textual Invocation**: The text invokes the actor rhetorically as having an interest but does not grant them procedural standing as a participant.
3. **Structural Foreclosure**: The operative rules defining the governance structure do not provide avenues of participation, complaint, or enforcement for the actor.

**Table 1. Ghost Node Distinguished from Adjacent Concepts**

| Concept | Definition | Focus | Example |
|---|---|---|---|
| Strategic Silence | Intentional omission to manage meaning (Morrison & Milliken, 2000) | Discursive | A regulator omitting enforcement thresholds from public guidance. |
| Institutional Void | Absence of market-supporting institutions (Khanna & Palepu, 1997) | Structural-functional | A jurisdiction lacking a data protection authority. |
| Ghost Node | A systematically reproduced structural exclusion that stabilizes an assemblage | Ontological-relational | Worker unions are absent from the operative mechanisms of the EU AI Act; their structural foreclosure is consistent with a market-harmonization logic that limits localized political friction. |

The Ghost Node thus complements rather than supplants adjacent constructs. Strategic silences (Morrison & Milliken, 2000) operate at the discursive level and may be temporary or reversible; Ghost Nodes are structurally embedded and reproduced through operative provisions. Shaikh et al.'s (2023) relational accountability spaces trace how accountability is *constructed* among connected actors; the Ghost Node construct identifies actors who are *architecturally excluded* from these relational spaces altogether. The Ghost Node's specificity lies in its governance-assemblage orientation: it requires all three criteria (functional relevance, textual invocation, structural foreclosure) to be simultaneously satisfied, distinguishing it from broader sociological treatments of absence or marginalization.

### 2.2 TST: A Provisional Sensitizing Framework

In this paper, we introduce Translational Stratification Theory (TST) not as a settled middle-range theory, but as a provisional sensitizing framework (Blumer, 1954). TST provides a vocabulary to link the micro-mechanisms of ANT to the macro-dynamics of Assemblage Theory. Synthesizing international norm diffusion (Finnemore & Sikkink, 1998) and "vernacularization" (Merry, 2006), TST offers an interpretive vocabulary to trace how portable governance vocabularies are locally materialized:

- **Lens 1—Referential Drift**: The portability of a governance label reduces its likelihood of retaining the same referent as it moves across boundaries.
- **Lens 2—Infrastructural Embedding**: Once a label takes on a new referent, this definition is physically inscribed into compliance infrastructures (standards, audits).
- **Lens 3—Stratified Legibility**: Through these infrastructures, actors are rendered visible (compliant) or structurally foreclosed (Ghost Nodes). It is here that assemblage dynamics reveal themselves through sedimentation (absorbing challenges) or partial deterritorialization (reallocating standing).

These lenses are not hypotheses to be tested but sensitizing concepts that orient the researcher's attention toward specific empirical patterns. Their value lies in making certain dynamics observable and comparable across jurisdictions. Crucially, TST offers something that Ghost Node analysis alone does not: a processual vocabulary for tracing *how* structural exclusion is produced and reproduced across jurisdictions through the travel, embedding, and stratification of shared governance categories. Ghost Node analysis identifies *that* an absence exists and evaluates its structural significance; TST traces the *mechanism* by which portable categories like "risk" or "fairness" acquire divergent local referents, become inscribed into durable compliance infrastructures, and thereby generate the conditions under which specific actors are rendered structurally invisible. Without this processual vocabulary, cross-jurisdictional comparison risks remaining primarily descriptive.

An important boundary condition warrants acknowledgment: TST as presented here traces referential drift *across* jurisdictions at a single temporal cross-section. The framework's lenses should in principle also apply to *intra-jurisdictional* evolution—for instance, tracing how the EU AI Act's risk categories shift meaning as they are amended post-2026 or as delegated acts operationalize new provisions. Similarly, referential drift may operate in non-state governance contexts, such as platform self-governance architectures (e.g., Meta's Oversight Board) where portable vocabularies like "community standards" undergo analogous processes of embedding and stratification. We note these as productive extensions that reinforce TST's generalizability while remaining beyond the empirical scope of the present study.

## 3. Methodology and Interpretive Rigor

### 3.1 Policy Prism as Interpretive Artifact

Policy Prism provides a multi-layered framework for analyzing governance structures (see Figure 1, available in the online supplement). The analytical workflow proceeds through five nested layers (Table 2): the researcher uploads a policy text, the artifact generates structured actor–relation extractions (Layer 1), maps these into an assemblage ecosystem (Layer 2), runs the evidence-gated Ghost Node Detection Pipeline (Layer 3), compares results across jurisdictions (Layer 4), and synthesizes observations through the TST sensitizing lenses (Layer 5). At each layer, the artifact produces candidate interpretations that the researcher must accept, modify, or reject with a recorded rationale. The double-prism architecture ensures that textual features are empirically derived and then synthesized for reflection. Policy Prism surfaces structural absences as evidence-linked candidate interpretations for human analyst review; they are not automated findings. The point is to make interpretive disagreement visible and empirically grounded.

The five layers of analytical structure activated in this study (Table 2) build upon one another, moving from Relationship Extraction up to Translational Stratification.

**Table 2. Document Analysis: Five Analytic Layers Activated in This Study**

| Layer | Lens | Description |
|---|---|---|
| 1 | Relationship Extraction & ANT Tracing | Actor-to-actor associations using governance verbs; classifies intermediaries and mediators; identifies obligatory passage points and translation chains. |
| 2 | Ecosystem & Assemblage Mapping | Assigns edge types (power, logic, ghost) and classifies impacts as constraints or affordances; evaluates how rules, enforcement, narratives, and resources generate emergent assemblage properties. |
| 3 | Ghost Node Detection | Identifies structurally absent actors through a four-pass evidence-gated pipeline; operationalizes stratified legibility. |
| 4 | Comparative Synthesis | Cross-policy analysis identifying convergent logics, tensions, and divergent patterns across jurisdictions. |
| 5 | Translational Stratification | Dual-track meta-synthesis mapping portable vocabularies through referential drift, infrastructural embedding, and stratified legibility. |

> *Note*: The system implements additional analytical layers (ontological concept mapping, abstract machine extraction, controversy mapping) available in the online supplements.

**Table 3. Translational Stratification Theory (TST): Sensitizing Lenses**

| Sensitizing Lens | Core Concept | What to Trace in the Text |
|---|---|---|
| Lens 1 | Referential Drift | How portable codes carry consistent rhetorical labels but acquire divergent referents shaped by local logics. |
| Lens 2 | Infrastructural Embedding | How translated codes become durable once inscribed into operational infrastructures (audits, registries), closing off alternative interpretations. |
| Lens 3 | Stratified Legibility | How embedded infrastructures produce unequal regimes of visibility: rendering compliant actors legible while reducing excluded actors to Ghost Nodes. |

While close reading provides scholars with iterative access to rhetorical nuance, Policy Prism serves as an analytical accelerant. The most effective approach is hybrid: researchers perform close readings, activate the tool to produce candidate interpretations and provenance chains, and then critically validate, dispute, or override the propositions into analyst-confirmed interpretations.

### 3.2 Technical Implementation

Policy Prism was developed through an echeloned approach to e-Design Science Research (Tuunanen et al., 2024). It is a Next.js web application utilizing a multi-LLM architecture (GPT-4o for assemblage extraction and structured analysis; GPT-4o-mini for structural parsing). The artifact is publicly deployed at https://policyprism.io and the full source code is available at https://github.com/tsedbrpp/scratch. Outputs are subject to three strict design criteria: **traceability** (every classification links to verbatim text); **contestability** (analyst overrides are preserved); and **productive friction** (ambiguity is surfaced, not algorithmically resolved). Full technical architecture, prompt templates, and output schemas are available in the online supplements.

#### 3.2.1 What Policy Prism Uniquely Reveals

A critical question for any artifact-based contribution is: what does the tool surface that close reading alone would miss? We identify three artifact-specific analytical yields:

First, **evidence-gated false positive prevention**. During early calibration, close readers consistently identified "small and medium enterprises (SMEs)" as a Ghost Node in the EU AI Act. Policy Prism's four-pass pipeline invalidated this candidate: the second pass assigned an evidence grade of E2 (weak/speculative—non-mention only, without enumeration or boundary language), automatically setting the absence score to null. Subsequent close reading confirmed that SMEs are addressed through explicit provision (Article 62, SME support measures), demonstrating how the rhetoric of absence can mislead even experienced readers when procedural standing is difficult to trace manually across 400+ articles.

Second, **cross-jurisdictional structural comparison at scale**. A single researcher performing close reading can deeply trace one or two documents. Policy Prism's comparative synthesis layer identifies convergent structural patterns across five jurisdictions simultaneously, surfacing that the *same* actor category (workers) is excluded through *different* mechanisms in each regime—a pattern that only becomes visible when the five architectures are juxtaposed through a common analytical schema.

Third, **provenance-chain contestation**. Traditional qualitative coding tools allow researchers to apply codes, but do not generate falsifiable candidate interpretations that the researcher must then accept, modify, or reject with a recorded rationale. Policy Prism's analyst assessment interface enforces structured disagreement: every Ghost Node classification includes a reflexive note documenting the analyst's positionality and reasoning. This creates an auditable interpretive trail that conventional methods do not enforce as a matter of course, though they could in principle accommodate.

### 3.3 Epistemic Reflexivity: Policy Prism as an Algorithmic Assemblage

One of the most original methodological contributions of this paper is the explicit acknowledgment of a deliberate, recursive irony: we are utilizing an algorithmic assemblage (a multi-LLM architecture) to evaluate the structural inequalities of algorithmic governance. In keeping with interpretive traditions, we do not treat the large language models powering Policy Prism as neutral oracles; they are highly complex sociomaterial actors that possess their own capacities to translate and stratify (Ye et al., 2026; Bender et al., 2021). The idea that the instrument risks reproducing the very politics of legibility it seeks to analyze is central to the artifact's design.

By using LLMs to chart governance infrastructures, we actively confronted three distinct acts of translation inherent to the models:

1. **Hegemonic Training Corpora**: Trained primarily on Global North regulatory texts, models possess a latent bias toward Western market-based legal rationalities. When analyzing Global South contexts, the LLM actively struggles to "see" non-Western governance logics, risking the imposition of Western templates onto indigenous/developmental frameworks.
2. **Probabilistic Closure**: LLMs are predictive machines that abhor a vacuum. When encountering the "missingness" that constitutes a Ghost Node, the model's default instinct is to hallucinate a presence or infer a logical bridge to resolve the textual contradiction.
3. **Semantic Compression**: LLMs are prone to conflating rhetorical invocation (a preamble claiming "the worker is central") with procedural standing (a statute granting workers a seat on an oversight board), which undermines the discovery of structural foreclosure.

To counteract these risks, Policy Prism enforces rigorous evidence-only gating (candidates with evidence grades E1 or E2 are automatically invalidated from confirmed Ghost Node classification and flagged as provisional candidates only), missing-signal diagnostics, and absolute provenance tracking. Human review and structured contestation are not mere error-checking mechanisms; they are the core constituents of the instrument's epistemological trustworthiness (Paseri & Durante, 2025). The friction between the human researcher and the algorithmic apparatus is precisely where qualitative insight is developed. The deployed version of Policy Prism (https://policyprism.io) includes explicit bias disclaimers, verification requirements, and confidence-level indicators that operationalize these reflexive commitments in the researcher-facing interface.

A related limitation concerns **non-English and non-Western policy texts**. All five cases analyzed in this study were available in English (either as primary language or official translation). Policy Prism's LLM backbone has not been evaluated on texts in languages where governance terminology lacks direct English equivalents—a significant constraint for extending this work to, for example, China's AI governance framework or regional African Union protocols. The India trace partially surfaces this issue: the framework's developmental vocabulary ("AI for All," "Digital India") carries cultural and institutional connotations that the LLM may flatten into Western market categories. We flag this as an important boundary condition for future extension and a productive site for reflexive methodological inquiry.

### 3.4 Methodological Trustworthiness

To assess the rigor of the Policy Prism artifact, we eschewed positivist notions of objective validity or ground truth, evaluating it instead against qualitative standards of interpretivist dependability, trustworthiness, and reflexive discipline (Lincoln & Guba, 1985; Klein & Myers, 1999):

- **Auditability (Traceability)**: A transparent "provenance" chain directly references the exact verbatim quote from the textual data for every generated claim.
- **Interpretive Plausibility (Contestability)**: Acknowledging that findings are social constructs, the artifact promotes dialogical reasoning by explicitly affording analysts the opportunity to override results, logging all discrepancies within the final record to ensure confirmability.
- **Analytic Resonance**: System constraints, grounded in ANT and Assemblage Theory vocabularies, prevent theoretically ungrounded inferences.

To initially calibrate the Ghost Node Detection Pipeline, a hybrid-human evaluation was conducted with four interpretive scholars across ten test cases. Cases were selected to maximize variation across three dimensions: jurisdiction (EU, Brazil, U.S.), actor category (labor, civil society, affected communities), and expected outcome (three cases where prior scholarship strongly suggested structural exclusion, four where exclusion was ambiguous, and three where prior scholarship suggested inclusion). Each evaluator independently assessed whether the three Ghost Node criteria (Functional Relevance, Textual Invocation, Structural Foreclosure) were satisfied for each candidate, producing 40 independent assessments.

This exercise was not designed to prove "convergent validity" or establish ground truth. Rather, it served as a limited plausibility and calibration exercise to test whether the artifact's evidence-only gating could consistently identify potential structural exclusions that resonated with human scholarly critique. The evaluators achieved strong interpretive consensus: on the three clear-exclusion cases, all four evaluators independently confirmed the Ghost Node classification; on the three inclusion cases, all four rejected the classification; on the four ambiguous cases, evaluators split 3:1 or 2:2, with the disagreements preserved in the provenance chain as analytically productive. Moving forward, we plan three broader confirmability exercises: (1) an expanded interpretive evaluation with 8–10 scholars across a wider jurisdiction sample, including non-English source texts; (2) a comparative audit in which independent researchers apply Policy Prism to the same corpus and compare provenance chains; and (3) a longitudinal re-evaluation of the same five cases as regulatory texts are amended, testing whether Ghost Node classifications remain stable or shift with legislative revision.

### 3.5 Case Selection and Data Sources

This research applies the artifact to five governance configurations selected to maximize analytical variation along two dimensions: *institutional maturity* (from enacted statute to emergent assemblage) and *dominant governance logic* (market harmonization, consumer protection, developmental coordination, security-industrial).

The **EU AI Act** and **Colorado SB 24-205** represent fully enacted, legally binding regimes with developed compliance infrastructures, but organized around different logics (market harmonization vs. consumer protection). **India's AI Governance Framework** provides a contrast as a non-binding, ministerially coordinated guidance regime organized around developmental objectives. The **U.S. Federal Assemblage** is treated as an emergent assemblage precisely because it lacks a single statutory instrument: authority is distributed across executive orders, procurement standards, and legislative recommendations, which allows us to trace how governance stabilizes *without* a central legislative anchor. **Brazil's PL 2338/2023** serves as an exploratory vignette: a bill-in-progress that offers a window into governance formation before infrastructural embedding has fully occurred.

This variation in institutional maturity carries important implications for sedimentation potential—the degree to which governance categories have become infrastructurally durable. The EU AI Act's risk categories are already being inscribed into CEN/CENELEC harmonized standards, creating material compliance infrastructures that resist reinterpretation. By contrast, the U.S. emergent assemblage operates through executive instruments that are revocable by subsequent administrations, producing a governance architecture with lower sedimentation potential and greater susceptibility to deterritorialization. India's ministerial coordination occupies a middle position: while non-binding, the framework's integration with existing bureaucratic hierarchies lends it institutional inertia that pure executive action lacks. These differences in sedimentation potential also map onto a Global South/North distinction: whereas Northern regimes (EU, U.S.) tend to produce Ghost Nodes through procedural foreclosure within developed compliance infrastructures, India's developmental logic produces Ghost Nodes through categorical erasure—the governance framework's categories simply do not recognize the existence of actors who might contest developmental priorities.

This comparative architecture means that cross-case claims carry different evidentiary weight. Claims grounded in the EU and Colorado traces rest on enacted statutory language and are the most empirically secure. Claims involving India and the U.S. rest on guidance documents and executive instruments, which are less textually determinate. Claims involving Brazil are explicitly provisional, reflecting a governance architecture still under legislative negotiation. We calibrate our interpretive confidence accordingly throughout the empirical sections.

## 4. Empirical Traces and Results

### 4.1 Ghost Node Matrix

The artifact surfaced consistent patterns of structural absence. Civil Society and Workers emerged as confirmed Ghost Nodes across all studied jurisdictions with fully enacted or established governance architectures (Table 4). Furthermore, the form of absence varies by institutional logic. In regimes with highly developed compliance infrastructures (the EU and Colorado), affected actors are typically classified as Affected-but-Unempowered—their interests are acknowledged, but they lack procedural standing. In regimes focused on developmental coordination (India), absences take the form of Structural Exclusion.

**Table 4. Confirmed Ghost Node Classifications (Evidence Grade E3 or Above)**

| Jurisdiction | Ghost Node | Exclusion Type | Dominant Logic | Evidence Grade |
|---|---|---|---|---|
| EU AI Act | Workers / Worker Unions | Affected-but-Unempowered | Market Harmonization | E4 (Strong) |
| EU AI Act | Civil Society Organizations | Affected-but-Unempowered | Market Harmonization | E3 (Moderate) |
| Colorado SB 24-205 | Affected Consumers | Affected-but-Unempowered | Consumer Protection | E4 (Strong) |
| India AI Guidelines | Civil Society / Labor | Structural Exclusion | Developmental Coordination | E3 (Moderate) |
| India AI Guidelines | Indigenous / Scheduled Communities | Structural Exclusion | Developmental Coordination | E3 (Moderate) |
| U.S. Federal Assemblage | General Public / Civil Society | Affected-but-Unempowered | Security-Industrial | E3 (Moderate) |

Brazil's PL 2338/2023 surfaced one provisional candidate—Informal Economy Workers—that received an evidence grade of E2 (Provisional). Consistent with the evidence-gating protocol described in Section 3.3, this candidate was not confirmed as a Ghost Node but is retained as an analytically suggestive observation. Because the legislation is still under negotiation, the textual indicators of structural foreclosure are not yet sufficiently developed to satisfy the three-criteria threshold. Should the bill be enacted in its current form, re-evaluation would be warranted.

**Table 5. Illustrative Ghost Node Classification: Worker Unions, EU AI Act**

| Criterion | Evidence | Analyst-Confirmed Classification |
|---|---|---|
| Functional Relevance | Worker organizations could plausibly evaluate high-risk workplace AI impacts (Annex III, §4). | Satisfied – Governance function clearly exists |
| Textual Invocation | Recital 4 references workers as affected parties; Article 26 requires worker notification. | Satisfied – Invoked rhetorically; precluded as agents |
| Structural Foreclosure | Conformity assessment (Art. 43) requires no participation by workers. No notified body representation (Art. 33). | Satisfied – Operative participation avenues foreclosed |
| Ghost Node Category | Affected-but-Unempowered | Provenance: Maintained in Prism Audit Trail |

### 4.2 Deep Interpretive Tracing

To demonstrate how the mechanisms surfaced by Policy Prism unfold dynamically, we provide deep interpretive traces of four distinct governance configurations, moving beyond the comparative scaffolding of the matrices:

**The EU AI Act: Translating "Risk" into Market Frictionlessness.** Tracing the portable category of "worker protection" through the EU AI Act reveals a structural discontinuity between rhetorical invocation and procedural standing. Policy Prism traces how "high-risk" categorizations (e.g., employment algorithms in Annex III) rhetorically invoke workers as vulnerable subjects. Consider the following provenance chain surfaced by the artifact:

> *Rhetorical invocation*: Recital 4 states that AI systems "should... ensure a high level of protection of... workers' rights" (EU AI Act, Recital 4).
>
> *Procedural routing*: Article 43(1) specifies that conformity assessment for high-risk systems "shall be carried out by the provider" using internal procedures or, for biometric systems, through a notified body (Art. 43(1)).
>
> *Structural foreclosure*: The composition of notified bodies (Art. 33) requires "technical competence" and "impartiality" but contains no provision for worker representation, labor expertise, or affected-population participation in the assessment process.

Workers are structurally bypassed in this assessment loop. The compliance architecture thus absorbs "worker protection" rhetorically, but routes the actual governance through technocratic standard-setting bodies (CEN/CENELEC) where labor organizations hold no procedural standing. This routing pattern is consistent with a market-harmonization logic that prioritizes the speed and standardization of AI product deployment across the single digital market; whether it actively serves to *preserve* that logic or is merely compatible with it is a question our textual evidence can raise but not definitively resolve.

**Colorado SB 24-205: Rights-Protective Framing vs. Upward Accountability.** In tracing the Colorado statute, Policy Prism surfaced a distinct translation of "risk." Discursively, the statute employs a strong consumer-protection framing, rhetorically centering individuals subjected to AI-mediated consequential decisions. Yet, the infrastructural embedding routes all accountability upwards. The provenance chain reveals the structural mechanism:

> *Rhetorical invocation*: Section 6-1-1702(1) defines the statute's purpose as protecting "consumers" from "algorithmic discrimination" in "consequential decisions" affecting education, employment, healthcare, housing, insurance, and legal services.
>
> *Structural foreclosure*: Section 6-1-1703 specifies that "Nothing in this part 17 shall be construed to create a private right of action." Enforcement authority is vested exclusively in the Attorney General (§6-1-1706).

The Ghost Node (the affected consumer) is created not by being ignored, but by being transformed from a rights-bearing participant into a passive beneficiary reliant entirely on an upward-facing apex node to process their grievances. The consumer is textually invoked as the purpose of the statute but procedurally excluded from its operative enforcement mechanisms.

**India's AI Governance Framework: Developmental Coordination as Exclusionary Architecture.** Policy Prism's trace of India's AI Guidelines reveals a distinctive mode of structural exclusion that operates through developmental logic rather than market harmonization or consumer protection. The framework is architecturally organized around ministerial coordination: the Central AI Resource Organization (CARO) and the IndiaAI Mission function as apex nodes channeling AI policy through sector-specific line ministries.

The framework employs a universalist developmental framing ("AI for All") that addresses "citizens" and "stakeholders" only in aggregate. Policy Prism identified an absence of disaggregated procedural mechanisms through which communities differentially affected by algorithmic decisions could articulate claims within the governance architecture. No provisions establish differentiated impact assessment categories, participatory standing for affected groups, or complaint mechanisms accessible to those outside the ministerial coordination structure. This contrasts structurally with the EU pattern: whereas the EU creates Ghost Nodes by routing governance through technocratic standards bodies that exclude workers, India's framework creates Ghost Nodes by routing governance through ministerial hierarchies that treat all affected populations as undifferentiated beneficiaries of developmental progress. The interpretive implication—which we present as a proposition warranting further investigation with India-specific expertise—is that this universalist framing may function as a form of categorical exclusion, in which the framework's governance categories do not recognize the existence of differentiated harm, rather than the procedural exclusion observed in the EU and Colorado.

To illustrate the artifact's "productive friction" in practice, consider the following before/after vignette for the candidate Ghost Node "Indigenous / Scheduled Communities" in the India trace. A close reading of the framework identifies that Scheduled Castes, Scheduled Tribes, and Other Backward Classes are not mentioned in any governance provision. Policy Prism's four-pass pipeline processed this observation as follows:

> *Pass 1 (Extraction)*: Candidate identified: "Indigenous / Scheduled Communities." Functional relevance: agricultural AI, welfare distribution, and digital identity systems disproportionately affect these populations. Textual invocation: none found—no rhetorical mention in the framework's text.
>
> *Pass 2 (Scoring)*: Evidence grade assigned: E3 (Moderate). The absence of rhetorical invocation *combined with* high functional relevance triggered the missing-signal diagnostic, flagging this as a potential categorical Ghost Node rather than a simple omission.
>
> *Pass 3 (Deep Dive)*: Counterfactual test: if Scheduled Communities were granted participatory standing within CARO's ministerial coordination structure, they could introduce differentiated impact assessments into the governance pathway. The framework's universalist framing ("AI for All") structurally forecloses this by treating all populations as undifferentiated beneficiaries.
>
> *Pass 4 (Analyst Review)*: The human analyst confirmed the classification but added a reflexive note: "This is a categorical Ghost Node—the framework's categories do not recognize this population as a differentiated group. This differs from the EU/Colorado pattern where workers are invoked but excluded. Here, the population is neither invoked nor excluded; it is categorically invisible. This classification carries lower confidence than the EU worker case because the India framework is non-statutory and the absence may reflect the document's brevity rather than structural foreclosure."

This vignette demonstrates the artifact's core value proposition: the four-pass pipeline forced the analyst to distinguish between a *textual absence* (the population is not mentioned) and a *structural absence* (the governance architecture's categories cannot accommodate the population's claims). Close reading alone identified the omission; the artifact's structured pipeline required the analyst to specify the *mechanism* of exclusion and to calibrate confidence accordingly.

**The U.S. Federal Assemblage: Apex Authority without a Statutory Regulator.** Because the U.S. lacks a central statutory AI law, Policy Prism traces an emergent assemblage built through executive orders (EO 14110), procurement standards (OMB Memoranda M-24-10, M-24-18), and legislative recommendations (NIST AI RMF). While power appears highly distributed, the trace reveals a strictly apex-oriented authority structure. Authority is territorialized through federal procurement rules, executive coordination (OMB, CAIOC), and industry-led standard-setting (NIST). Policy Prism identifies the U.S. public as Affected-but-Unempowered: the public is the rhetorical beneficiary of executive language promising "safe, secure, and trustworthy AI," but the actual mechanisms of governance—procurement thresholds, risk assessment templates, and standards body composition—contain no provision for civil society participation in design, evaluation, or enforcement. The structural effect is consistent with a security-industrial logic in which governance is organized around national competitiveness and federal operational capacity rather than individual rights or community standing.

The U.S. case also illustrates how Policy Prism handles ambiguous invocations in non-statutory texts. Executive Order 14110 uses broad aspirational language ("safe, secure, and trustworthy AI") that lacks the specificity of statutory provisions. The artifact's evidence-gating pipeline addresses this by distinguishing between E3 candidates (supported by at least one operative provision that structurally forecloses participation) and E2 candidates (supported only by rhetorical language without operative anchoring). In the U.S. trace, civil society participation was graded E3 because the *operative* instruments (OMB procurement memoranda, NIST framework composition) contain no participatory provisions—not merely because the executive order's aspirational language is vague. This distinction between aspirational rhetoric and operative foreclosure is precisely the analytical leverage that the artifact provides in non-statutory governance architectures.

### 4.3 Cross-Policy Themes: Authority and Friction

Across all five jurisdictions, authority is concentrated in technocratic apex nodes (e.g., AI Office, AG, ANPD, OMB). These apex nodes operate as Obligatory Passage Points (OPPs) that rely on highly engineered, quantifiable metrics to process compliance at scale. Policy Prism's traces suggest that formally granting affected communities procedural standing to dispute certification or standards would introduce qualitative, context-specific forms of evidence into governance pathways currently designed to process standardized, quantifiable compliance information. The interpretive inference is that these technocratic OPPs appear better suited to standardized compliance inputs than to qualitative, context-specific claims advanced at scale, and that the structural exclusion of affected populations may function to maintain the throughput and consistency of existing compliance pathways.

**Worker Exclusion.** The exclusion of worker organizations across these regimes is neither an accidental nor random omission. Rather, it is a recurring pattern that is institutionally compatible with maintaining the dominant logic in each assemblage. By focusing rhetorical attention on workers while simultaneously excluding them from procedural standing regarding their own rights, each governance architecture limits a potential source of friction. In the counterfactual scenario where worker unions received legal standing to participate in conformity assessment (EU) or enforcement actions (Colorado), substantive questions about working conditions, deployment pace, and error tolerance would enter governance pathways currently insulated from such inputs. Whether this exclusion is a *necessary condition* for assemblage stability or merely a *compatible feature* cannot be determined from textual analysis alone; we present it as an interpretive proposition for future empirical investigation.

### 4.4 Applying the TST Sensitizing Lenses

Applying the three TST sensitizing lenses to the data reveals consistent patterns of stratified legibility:

**Lens 1 – Referential Drift**: "Risk" travels across jurisdictions but refers to entirely different objects: product safety in the internal market (EU), high-risk consumer decisional impacts (Colorado), developmental coordination priorities (India), and industrial security competition (U.S.). The portability of the label obscures the divergence of its referents, producing what appears to be convergent governance but is in fact structurally incomparable—a pattern that only becomes visible through simultaneous cross-jurisdictional analysis.

**Lens 2 – Infrastructural Embedding**: Once locally translated, risk categories are hardened through inscription into operative compliance infrastructures. The EU routes risk through CEN/CENELEC harmonized standards, Colorado through AG-monopolized enforcement, India through ministerial coordination, and the U.S. through procurement thresholds and NIST frameworks. In each case, the infrastructure closes off alternative interpretations of risk by materializing a single operative definition.

**Lens 3 – Stratified Legibility**: Ghost Nodes appear in all cases, but the *form* of invisibility varies with the dominant logic. In market-oriented regimes (EU), exclusion operates procedurally; in developmental regimes (India), exclusion operates categorically. While counter-translation capacity exists—Brazil's ANPD retains formal authority to recategorize risk definitions—it is largely absorbed through structural sedimentation in the more mature regimes.

To illustrate the processual value of TST, consider tracing the single category "worker protection" through the EU–India pair. In the EU (Lens 1), "worker protection" retains its European social-model referent—collective bargaining, works councils, occupational safety—producing a rhetorical label with dense institutional expectations. In India, the same label drifts to reference "skilling" and "capacity building" within a developmental coordination framework, shedding its collective-rights referent entirely. At the embedding stage (Lens 2), the EU inscribes its translated definition into CEN/CENELEC harmonized standards and conformity assessments administered by notified bodies (Art. 43); India inscribes its developmental definition into ministerial skill-training programs coordinated through CARO and sector line ministries. At the stratification stage (Lens 3), the EU produces a *procedural* Ghost Node: workers exist as a recognized category but lack standing in the operative compliance pathway. India produces a *categorical* Ghost Node: the framework's governance vocabulary does not recognize "workers" as a differentiated category with distinct claims, subsuming them within an undifferentiated "citizen" population. TST makes this divergence analytically tractable: what appears as the same exclusion (workers absent from governance) is revealed as two structurally distinct mechanisms, each stabilizing a different dominant logic.

Figures 3 and 5 (Accountability Architecture and Worker Exclusion Patterns) are reproduced in the main text below to ground the cross-policy themes discussed in Section 4.3. Figures 4, 6, and 7 (Authority Concentration, Governing Style Comparison, and Organizational Impact Propositions) are provided in the online supplement with persistent links at https://policyprism.io/supplements.

## 5. Discussion

To understand algorithmic assemblages through the lens of Information and Organization, we must recognize that macro-level policy does not descend in a vacuum. Algorithmic governance begins as localized, sociomaterial practices within organizations well before they are codified by legislation. Data scientists establishing "acceptable" error rates and compliance officers drafting internal risk matrices define the initial boundaries. TST provides a sensitizing vocabulary for tracing this as a cascade from referential drift to infrastructural embedding to stratified legibility.

### 5.1 Assembling Macro-Policies and Organizational Practices: Interpretive Propositions

While Policy Prism analyzes macro-policy texts, these structural exclusions offer interpretive implications for the day-to-day sociomaterial labor of corporate compliance. Based on our textual analysis, we offer the following interpretive propositions for future organizational fieldwork.

When macro-governance architectures render workers or affected communities as Ghost Nodes, we propose that this structural absence may cascade to shape internal organizational workflows. Because affected populations lack procedural standing in these texts, the daily labor of organizational compliance may become decoupled from direct, friction-filled community engagement, operating instead as purely technocratic, upward-facing documentation generation.

Furthermore, we propose that these embedded compliance structures may act as institutional buffers. Drawing on foundational theories of decoupling and protecting the technical core (Thompson, 1967; Meyer & Rowan, 1977), we hypothesize that companies use these highly technical, upward-facing compliance structures to shield their engineering practices from public accountability. By routing accountability upward towards technocratic apex nodes instead of downward toward impacted communities, organizations may construct a "legibility shield." Future fieldwork with compliance workers, auditors, and standards bodies is needed to investigate how these legibility shields operate in daily practice—and whether they function as effectively as the textual architecture implies. As long as the organization produces the requisite compliance artifacts to satisfy the regulatory apex nodes, the firm's actual algorithmic weights, training data pipelines, and operational logic may remain insulated from external scrutiny.

### 5.2 The Mechanics of Stabilizing Absences

The critical organizational question is: *why does specific exclusion recur across governance assemblages?* We theorize the Ghost Node not as an institutional void, but as a systematically reproduced structural exclusion that filters out the friction of human consequence.

Consider the EU AI Act. The regime relies on rapid, standardized processing of AI product conformity assessments. In a counterfactual scenario where worker unions held legal standing to participate in evaluating high-risk workplace AI, they could introduce qualitative, context-specific assessments into a pipeline currently designed for standardized processing. We interpret the recurring textual pattern—rhetorical invocation without procedural standing—as consistent with an assemblage architecture that absorbs acknowledgment of worker interests while routing operative governance through channels insulated from labor input. Whether this pattern constitutes a stabilizing *necessity* or a stabilizing *compatibility* is a question our textual evidence alone cannot resolve; we present it as an interpretive proposition. What the textual analysis does demonstrate is that the pattern is not incidental: it is structurally embedded across the operative provisions of the Act, not merely absent from a single clause.

This suggests that simply adding advisory board representation for marginalized groups may have limited effect if the operative enforcement pathways remain unchanged.

### 5.3 Methodological and Conceptual Contributions

For Information & Organization scholarship, the primary contribution is the introduction of Policy Prism as a reflexive interpretive artifact. It functions as a counter-infrastructure of information. While traditional compliance reporting generates upward-flowing information confirming the system works for those at the apex, Policy Prism redirects attention to the information that does not flow, surfacing the exact textual conditions under which certain actors are rendered structurally invisible. This connects directly to I&O's sustained interest in the politics of visibility in information systems (Introna & Nissenbaum, 2000) and the sociomaterial production of organizational sensemaking (Orlikowski & Scott, 2008).

More specifically, this paper contributes to information systems scholarship by demonstrating that compliance infrastructures are not merely technical implementations of legislative requirements; they are information architectures that actively organize who becomes legible to governance processes. The Ghost Node construct reframes the question of organizational accountability from "who is responsible?" to "whose experience is informationally visible within the compliance architecture?" This reframing has direct implications for how I&O scholars study audit cultures, algorithmic transparency, and the organizational labor of regulatory compliance.

Three architectural properties distinguish Policy Prism from existing qualitative tools. First, the evidence-gated Ghost Node Detection Pipeline enforces a discipline that reduces speculative absence claims from entering the analytical record. Second, the mandatory analyst reflexive assessment transforms every machine-generated classification into a site of structured interpretive contestation, producing disagreement as a primary analytical output rather than an error to be resolved. Third, the cross-jurisdictional comparative synthesis operates simultaneously across five governance architectures through a common analytical schema, enabling the identification of structural patterns (such as the recurring exclusion of workers through *different mechanisms* in each regime) that sequential close reading would surface only with considerable difficulty. The Ghost Node, as a construct, emerged *from* this artifact-mediated process; it is not merely illustrated by it.

Conceptually, the Ghost Node provides a new vocabulary for organizational theory by changing the analytic inquiry from "who is absent?" to "how is this absence actively reproduced to organize the assemblage?" TST serves as a provisional sensitizing framework demonstrating that governance durability is achieved not solely through discourse, but through the continuous inscription of portable vocabularies into material infrastructures. TST's specific contribution is processual: it provides an analytical grammar for tracing how a common category ("risk," "fairness," "worker protection") undergoes referential drift, becomes infrastructurally embedded, and thereby produces the conditions under which specific actors are classified—or foreclosed—as governable subjects.

## 6. Conclusion

Algorithmic governance assemblages sustain over time because they organize the translation of portable vocabularies into compliance architectures that render actors differentially visible. The durability of an assemblage arises not only from what is formalized, but from what is consistently deflected or structurally foreclosed. The interpretive artifact presented here, Policy Prism, demonstrates that informational invisibility is a recurring stabilizing pattern of algorithmic governance.

The primary limitation of this study centers on the inherent epistemic friction of utilizing LLM-aided artifacts for policy scholarship. As theorized in our Methodology (Section 3.3), Policy Prism is an algorithmic assemblage susceptible to probabilistic closure, semantic compression, and hegemonic biases. While mitigated through strict evidence-only output requirements and mandatory human-gate reviews, continuous reflexive human interpretation remains an absolute necessity; the tool cannot function autonomously. The five-case comparative architecture also imposes constraints: claims grounded in the EU and Colorado statutory texts are more empirically secure than those derived from India's guidance framework, the U.S. emergent assemblage, or Brazil's pending legislation, and we have calibrated our interpretive confidence accordingly.

Furthermore, the insights regarding organizational buffering generated here serve as interpretive propositions; establishing the trustworthiness of these organizational dynamics requires future qualitative fieldwork with compliance practitioners, auditors, and standards body participants. While this study is scoped to state-level AI governance policy, the Ghost Node construct and TST framework are not inherently domain-bound: the analytical logic of tracing referential drift, infrastructural embedding, and stratified legibility may apply to other governance assemblages where portable categories travel across institutional boundaries—including platform governance, environmental regulation, and financial compliance architectures—though such extensions remain to be empirically investigated. A related productive boundary condition concerns scalability: Policy Prism's current architecture processes individual policy documents through sequential analyst-confirmed interpretation, making it well suited for deep qualitative analysis of landmark texts but not designed for real-time legislative tracking or corpus-scale automated monitoring. We view this as a principled design constraint rather than a limitation—the artifact's value lies precisely in the friction it introduces between machine and human interpretive labor—while acknowledging that scaling to larger corpora would require architectural adaptations that preserve this friction at each analytical layer. Assembling alternatives to address structural foreclosures—rather than merely augmenting them with advisory rhetoric—remains the central design challenge for producing equitable algorithmic governance.

## References

Bender, E. M., Gebru, T., McMillan-Major, A., & Shmitchell, S. (2021). On the dangers of stochastic parrots: Can language models be too big? *FAccT '21* (pp. 610–623). ACM.

Blumer, H. (1954). What is wrong with social theory? *American Sociological Review*, 19(1), 3-10.

Callon, M. (1986). The sociology of an actor-network: The case of the electric vehicle. In M. Callon, J. Law, & A. Rip (Eds.), *Mapping the dynamics of science and technology* (pp. 19–34). Macmillan.

Callon, M., Lascoumes, P., & Barthe, Y. (2009). *Acting in an uncertain world: An essay on technical democracy*. MIT Press.

DeLanda, M. (2016). *Assemblage theory*. Edinburgh University Press.

Deleuze, G., & Guattari, F. (1987). *A thousand plateaus: Capitalism and schizophrenia*. University of Minnesota Press.

Finnemore, M., & Sikkink, K. (1998). International norm dynamics and political change. *International Organization*, 52(4), 887–917.

Floridi, L. (2013). *The ethics of information*. Oxford University Press.

Floridi, L. (2023). *The ethics of artificial intelligence*. Oxford University Press.

Introna, L. D., & Nissenbaum, H. (2000). Shaping the web: Why the politics of search engines matters. *The Information Society*, 16(3), 169–185.

Khanna, T., & Palepu, K. G. (1997). Why focused strategies may be wrong for emerging markets. *Harvard Business Review*, 75(4), 41–48.

Klein, H. K., & Myers, M. D. (1999). A set of principles for conducting and evaluating interpretive field studies in information systems. *MIS Quarterly*, 23(1), 67-93.

Latour, B. (2005). *Reassembling the social: An introduction to actor-network-theory*. Oxford University Press.

Law, J. (2009). Actor network theory and material semiotics. In B. S. Turner (Ed.), *The new Blackwell companion to social theory* (pp. 141–158). Wiley-Blackwell.

Lincoln, Y. S., & Guba, E. G. (1985). *Naturalistic inquiry*. Sage Publications.

Merry, S. E. (2006). *Human rights and gender violence: Translating international law into local justice*. University of Chicago Press.

Meyer, J. W., & Rowan, B. (1977). Institutionalized organizations: Formal structure as myth and ceremony. *American Journal of Sociology*, 83(2), 340-363.

Morrison, E. W., & Milliken, F. J. (2000). Organizational silence. *Academy of Management Review*, 25(4), 706–725.

Orlikowski, W. J., & Scott, S. V. (2008). Sociomateriality: Challenging the separation of technology, work and organization. *Academy of Management Annals*, 2(1), 433–474.

Paseri, L., & Durante, M. (2025). Examining epistemological challenges of large language models in law. *Cambridge Forum on AI: Law and Governance*, 1, e7.

Shaikh, M., Rinta-Kahila, T., & Schache, M. (2023). Relational spaces of algorithmic accountability. *Information and Organization*, 33(4), 100490.

Star, S. L. (1991). Power, technologies and the phenomenology of conventions: On being allergic to onions. In J. Law (Ed.), *A sociology of monsters: Essays on power, technology and domination* (pp. 26–56). Routledge.

Suchman, L. (2007). *Human-machine reconfigurations: Plans and situated actions* (2nd ed.). Cambridge University Press.

Thompson, J. D. (1967). *Organizations in action: Social science bases of administrative theory*. McGraw-Hill.

Tuunanen, T., Winter, R., & vom Brocke, J. (2024). Dealing with complexity in design science research. *MIS Quarterly*, 48(2), 427–458.

Ye, R., Huang, O., Lee, P. Y. K., Liut, M., Nobre, C., & Kong, H.-K. (2026). Reflexis: Supporting reflexivity and rigor in collaborative qualitative analysis through design for deliberation. *arXiv preprint arXiv:2601.15445*.
