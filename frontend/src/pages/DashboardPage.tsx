import axios from 'axios';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { TOKEN_KEY } from '../api/client';
import type { Project, ProjectStatus, Task, TaskPriority, TaskStatus, User } from '../types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [error, setError] = useState('');

  const selectedProject = projects.find((project) => project.id === selectedId) ?? null;

  const loadData = useCallback(async () => {
    try {
      const [userResponse, projectsResponse] = await Promise.all([
        api.get<User>('/user'),
        api.get<Project[]>('/projects'),
      ]);
      const loadedProjects = projectsResponse.data.map((project) => ({ ...project, tasks: project.tasks ?? [] }));
      setUser(userResponse.data);
      setProjects(loadedProjects);
      setSelectedId(loadedProjects[0]?.id ?? null);
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        navigate('/login');
      } else {
        setError('Could not load data.');
      }
    }
  }, [navigate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function createProject(event: FormEvent) {
    event.preventDefault();
    const { data } = await api.post<Project>('/projects', { name: projectName, status: 'active' });
    const project = { ...data, tasks: [] };
    setProjects((current) => [project, ...current]);
    setSelectedId(project.id);
    setProjectName('');
  }

  async function updateProjectStatus(status: ProjectStatus) {
    if (!selectedProject) return;
    const { data } = await api.patch<Project>(`/projects/${selectedProject.id}`, { status });
    setProjects((current) => current.map((project) => project.id === data.id ? { ...project, ...data } : project));
  }

  async function deleteProject() {
    if (!selectedProject) return;
    await api.delete(`/projects/${selectedProject.id}`);
    setProjects((current) => current.filter((project) => project.id !== selectedProject.id));
    setSelectedId(null);
  }

  async function createTask(event: FormEvent) {
    event.preventDefault();
    if (!selectedProject) return;
    const { data } = await api.post<Task>(`/projects/${selectedProject.id}/tasks`, {
      title: taskTitle,
      priority: taskPriority,
      status: 'pending',
    });
    setProjects((current) => current.map((project) =>
      project.id === selectedProject.id ? { ...project, tasks: [data, ...project.tasks] } : project,
    ));
    setTaskTitle('');
  }

  async function updateTask(task: Task, status: TaskStatus) {
    const { data } = await api.patch<Task>(`/tasks/${task.id}`, { status });
    setProjects((current) => current.map((project) => ({
      ...project,
      tasks: project.tasks.map((item) => item.id === data.id ? data : item),
    })));
  }

  async function deleteTask(task: Task) {
    await api.delete(`/tasks/${task.id}`);
    setProjects((current) => current.map((project) => ({
      ...project,
      tasks: project.tasks.filter((item) => item.id !== task.id),
    })));
  }

  async function logout() {
    try { await api.post('/logout'); } finally {
      localStorage.removeItem(TOKEN_KEY);
      navigate('/login');
    }
  }

  return (
    <main className="container">
      <header>
        <div><h1>Apollo Energy</h1><p>Welcome, {user?.name}</p></div>
        <button className="secondary" onClick={logout}>Logout</button>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="columns">
        <section className="card">
          <h2>Projects</h2>
          <form className="row-form" onSubmit={createProject}>
            <input placeholder="Project name" value={projectName} onChange={(event) => setProjectName(event.target.value)} required />
            <button>Add</button>
          </form>
          <div className="list">
            {projects.map((project) => (
              <button key={project.id} className={`list-button ${selectedId === project.id ? 'active' : ''}`} onClick={() => setSelectedId(project.id)}>
                {project.name} <small>{project.status}</small>
              </button>
            ))}
            {!projects.length && <p>No projects yet.</p>}
          </div>
        </section>

        <section className="card">
          {selectedProject ? (
            <>
              <div className="section-title">
                <h2>{selectedProject.name}</h2>
                <div>
                  <select value={selectedProject.status} onChange={(event) => void updateProjectStatus(event.target.value as ProjectStatus)}>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button className="danger" onClick={() => void deleteProject()}>Delete project</button>
                </div>
              </div>

              <h3>Tasks</h3>
              <form className="row-form" onSubmit={createTask}>
                <input placeholder="Task title" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} required />
                <select value={taskPriority} onChange={(event) => setTaskPriority(event.target.value as TaskPriority)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button>Add task</button>
              </form>

              <div className="list">
                {selectedProject.tasks.map((task) => (
                  <div className="task-row" key={task.id}>
                    <span><strong>{task.title}</strong><small>{task.priority}</small></span>
                    <select value={task.status} onChange={(event) => void updateTask(task, event.target.value as TaskStatus)}>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button className="danger" onClick={() => void deleteTask(task)}>Delete</button>
                  </div>
                ))}
                {!selectedProject.tasks.length && <p>No tasks yet.</p>}
              </div>
            </>
          ) : <p>Select or create a project.</p>}
        </section>
      </div>
    </main>
  );
}
