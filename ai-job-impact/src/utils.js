export function generateJobData() {
  const roles = [
    // Executive Level
    { role: 'CEO', impact: 85.2, description: 'Strategic decision-making and leadership' },
    { role: 'CFO', impact: 78.9, description: 'Financial planning and analysis' },
    { role: 'CTO', impact: 82.1, description: 'Technology strategy and innovation' },
    { role: 'COO', impact: 76.4, description: 'Operational efficiency and processes' },
    
    // Senior Management
    { role: 'VP Engineering', impact: 72.3, description: 'Technical leadership and architecture' },
    { role: 'VP Marketing', impact: 68.7, description: 'Marketing strategy and campaigns' },
    { role: 'VP Sales', impact: 65.4, description: 'Sales strategy and customer relations' },
    { role: 'VP HR', impact: 71.2, description: 'Human resources and talent management' },
    
    // Middle Management
    { role: 'Engineering Manager', impact: 58.9, description: 'Team leadership and project management' },
    { role: 'Product Manager', impact: 62.1, description: 'Product strategy and roadmap' },
    { role: 'Marketing Manager', impact: 55.7, description: 'Campaign management and analytics' },
    { role: 'Sales Manager', impact: 52.3, description: 'Sales team leadership' },
    
    // Technical Roles
    { role: 'Senior Software Engineer', impact: 45.6, description: 'Complex system development' },
    { role: 'Data Scientist', impact: 38.9, description: 'Data analysis and ML models' },
    { role: 'DevOps Engineer', impact: 42.1, description: 'Infrastructure and automation' },
    { role: 'UX Designer', impact: 35.7, description: 'User experience design' },
    { role: 'UI Designer', impact: 33.2, description: 'Visual design and interfaces' },
    
    // Mid-Level Roles
    { role: 'Software Engineer', impact: 28.4, description: 'Application development' },
    { role: 'QA Engineer', impact: 31.7, description: 'Quality assurance and testing' },
    { role: 'Business Analyst', impact: 25.9, description: 'Requirements analysis' },
    { role: 'Project Manager', impact: 29.3, description: 'Project coordination' },
    
    // Junior Roles
    { role: 'Junior Developer', impact: 18.7, description: 'Basic development tasks' },
    { role: 'Marketing Associate', impact: 22.1, description: 'Marketing support' },
    { role: 'Sales Representative', impact: 19.8, description: 'Customer outreach' },
    { role: 'HR Coordinator', impact: 21.4, description: 'HR administrative tasks' },
    
    // Entry Level
    { role: 'Intern', impact: 12.3, description: 'Learning and support tasks' },
    { role: 'Administrative Assistant', impact: 15.6, description: 'Office support' },
    { role: 'Customer Support', impact: 14.2, description: 'Customer service' },
    { role: 'Data Entry Clerk', impact: 8.9, description: 'Data processing' },
    
    // Support Roles
    { role: 'Receptionist', impact: 11.7, description: 'Front desk operations' },
    { role: 'Janitor', impact: 6.4, description: 'Facility maintenance' },
    { role: 'Security Guard', impact: 9.2, description: 'Security monitoring' },
    { role: 'Mail Clerk', impact: 7.8, description: 'Mail processing' }
  ];
  
  return roles.map(roleData => ({
    role: roleData.role,
    impact: roleData.impact,
    description: roleData.description
  }));
}
  