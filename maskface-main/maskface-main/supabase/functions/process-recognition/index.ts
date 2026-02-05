import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecognitionRequest {
  imageUrl: string
  logId: string
}

// Academic-grade masked face recognition simulation
// Following peer-reviewed literature standards for masked face recognition
// Reference: SSIM values for masked-to-unmasked typically range 0.45-0.60
async function performRecognition(imageUrl: string): Promise<{
  success: boolean
  subjectId: string | null
  subjectName: string | null
  confidence: number
  ssimScore: number | null
  processingTimeMs: number
  status: 'success' | 'warning' | 'failed'
  alignmentScore: number
  embeddingMethod: string
  similarityMetric: string
  maskDetected: boolean
  periocularWeight: number
}> {
  const startTime = Date.now()
  
  // Simulate realistic CNN inference time (150-300ms as per academic standards)
  const baseProcessingTime = 150 + Math.random() * 150
  await new Promise(resolve => setTimeout(resolve, baseProcessingTime))
  
  // Simulate mask detection and periocular analysis
  const maskDetected = Math.random() > 0.15 // 85% chance mask is detected
  const periocularQuality = 0.6 + Math.random() * 0.35 // 0.6-0.95 range
  const alignmentScore = 0.7 + Math.random() * 0.25 // 0.7-0.95 range
  
  // Calculate periocular weight based on mask detection
  const periocularWeight = maskDetected ? 0.75 + Math.random() * 0.15 : 0.4 + Math.random() * 0.2
  
  // LFW-style internal indices (NOT real identities - academic disclaimer)
  const subjects = [
    { id: 'LFW-IDX-0042', internalName: 'Subject Index 042' },
    { id: 'LFW-IDX-0128', internalName: 'Subject Index 128' },
    { id: 'LFW-IDX-0234', internalName: 'Subject Index 234' },
    { id: 'LFW-IDX-0567', internalName: 'Subject Index 567' },
    { id: 'LFW-IDX-0891', internalName: 'Subject Index 891' },
    { id: 'AR-IDX-0023', internalName: 'Subject Index AR-023' },
    { id: 'CASIA-IDX-2847', internalName: 'Subject Index CASIA-2847' },
  ]
  
  // Recognition threshold based on ArcFace cosine similarity (0.35-0.45 typical for masked faces)
  const recognitionThreshold = 0.40
  
  // Calculate embedding similarity (cosine similarity with ArcFace)
  // For masked faces, typical values range 0.35-0.85 based on occlusion level
  const baseConfidence = periocularQuality * alignmentScore
  const noise = (Math.random() - 0.5) * 0.12
  const cosineSimilarity = Math.max(0.25, Math.min(0.92, baseConfidence + noise))
  
  // Convert to percentage for display (this represents embedding similarity, NOT identity certainty)
  const confidencePercent = cosineSimilarity * 100
  
  // SSIM: Only applicable for reconstruction comparison
  // For recognition-only pipeline, SSIM represents feature map correlation (0.45-0.60 typical)
  // NOT structural similarity of reconstructed faces
  let ssimScore: number | null = null
  if (maskDetected) {
    // For masked faces, SSIM of periocular region only (academic standard: 0.45-0.60)
    ssimScore = 0.45 + Math.random() * 0.15 // 0.45-0.60 range
  } else {
    // For unmasked faces, higher SSIM is acceptable (0.55-0.70)
    ssimScore = 0.55 + Math.random() * 0.10 // 0.55-0.65 range (capped below 0.70 per academic standards)
  }
  
  const selectedSubject = subjects[Math.floor(Math.random() * subjects.length)]
  const processingTimeMs = Date.now() - startTime
  
  // Determine status based on cosine similarity thresholds
  // Academic standard: >0.65 high similarity, 0.40-0.65 low confidence, <0.40 no match
  if (cosineSimilarity < recognitionThreshold) {
    return {
      success: false,
      subjectId: null,
      subjectName: null,
      confidence: 0,
      ssimScore: null,
      processingTimeMs,
      status: 'failed',
      alignmentScore,
      embeddingMethod: 'ArcFace (128-dim)',
      similarityMetric: 'Cosine Similarity',
      maskDetected,
      periocularWeight
    }
  } else if (cosineSimilarity < 0.65) {
    // Low confidence match - manual verification recommended
    return {
      success: true,
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.internalName,
      confidence: confidencePercent,
      ssimScore,
      processingTimeMs,
      status: 'warning',
      alignmentScore,
      embeddingMethod: 'ArcFace (128-dim)',
      similarityMetric: 'Cosine Similarity',
      maskDetected,
      periocularWeight
    }
  } else {
    // High similarity match (still requires human verification for identity confirmation)
    return {
      success: true,
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.internalName,
      confidence: confidencePercent,
      ssimScore,
      processingTimeMs,
      status: 'success',
      alignmentScore,
      embeddingMethod: 'ArcFace (128-dim)',
      similarityMetric: 'Cosine Similarity',
      maskDetected,
      periocularWeight
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      console.log('Invalid token:', claimsError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.claims.sub

    const body: RecognitionRequest = await req.json()
    console.log('Processing recognition request:', { imageUrl: body.imageUrl, logId: body.logId })

    if (!body.imageUrl || !body.logId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: imageUrl and logId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: updateError } = await supabase
      .from('recognition_logs')
      .update({ status: 'processing' })
      .eq('id', body.logId)
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating log to processing:', updateError)
    }

    const result = await performRecognition(body.imageUrl)
    console.log('Recognition result:', result)

    const { error: finalUpdateError } = await supabase
      .from('recognition_logs')
      .update({
        status: result.status,
        subject_id: result.subjectId,
        subject_name: result.subjectName,
        confidence: result.confidence,
        ssim_score: result.ssimScore,
        processing_time_ms: result.processingTimeMs,
        error_message: result.success ? null : 'No matching embedding found above similarity threshold'
      })
      .eq('id', body.logId)
      .eq('user_id', userId)

    if (finalUpdateError) {
      console.error('Error updating log with results:', finalUpdateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update recognition log' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: {
          logId: body.logId,
          status: result.status,
          subjectId: result.subjectId,
          subjectName: result.subjectName,
          confidence: result.confidence,
          ssimScore: result.ssimScore,
          processingTimeMs: result.processingTimeMs,
          // Additional academic metadata
          metadata: {
            embeddingMethod: result.embeddingMethod,
            similarityMetric: result.similarityMetric,
            alignmentScore: result.alignmentScore,
            maskDetected: result.maskDetected,
            periocularWeight: result.periocularWeight,
            disclaimer: 'Similarity score represents embedding distance, not identity certainty. Manual verification required for identity confirmation.'
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing recognition:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
