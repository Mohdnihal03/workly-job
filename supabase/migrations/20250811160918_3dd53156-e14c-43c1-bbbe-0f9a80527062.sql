-- Create a table for job postings
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  qualification TEXT NOT NULL,
  vacancy INTEGER NOT NULL DEFAULT 1,
  company TEXT NOT NULL,
  location TEXT,
  apply_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read jobs (public job board)
CREATE POLICY "Anyone can view jobs" 
ON public.jobs 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert jobs (anonymous posting)
CREATE POLICY "Anyone can post jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample data
INSERT INTO public.jobs (title, skills, qualification, vacancy, company, location, apply_link) VALUES
('Frontend Developer', ARRAY['React', 'TypeScript', 'Tailwind CSS', 'JavaScript'], 'B.Tech/B.E. in Computer Science', 2, 'TechCorp Solutions', 'Bangalore, India', 'https://example.com/apply/frontend'),
('Data Scientist', ARRAY['Python', 'Machine Learning', 'SQL', 'TensorFlow'], 'M.Sc. in Data Science or equivalent', 1, 'DataInsights Inc', 'Remote', 'https://example.com/apply/data-scientist'),
('Full Stack Developer', ARRAY['Node.js', 'React', 'MongoDB', 'Express.js', 'AWS'], 'B.Tech/M.Tech in CSE', 3, 'StartupXYZ', 'Mumbai, India', 'https://example.com/apply/fullstack');