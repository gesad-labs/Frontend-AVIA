import { createContext, useContext, useState, useCallback } from 'react';

const ProjectContext = createContext(null);

/**
 * ProjectProvider — stores the active project and exposes project-switching.
 * Feed it with data from your API (src/services/projectService.js).
 */
export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading]             = useState(false);

  const switchProject = useCallback((projectId) => {
    const found = projects.find((p) => p.id === projectId);
    if (found) setActiveProject(found);
  }, [projects]);

  const addProject = useCallback((project) => {
    setProjects((prev) => [...prev, project]);
  }, []);

  const updateProject = useCallback((updated) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (activeProject?.id === updated.id) setActiveProject(updated);
  }, [activeProject]);

  const removeProject = useCallback((projectId) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (activeProject?.id === projectId) setActiveProject(null);
  }, [activeProject]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        setProjects,
        activeProject,
        setActiveProject,
        switchProject,
        addProject,
        updateProject,
        removeProject,
        loading,
        setLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used inside <ProjectProvider>');
  return ctx;
}
