import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobData {
  title: string;
  skills: string[];
  qualification: string;
  vacancy: number;
  company: string;
  location: string;
  applyLink: string;
  mathAnswer: number;
  mathA: number;
  mathB: number;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const jobData: JobData = await req.json();
    
    // Validate math captcha
    const correctAnswer = jobData.mathA + jobData.mathB;
    if (jobData.mathAnswer !== correctAnswer) {
      return new Response(
        JSON.stringify({ error: 'Incorrect math answer. Please try again.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    // Check rate limit (1 post per hour per IP)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentSubmissions } = await supabase
      .from('job_post_submissions')
      .select('id')
      .eq('ip', clientIP)
      .gte('created_at', oneHourAgo);

    if (recentSubmissions && recentSubmissions.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait an hour before posting again.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Insert job
    const { data: newJob, error: jobError } = await supabase
      .from('jobs')
      .insert({
        title: jobData.title,
        skills: jobData.skills,
        qualification: jobData.qualification,
        vacancy: jobData.vacancy,
        company: jobData.company,
        location: jobData.location,
        apply_link: jobData.applyLink,
      })
      .select()
      .single();

    if (jobError) {
      console.error('Job insertion error:', jobError);
      return new Response(
        JSON.stringify({ error: 'Failed to post job. Please try again.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log submission for rate limiting
    await supabase
      .from('job_post_submissions')
      .insert({
        ip: clientIP,
        job_id: newJob.id,
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        job: {
          ...newJob,
          postedDate: newJob.created_at
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in post-job function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);