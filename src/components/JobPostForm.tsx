import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, X } from "lucide-react";
import { Job } from "./JobCard";
import { useToast } from "@/components/ui/use-toast";

interface JobPostFormProps {
  onSubmit: (job: Omit<Job, "id" | "postedDate">) => void;
}

export function JobPostForm({ onSubmit }: JobPostFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    skills: [] as string[],
    qualification: "",
    vacancy: 1,
    company: "",
    location: "",
    applyLink: "",
  });
  
  const [currentSkill, setCurrentSkill] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedSkills = Array.from(
      new Set([
        ...formData.skills.map((s) => s.trim()).filter(Boolean),
        currentSkill.trim(),
      ].filter(Boolean))
    );

    const isValid =
      formData.title.trim() &&
      formData.qualification.trim() &&
      formData.company.trim() &&
      formData.applyLink.trim() &&
      normalizedSkills.length > 0;

    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please fill all required fields and add at least one skill.",
      });
      return;
    }

    onSubmit({
      ...formData,
      skills: normalizedSkills,
      location: formData.location || undefined,
    });

    // Reset form
    setFormData({
      title: "",
      skills: [],
      qualification: "",
      vacancy: 1,
      company: "",
      location: "",
      applyLink: "",
    });
    setCurrentSkill("");
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill.trim()],
      });
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Post a Job Anonymously</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div className="md:col-span-2">
              <Label htmlFor="title" className="text-foreground">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Frontend Developer, Data Scientist"
                required
                className="mt-1"
              />
            </div>

            {/* Company */}
            <div>
              <Label htmlFor="company" className="text-foreground">Company Name *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g., TechCorp Solutions"
                required
                className="mt-1"
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-foreground">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Remote, Bangalore, India"
                className="mt-1"
              />
            </div>

            {/* Qualification */}
            <div>
              <Label htmlFor="qualification" className="text-foreground">Qualification *</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g., B.Tech/B.E., M.Sc. Computer Science"
                required
                className="mt-1"
              />
            </div>

            {/* Vacancy Count */}
            <div>
              <Label htmlFor="vacancy" className="text-foreground">Number of Positions *</Label>
              <Input
                id="vacancy"
                type="number"
                min="1"
                value={formData.vacancy}
                onChange={(e) => setFormData({ ...formData, vacancy: parseInt(e.target.value) || 1 })}
                required
                className="mt-1"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label className="text-foreground">Key Skills Required *</Label>
            <div className="mt-1 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Add a skill and press Enter"
                  className="flex-1"
                />
                <Button type="button" onClick={addSkill} variant="outline" size="icon">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="job-tag flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Apply Link */}
          <div>
            <Label htmlFor="applyLink" className="text-foreground">Application Link *</Label>
            <Input
              id="applyLink"
              type="url"
              value={formData.applyLink}
              onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
              placeholder="https://company.com/careers/apply"
              required
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            Post Job Anonymously
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}