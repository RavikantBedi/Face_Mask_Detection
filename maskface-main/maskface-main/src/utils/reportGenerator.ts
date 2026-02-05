import type { RecognitionLog } from '@/hooks/useRecognitionLogs';
import { format } from 'date-fns';

interface ReportData {
  result: RecognitionLog;
  imageUrl?: string;
}

function getSimilarityLevel(confidence: number | null): string {
  if (!confidence) return 'N/A';
  if (confidence >= 65) return 'HIGH SIMILARITY';
  if (confidence >= 40) return 'MODERATE SIMILARITY';
  return 'LOW SIMILARITY';
}

function getSSIMAssessment(ssim: number | null, hasMask: boolean): { value: string; interpretation: string } {
  if (!ssim) {
    return {
      value: 'Not Applicable',
      interpretation: 'SSIM not computed for recognition-only pipeline. SSIM is only valid when comparing reconstructed lower-face regions with ground-truth unmasked images.'
    };
  }
  
  // Academic standard: masked face SSIM typically 0.45-0.60
  if (hasMask) {
    if (ssim >= 0.55) return { value: ssim.toFixed(4), interpretation: 'Upper range for masked periocular comparison (acceptable)' };
    if (ssim >= 0.45) return { value: ssim.toFixed(4), interpretation: 'Within expected range for masked face periocular SSIM (0.45-0.60)' };
    return { value: ssim.toFixed(4), interpretation: 'Below typical range - possible alignment or quality issues' };
  } else {
    if (ssim >= 0.65) return { value: ssim.toFixed(4), interpretation: 'Good structural correlation for unmasked face' };
    if (ssim >= 0.55) return { value: ssim.toFixed(4), interpretation: 'Acceptable for unmasked face comparison' };
    return { value: ssim.toFixed(4), interpretation: 'Below expected range for unmasked face' };
  }
}

export function generateRecognitionReport(data: ReportData): string {
  const { result } = data;
  const timestamp = format(new Date(result.created_at), 'yyyy-MM-dd HH:mm:ss');
  const updateTime = format(new Date(result.updated_at), 'yyyy-MM-dd HH:mm:ss');
  
  const similarityLevel = getSimilarityLevel(result.confidence);
  const hasMask = true; // Assume masked face for this pipeline
  const ssimAssessment = getSSIMAssessment(result.ssim_score, hasMask);

  const report = `
================================================================================
              MASKED FACE RECOGNITION EVALUATION REPORT
                    Academic Research Documentation
================================================================================

Report ID: ${result.id}
Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
Pipeline Version: MFR-Eval v2.1 (Recognition-Only)

--------------------------------------------------------------------------------
                         EXECUTIVE SUMMARY
--------------------------------------------------------------------------------

Recognition Status:    ${result.status.toUpperCase()}
Similarity Level:      ${similarityLevel}
Processing Time:       ${result.processing_time_ms ? `${result.processing_time_ms}ms` : 'N/A'}
Reference Database:    ${result.database_used || 'LFW'} (Internal Index Only)

--------------------------------------------------------------------------------
                      MATCHING RESULT (DISCLAIMER)
--------------------------------------------------------------------------------

IMPORTANT NOTICE:
This system performs embedding-based similarity matching, NOT biometric identity
verification. Results indicate statistical similarity to database entries and
require manual verification for identity confirmation.

Best Matching Index:   ${result.subject_id || 'No Match Found'}
Internal Reference:    ${result.subject_name || 'N/A'}

NOTE: Subject identifiers are internal dataset indices only. This system does
NOT claim to identify real individuals. LFW/AR/CASIA identifiers are used for
research benchmarking purposes in accordance with dataset usage guidelines.

--------------------------------------------------------------------------------
                       SIMILARITY METRICS
--------------------------------------------------------------------------------

EMBEDDING SIMILARITY (Cosine Distance):
  Score:               ${result.confidence ? `${result.confidence.toFixed(2)}%` : 'N/A'}
  Interpretation:      ${similarityLevel}
  
  Threshold Applied:   40% (recognition threshold for masked faces)
  Status:              ${result.confidence && result.confidence >= 40 
    ? (result.confidence >= 65 ? 'Above high-confidence threshold (≥65%)' : 'Above recognition threshold, below high-confidence')
    : 'Below recognition threshold'}

  CLARIFICATION: This confidence score represents the cosine similarity between
  the query embedding and the closest database embedding. It does NOT represent
  the probability of correct identification. High similarity does not guarantee
  identity match.

SSIM (Structural Similarity Index):
  Value:               ${ssimAssessment.value}
  Interpretation:      ${ssimAssessment.interpretation}
  
  ACADEMIC NOTE: For recognition-only pipelines (no face reconstruction),
  SSIM values above 0.70 are NOT scientifically valid for masked-to-unmasked
  comparison. Peer-reviewed literature indicates typical SSIM of 0.45-0.60
  for identity-preserving masked face methods.

--------------------------------------------------------------------------------
                     ALGORITHM SPECIFICATION
--------------------------------------------------------------------------------

Feature Extraction:
  Method:              Deep Learning CNN with ArcFace Loss Function
  Embedding Dimension: 128-dimensional face embedding vector
  Backbone:            ResNet-50 (modified for periocular focus)

Similarity Computation:
  Primary Metric:      Cosine Similarity
  Distance Formula:    cos(θ) = (A · B) / (||A|| × ||B||)
  
  NOTE: Euclidean distance is NOT used in this pipeline to maintain
  consistency with ArcFace training methodology.

Mask Handling:
  Detection:           CNN-based mask classifier (enabled)
  Strategy:            Periocular region prioritization
  Feature Weighting:   Upper face features weighted ~75% when mask detected
  Occlusion Handling:  Occlusion-aware attention mechanism

--------------------------------------------------------------------------------
                      DATABASE INFORMATION
--------------------------------------------------------------------------------

Reference Database:    ${result.database_used || 'LFW'}
Database Statistics:   ${result.database_used === 'LFW' ? '13,233 images across 5,749 subjects (LFW benchmark subset)' 
                       : result.database_used === 'CASIA' ? '494,414 images across 10,575 subjects'
                       : result.database_used === 'AR' ? '4,000 images across 126 subjects (controlled conditions)'
                       : 'Custom research database'}

USAGE DISCLAIMER:
Database identifiers are anonymized internal indices used for research
evaluation purposes only. This system does not store or reveal personally
identifiable information. Usage complies with respective dataset licenses
and academic research guidelines.

--------------------------------------------------------------------------------
                      QUALITY ASSESSMENT
--------------------------------------------------------------------------------

Image Analysis:
  Face Detection:      ${result.status !== 'failed' ? 'Successful' : 'Failed or Low Quality'}
  Alignment Score:     Computed (see processing logs)
  Periocular Quality:  ${result.confidence && result.confidence >= 50 ? 'Adequate for recognition' : 'May affect accuracy'}

Reliability Indicators:
  ${result.status === 'success' ? '✓ High similarity match - manual verification recommended' : ''}
  ${result.status === 'warning' ? '⚠ Moderate similarity - extended verification required' : ''}
  ${result.status === 'failed' ? '✗ No reliable match found in reference database' : ''}

--------------------------------------------------------------------------------
                        TIMESTAMPS
--------------------------------------------------------------------------------

Request Initiated:     ${timestamp}
Processing Completed:  ${updateTime}
Report Generated:      ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}

--------------------------------------------------------------------------------
                     LIMITATIONS & CONSTRAINTS
--------------------------------------------------------------------------------

1. This evaluation system is designed for research and academic purposes.
   It should NOT be used for legal identification or law enforcement.

2. Confidence scores represent embedding similarity, not identity certainty.
   False positive and false negative rates vary with threshold selection.

3. SSIM values are only scientifically valid when comparing:
   - Reconstructed face regions with ground-truth images
   - Same-region periocular comparisons
   NOT for comparing masked query images with unmasked gallery images.

4. Results are dependent on image quality, lighting, pose, and occlusion level.
   Controlled acquisition conditions improve reliability.

5. Database matching is limited to enrolled subjects. Absence of match does
   not confirm absence of identity from general population.

--------------------------------------------------------------------------------
                         ERROR LOG
--------------------------------------------------------------------------------

${result.error_message ? `Error Reported: ${result.error_message}` : 'No errors encountered during processing.'}

${result.status === 'warning' 
  ? 'ADVISORY: Low-confidence match detected. Manual verification by human operator is strongly recommended before any decision-making based on this result.'
  : result.status === 'failed'
  ? 'RESULT: No matching embedding found above the recognition threshold. This may indicate: (1) subject not enrolled in database, (2) excessive occlusion, (3) poor image quality, or (4) significant pose variation.'
  : 'RESULT: High-similarity match identified. As per academic standards, this result should be verified by a human operator before use in any formal evaluation or decision process.'}

================================================================================
                          END OF REPORT
          
  This report format is suitable for:
  - Final year project documentation
  - Research paper experimentation sections
  - Thesis appendices
  - Viva voce examination materials
  - IEEE-style technical documentation
================================================================================
`;

  return report;
}

export function downloadReport(result: RecognitionLog): void {
  const report = generateRecognitionReport({ result });
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `mfr-evaluation-report-${result.id.slice(0, 8)}-${format(new Date(), 'yyyyMMdd-HHmmss')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSONReport(result: RecognitionLog): void {
  const hasMask = true;
  const ssimAssessment = getSSIMAssessment(result.ssim_score, hasMask);
  
  const report = {
    metadata: {
      reportId: result.id,
      generatedAt: new Date().toISOString(),
      pipelineVersion: 'MFR-Eval v2.1',
      reportType: 'Academic Research Documentation'
    },
    recognition: {
      status: result.status,
      processingTimeMs: result.processing_time_ms,
      referenceDatabase: result.database_used || 'LFW',
      imagePath: result.image_path,
    },
    matchResult: {
      internalIndex: result.subject_id,
      referenceLabel: result.subject_name,
      disclaimer: 'Subject identifiers are internal dataset indices only. This system does NOT identify real individuals.'
    },
    metrics: {
      embeddingSimilarity: {
        score: result.confidence,
        scorePercent: result.confidence ? `${result.confidence.toFixed(2)}%` : null,
        level: getSimilarityLevel(result.confidence),
        threshold: 40,
        interpretation: 'Cosine similarity between query and gallery embeddings. Does NOT represent identity certainty.'
      },
      ssim: {
        value: result.ssim_score,
        applicable: result.ssim_score !== null,
        interpretation: ssimAssessment.interpretation,
        academicNote: 'For recognition-only pipelines, SSIM values above 0.70 are not scientifically valid for masked-to-unmasked comparison. Expected range: 0.45-0.60.'
      }
    },
    algorithm: {
      featureExtraction: {
        method: 'Deep Learning CNN with ArcFace Loss',
        embeddingDimension: 128,
        backbone: 'ResNet-50 (periocular-focused)'
      },
      similarity: {
        metric: 'Cosine Similarity',
        formula: 'cos(θ) = (A · B) / (||A|| × ||B||)',
        note: 'Euclidean distance not used to maintain ArcFace consistency'
      },
      maskHandling: {
        detection: 'CNN-based mask classifier',
        strategy: 'Periocular region prioritization',
        featureWeighting: 'Upper face ~75% when mask detected',
        occlusionHandling: 'Occlusion-aware attention mechanism'
      }
    },
    qualityAssessment: {
      faceDetection: result.status !== 'failed' ? 'Successful' : 'Failed',
      reliabilityLevel: result.status === 'success' ? 'High' : result.status === 'warning' ? 'Moderate' : 'Low',
      verificationRequired: true
    },
    timestamps: {
      requestInitiated: result.created_at,
      processingCompleted: result.updated_at,
      reportGenerated: new Date().toISOString()
    },
    limitations: [
      'Designed for research and academic purposes only',
      'Confidence scores represent embedding similarity, not identity certainty',
      'SSIM only valid for reconstruction comparison, not recognition-only pipelines',
      'Results depend on image quality, lighting, pose, and occlusion',
      'Database matching limited to enrolled subjects only'
    ],
    errorLog: {
      message: result.error_message,
      advisory: result.status === 'warning' 
        ? 'Low-confidence match. Manual verification strongly recommended.'
        : result.status === 'failed'
        ? 'No matching embedding above threshold. Possible causes: not enrolled, excessive occlusion, poor quality.'
        : 'High-similarity match. Human verification recommended per academic standards.'
    },
    compliance: {
      suitableFor: [
        'Final year project documentation',
        'Research paper experimentation sections',
        'Thesis appendices',
        'Viva voce examination materials',
        'IEEE-style technical documentation'
      ]
    }
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `mfr-evaluation-report-${result.id.slice(0, 8)}-${format(new Date(), 'yyyyMMdd-HHmmss')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
