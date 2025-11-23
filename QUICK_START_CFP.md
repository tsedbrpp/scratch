# Quick Start: Running CFP Analyses

##  How to Run Institutional Logics & Cultural Framing Analysis

Since your comparison page is ready but showing "No institutional logics analysis yet", you need to run the analyses on your documents first.

### **Option 1: Browser Console (Quick & Easy)**

1. **Go to Policy Documents page**
2. **Open browser console** (F12 or Right-click → Inspect → Console)
3. **Copy and paste this code:**

```javascript
// Run BOTH analyses on your first policy document
const runAllAnalyses = async () => {
  const sources = JSON.parse(localStorage.getItem('research-sources') || '[]');
  const policyDocs = sources.filter(s => s.type !== 'Trace');
  
  if (policyDocs.length === 0) {
    console.error('No policy documents found! Upload a PDF first.');
    return;
  }
  
  const doc = policyDocs[0]; // Change [0] to [1], [2] etc for other documents
  console.log(`Analyzing: ${doc.title}`);
  
  // 1. Cultural Framing Analysis
  console.log('Running cultural framing analysis...');
  const culturalResponse = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: doc.extractedText.substring(0, 4000),
      sourceType: 'Policy Document',
      analysisMode: 'cultural_framing'
    })
  });
  const culturalResult = await culturalResponse.json();
  doc.cultural_framing = culturalResult.analysis;
  console.log('✓ Cultural framing complete!', culturalResult.analysis);
  
  // 2. Institutional Logics Analysis
  console.log('Running institutional logics analysis...');
  const logicsResponse = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: doc.extractedText.substring(0, 4000),
      sourceType: 'Policy Document',
      analysisMode: 'institutional_logics'
    })
  });
  const logicsResult = await logicsResponse.json();
  doc.institutional_logics = logicsResult.analysis;
  console.log('✓ Institutional logics complete!', logicsResult.analysis);
  
  // Save everything back
  localStorage.setItem('research-sources', JSON.stringify(sources));
  console.log('✅ All analyses saved! Go to Comparison page to view results.');
};

runAllAnalyses();
```

4. **Wait for analyses to complete** (~10-20 seconds)
5. **Go to Comparison page** to see results!

---

### **To analyze multiple documents:**

```javascript
// Analyze ALL policy documents at once
const analyzeAllDocs = async () => {
  const sources = JSON.parse(localStorage.getItem('research-sources') || '[]');
  const policyDocs = sources.filter(s => s.type !== 'Trace');
  
  for (const doc of policyDocs) {
    console.log(`\n📄 Analyzing: ${doc.title}`);
    
    // Cultural Framing
    const culturalRes = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: doc.extractedText.substring(0, 4000),
        sourceType: 'Policy Document',
        analysisMode: 'cultural_framing'
      })
    });
    doc.cultural_framing = (await culturalRes.json()).analysis;
    console.log('  ✓ Cultural framing');
    
    // Institutional Logics
    const logicsRes = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: doc.extractedText.substring(0, 4000),
        sourceType: 'Policy Document',
        analysisMode: 'institutional_logics'
      })
    });
    doc.institutional_logics = (await logicsRes.json()).analysis;
    console.log('  ✓ Institutional logics');
  }
  
  localStorage.setItem('research-sources', JSON.stringify(sources));
  console.log('\n✅ All documents analyzed! Refresh the Comparison page.');
};

analyzeAllDocs();
```

---

## **What You'll See on Comparison Page**

After running the analyses, the Comparison page will show:

### **Cultural Framing Tab:**
- **Cultural Distinctiveness Scores** (0-100%)
- **State-Market-Society** comparisons
- **Technology Role** across jurisdictions
- **Rights Conception** differences
- **Historical Context** variations

### **Institutional Logics Tab:**
- **Logic Strength** bars (Market, State, Professional, Community)
- **Dominant Logic** per jurisdiction
- **Material & Discursive** manifestations
- **Logic Conflicts** and resolution strategies

---

## **Troubleshooting**

**"No documents found":**
- Upload a PDF on the Policy Documents page first

**"Analysis failed":**
- Check that `OPENAI_API_KEY` is set in `.env.local`
- Restart the dev server after adding the key

**"Still showing no analysis":**
- Hard refresh the Comparison page (Ctrl+Shift+R)
- Check browser console for errors

---

## **Cost Estimate**

- Each analysis: ~$0.02 (GPT-4, 1500 tokens)
- 2 analyses per document: ~$0.04
- 3 documents fully analyzed: ~$0.12

---

## **Next: Add More Jurisdictions**

For the best CFP comparison, add:
1. **Brazil PL 2338** (upload PDF)
2. **US Executive Orders** on AI
3. Run analyses on all three
4. Compare on Comparison page!
