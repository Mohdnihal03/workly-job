import { useState, useMemo, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { JobCard, Job } from "@/components/JobCard";
import { JobPostForm } from "@/components/JobPostForm";
import { SearchFilters } from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
const Index = () => {
  console.log("Index component is rendering");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();

  // Fetch jobs from Supabase on component mount
  useEffect(() => {
    fetchJobs();
  }, []);
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('jobs').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;

      // Transform Supabase data to match Job interface
      const transformedJobs: Job[] = data.map(job => ({
        id: job.id,
        title: job.title,
        skills: job.skills,
        qualification: job.qualification,
        vacancy: job.vacancy,
        company: job.company,
        location: job.location || '',
        postedDate: job.created_at,
        applyLink: job.apply_link
      }));
      setJobs(transformedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get all unique skills for filter options
  const availableSkills = useMemo(() => {
    const skills = new Set<string>();
    jobs.forEach(job => job.skills.forEach(skill => skills.add(skill)));
    return Array.from(skills).sort();
  }, [jobs]);

  // Filter jobs based on search and filters
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search filter
      const matchesSearch = searchQuery === "" || job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) || job.company.toLowerCase().includes(searchQuery.toLowerCase());

      // Skills filter
      const matchesSkills = skillsFilter.length === 0 || skillsFilter.some(filterSkill => job.skills.includes(filterSkill));

      // Date filter
      let matchesDate = true;
      if (dateFilter !== null) {
        const jobDate = new Date(job.postedDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - jobDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        matchesDate = diffDays <= dateFilter;
      }
      return matchesSearch && matchesSkills && matchesDate;
    });
  }, [jobs, searchQuery, skillsFilter, dateFilter]);
  const handleJobSubmit = async (jobData: Omit<Job, "id" | "postedDate"> & {
    mathAnswer: number;
    mathA: number;
    mathB: number;
  }) => {
    try {
      const response = await supabase.functions.invoke('post-job', {
        body: {
          title: jobData.title,
          skills: jobData.skills,
          qualification: jobData.qualification,
          vacancy: jobData.vacancy,
          company: jobData.company,
          location: jobData.location || null,
          applyLink: jobData.applyLink,
          mathAnswer: jobData.mathAnswer,
          mathA: jobData.mathA,
          mathB: jobData.mathB,
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to post job');
      }

      const { data } = response;
      if (data.error) {
        throw new Error(data.error);
      }

      // Add new job to local state
      const newJob: Job = data.job;
      setJobs([newJob, ...jobs]);
      
      toast({
        title: "Success!",
        description: "Job posted successfully!"
      });
    } catch (error: any) {
      console.error('Error posting job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to post job. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-background grid-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Workly</h1>
              <p className="text-sm text-muted-foreground">Anonymous job board for CSE, AI, DS & BI</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-fit">
            <TabsTrigger value="browse" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Browse Jobs
            </TabsTrigger>
            <TabsTrigger value="post" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Post Job
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <SearchFilters onSearch={setSearchQuery} onFilterBySkills={setSkillsFilter} onFilterByDate={setDateFilter} availableSkills={availableSkills} />

            {/* Job Count */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
              </p>
            </div>

            {/* Jobs Grid */}
            {loading ? <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading jobs...</p>
              </div> : filteredJobs.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div> : <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || skillsFilter.length > 0 || dateFilter !== null ? "Try adjusting your search filters" : "Be the first to post a job!"}
                </p>
              </div>}
          </TabsContent>

          <TabsContent value="post">
            <JobPostForm onSubmit={handleJobSubmit} />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default Index;
export { Index };