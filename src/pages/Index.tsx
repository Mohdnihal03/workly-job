import { useState, useMemo } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { JobCard, Job } from "@/components/JobCard";
import { JobPostForm } from "@/components/JobPostForm";
import { SearchFilters } from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Briefcase } from "lucide-react";

// Sample jobs data for demonstration
const sampleJobs: Job[] = [
  {
    id: "1",
    title: "Frontend Developer",
    skills: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
    qualification: "B.Tech/B.E. in Computer Science",
    vacancy: 2,
    company: "TechCorp Solutions",
    location: "Bangalore, India",
    postedDate: new Date().toISOString(),
    applyLink: "https://example.com/apply/frontend"
  },
  {
    id: "2",
    title: "Data Scientist",
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
    qualification: "M.Sc. in Data Science or equivalent",
    vacancy: 1,
    company: "DataInsights Inc",
    location: "Remote",
    postedDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    applyLink: "https://example.com/apply/data-scientist"
  },
  {
    id: "3",
    title: "Full Stack Developer",
    skills: ["Node.js", "React", "MongoDB", "Express.js", "AWS"],
    qualification: "B.Tech/M.Tech in CSE",
    vacancy: 3,
    company: "StartupXYZ",
    postedDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    applyLink: "https://example.com/apply/fullstack"
  }
];

const Index = () => {
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<number | null>(null);

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
      const matchesSearch = searchQuery === "" || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase());

      // Skills filter
      const matchesSkills = skillsFilter.length === 0 ||
        skillsFilter.some(filterSkill => job.skills.includes(filterSkill));

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

  const handleJobSubmit = (jobData: Omit<Job, "id" | "postedDate">) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      postedDate: new Date().toISOString(),
    };
    setJobs([newJob, ...jobs]);
  };

  return (
    <div className="min-h-screen bg-background grid-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AnonJobs</h1>
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
            <SearchFilters
              onSearch={setSearchQuery}
              onFilterBySkills={setSkillsFilter}
              onFilterByDate={setDateFilter}
              availableSkills={availableSkills}
            />

            {/* Job Count */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
              </p>
            </div>

            {/* Jobs Grid */}
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || skillsFilter.length > 0 || dateFilter !== null
                    ? "Try adjusting your search filters"
                    : "Be the first to post a job!"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="post">
            <JobPostForm onSubmit={handleJobSubmit} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
