import { ExternalLink, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Job {
  id: string;
  title: string;
  skills: string[];
  qualification: string;
  vacancy: number;
  company: string;
  location?: string;
  postedDate: string;
  applyLink: string;
}

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const handleApply = () => {
    window.open(job.applyLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="job-card fade-in">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(job.postedDate)}
            </div>
          </div>
          
          <p className="text-foreground font-medium mb-2">{job.company}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            {job.location && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {job.location}
              </div>
            )}
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {job.vacancy} {job.vacancy === 1 ? "position" : "positions"}
            </div>
          </div>

          {/* Skills */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span key={index} className="job-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Qualification */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Qualification:</span> {job.qualification}
            </p>
          </div>
        </div>

        {/* Apply Button */}
        <Button
          onClick={handleApply}
          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
        >
          Apply Now
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}