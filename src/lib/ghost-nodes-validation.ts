/**
 * Ghost Node Response Validation Utilities
 * Validates AI-generated ghost node responses for quality and completeness
 */

export interface ValidationError {
  actorName: string;
  field: string;
  issue: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validates a ghost node AI response for quality and completeness
 */
export function validateGhostNodeResponse(
  response: any,
  existingAnalysis: { nodes?: Array<{ label?: string; id?: string }> }
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate response structure
  if (!response || typeof response !== 'object') {
    errors.push({
      actorName: 'N/A',
      field: 'response',
      issue: 'Response is not a valid object',
      severity: 'error'
    });
    return { isValid: false, errors, warnings };
  }

  // Validate absentActors array
  if (!Array.isArray(response.absentActors)) {
    errors.push({
      actorName: 'N/A',
      field: 'absentActors',
      issue: 'absentActors is not an array',
      severity: 'error'
    });
    return { isValid: false, errors, warnings };
  }

  // Check actor count
  if (response.absentActors.length === 0) {
    warnings.push({
      actorName: 'N/A',
      field: 'absentActors',
      issue: 'No absent actors identified',
      severity: 'warning'
    });
  } else if (response.absentActors.length > 5) {
    warnings.push({
      actorName: 'N/A',
      field: 'absentActors',
      issue: `Too many actors (${response.absentActors.length}), should be 3-5`,
      severity: 'warning'
    });
  }

  // Validate each absent actor
  response.absentActors.forEach((actor: any, index: number) => {
    const actorName = actor.name || `Actor ${index + 1}`;

    // Required fields
    const requiredFields = ['name', 'reason', 'absenceStrength', 'exclusionType', 'institutionalLogics', 'potentialConnections'];
    requiredFields.forEach(field => {
      if (!actor[field]) {
        errors.push({
          actorName,
          field,
          issue: `Missing required field: ${field}`,
          severity: 'error'
        });
      }
    });

    // Validate absenceStrength
    if (actor.absenceStrength !== undefined) {
      if (typeof actor.absenceStrength !== 'number' || actor.absenceStrength < 0 || actor.absenceStrength > 100) {
        errors.push({
          actorName,
          field: 'absenceStrength',
          issue: `Invalid absenceStrength: ${actor.absenceStrength} (must be 0-100)`,
          severity: 'error'
        });
      }

      // Check if high score is justified by reasoning length
      if (actor.absenceStrength > 80 && actor.reason && actor.reason.length < 100) {
        warnings.push({
          actorName,
          field: 'absenceStrength',
          issue: `High absence strength (${actor.absenceStrength}) but weak reasoning (${actor.reason.length} chars)`,
          severity: 'warning'
        });
      }
    }

    // Validate exclusionType
    const validExclusionTypes = ['silenced', 'marginalized', 'structurally-excluded', 'displaced'];
    if (actor.exclusionType && !validExclusionTypes.includes(actor.exclusionType)) {
      errors.push({
        actorName,
        field: 'exclusionType',
        issue: `Invalid exclusionType: "${actor.exclusionType}" (must be one of: ${validExclusionTypes.join(', ')})`,
        severity: 'error'
      });
    }

    // Validate institutionalLogics
    if (actor.institutionalLogics) {
      const logics = ['market', 'state', 'professional', 'community'];
      logics.forEach(logic => {
        const value = actor.institutionalLogics[logic];
        if (value !== undefined && (typeof value !== 'number' || value < 0 || value > 1)) {
          errors.push({
            actorName,
            field: `institutionalLogics.${logic}`,
            issue: `Invalid logic strength: ${value} (must be 0.0-1.0)`,
            severity: 'error'
          });
        }
      });
    }

    // Validate potentialConnections
    if (Array.isArray(actor.potentialConnections)) {
      if (actor.potentialConnections.length === 0) {
        warnings.push({
          actorName,
          field: 'potentialConnections',
          issue: 'No potential connections provided',
          severity: 'warning'
        });
      }

      actor.potentialConnections.forEach((conn: any, connIndex: number) => {
        // Check required connection fields
        if (!conn.targetActor) {
          errors.push({
            actorName,
            field: `potentialConnections[${connIndex}].targetActor`,
            issue: 'Missing targetActor',
            severity: 'error'
          });
        }

        if (!conn.evidence) {
          errors.push({
            actorName,
            field: `potentialConnections[${connIndex}].evidence`,
            issue: 'Missing evidence',
            severity: 'error'
          });
        }

        // Check if evidence appears to be verbatim (contains quotes)
        if (conn.evidence && !conn.evidence.includes('"') && !conn.evidence.includes("'")) {
          warnings.push({
            actorName,
            field: `potentialConnections[${connIndex}].evidence`,
            issue: 'Evidence does not appear to be a verbatim quote (no quotation marks)',
            severity: 'warning'
          });
        }

        // Check if targetActor exists in network
        if (conn.targetActor && existingAnalysis.nodes) {
          const exists = existingAnalysis.nodes.some(
            n => n.label === conn.targetActor || n.id === conn.targetActor
          );
          if (!exists) {
            errors.push({
              actorName,
              field: `potentialConnections[${connIndex}].targetActor`,
              issue: `targetActor "${conn.targetActor}" not found in existing network`,
              severity: 'error'
            });
          }
        }
      });
    }
  });

  const isValid = errors.length === 0;
  return { isValid, errors, warnings };
}

/**
 * Generates a follow-up prompt to fix validation errors
 */
export function generateCorrectionPrompt(validationResult: ValidationResult): string {
  const { errors, warnings } = validationResult;

  if (errors.length === 0 && warnings.length === 0) {
    return '';
  }

  let prompt = 'Your previous response had the following issues:\n\n';

  if (errors.length > 0) {
    prompt += '**ERRORS (must fix):**\n';
    errors.forEach((error, i) => {
      prompt += `${i + 1}. [${error.actorName}] ${error.field}: ${error.issue}\n`;
    });
    prompt += '\n';
  }

  if (warnings.length > 0) {
    prompt += '**WARNINGS (should improve):**\n';
    warnings.forEach((warning, i) => {
      prompt += `${i + 1}. [${warning.actorName}] ${warning.field}: ${warning.issue}\n`;
    });
    prompt += '\n';
  }

  prompt += `Please revise your analysis to address these issues. Specifically:
1. Ensure all evidence fields contain verbatim quotes from the document (use quotation marks)
2. Ensure all targetActor names exactly match actors in the existing network
3. Provide detailed reasoning for high absence strength scores (> 80)
4. Use only valid exclusionType values: silenced, marginalized, structurally-excluded, displaced
5. Ensure all required fields are present for each absent actor

Return the corrected JSON response.`;

  return prompt;
}

/**
 * Logs validation results to console
 */
export function logValidationResults(validationResult: ValidationResult): void {
  const { isValid, errors, warnings } = validationResult;

  if (isValid && warnings.length === 0) {
    console.log('[VALIDATION] ✓ Response validation passed');
    return;
  }

  if (errors.length > 0) {
    console.error('[VALIDATION] ✗ Response validation failed with', errors.length, 'errors:');
    errors.forEach((error, i) => {
      console.error(`  ${i + 1}. [${error.actorName}] ${error.field}: ${error.issue}`);
    });
  }

  if (warnings.length > 0) {
    console.warn('[VALIDATION] ⚠ Response has', warnings.length, 'warnings:');
    warnings.forEach((warning, i) => {
      console.warn(`  ${i + 1}. [${warning.actorName}] ${warning.field}: ${warning.issue}`);
    });
  }
}
