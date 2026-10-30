import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = 'http://localhost:8080/api';
const API_URL = `${API_BASE}/skills`;
const GOALS_URL = `${API_BASE}/goals`;
const STUDENTS_URL = `${API_BASE}/students`;

const roleData = {
  'Java Developer': {
    icon: '☕',
    skills: ['Java', 'SQL', 'Spring Boot', 'REST APIs', 'Git'],
  },
  'Frontend Developer': {
    icon: '◈',
    skills: ['HTML/CSS', 'JavaScript', 'React', 'Responsive Design', 'Git'],
  },
  'Data Analyst': {
    icon: '▥',
    skills: ['SQL', 'Excel', 'Python', 'Data Visualization', 'Statistics'],
  },
};

const initialSkills = [
  { name: 'Java', level: 'Intermediate', category: 'Technical' },
  { name: 'SQL', level: 'Intermediate', category: 'Technical' },
  { name: 'Spring Boot', level: 'Beginner', category: 'Technical' },
  { name: 'React', level: 'Beginner', category: 'Technical' },
  { name: 'Git', level: 'Beginner', category: 'Tools' },
];

const initialGoals = [
  { name: 'Revise Java collections', skill: 'Java', time: '3–5 hours', done: true },
  { name: 'Practice SQL joins', skill: 'SQL', time: '1–2 hours', done: true },
  { name: 'Build a REST API', skill: 'Spring Boot', time: '1 week', done: false },
  { name: 'Create a React mini app', skill: 'React', time: '1 week', done: false },
  { name: 'Practice Git workflows', skill: 'Git', time: '1–2 hours', done: false },
];

const levels = { Beginner: 1, Intermediate: 2, Advanced: 3 };

const navItems = [
  { id: 'overview', icon: '▦', label: 'Overview' },
  { id: 'skills', icon: '⌘', label: 'My Skills' },
  { id: 'roles', icon: '▤', label: 'Career Paths' },
  { id: 'learning', icon: '◷', label: 'Learning Plan' },
  { id: 'profile', icon: '◎', label: 'My Profile' },
];

const pageInfo = {
  overview: [
    'Your placement journey',
    'A clearer picture of your strengths, gaps, and next steps.',
  ],
  skills: [
    'Build your skill profile',
    'Keep your current skills and proficiency levels up to date.',
  ],
  roles: [
    'Explore career paths',
    'Compare your current profile with common entry-level role requirements.',
  ],
  learning: [
    'Your learning plan',
    'Turn skill gaps into achievable learning goals.',
  ],
  profile: [
    'Your profile',
    'Manage the details used in your preparation dashboard.',
  ],
};

function getSkillLevel(skills, name) {
  return skills.find(
    (skill) => skill.name.toLowerCase() === name.toLowerCase()
  );
}

function getMatch(skills, role) {
  const required = roleData[role].skills;

  const matched = required.filter((name) => {
    const skill = getSkillLevel(skills, name);
    return skill && levels[skill.level] >= levels.Intermediate;
  });

  return Math.round((matched.length / required.length) * 100);
}

function getSkillStatus(skills, name) {
  const skill = getSkillLevel(skills, name);

  if (!skill) {
    return { status: 'Missing', className: 'missing', progress: 0 };
  }

  if (levels[skill.level] >= levels.Intermediate) {
    return {
      status: 'On target',
      className: 'good',
      progress: skill.level === 'Advanced' ? 100 : 75,
    };
  }

  return { status: 'Needs work', className: 'warn', progress: 35 };
}

function PanelHeading({ title, description, action }) {
  return (
    <div className="panel-head">
      <div>
        <h2>{title}</h2>
        {description && <p className="panel-desc">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, icon, foot, positive }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        {label}
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-number">{value}</div>
      <div className="stat-foot">
        {positive && <span className="good">{positive} </span>}
        {foot}
      </div>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [targetRole, setTargetRole] = useState('Java Developer');
  const [skills, setSkills] = useState(initialSkills);
  const [goals, setGoals] = useState(initialGoals);
  const [toast, setToast] = useState('');
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsError, setSkillsError] = useState('');
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [profileId, setProfileId] = useState(null);

  const [profile, setProfile] = useState({
    name: 'Pratik Student',
    course: 'Computer Science',
    year: '4th year',
    interest: 'Java Developer',
  });

  const [skillForm, setSkillForm] = useState({
    name: '',
    level: 'Beginner',
    category: 'Technical',
  });

  const [goalForm, setGoalForm] = useState({
    name: '',
    skill: '',
    time: '1–2 hours',
  });

  function notify(message) {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(''), 2600);
  }

  // Load saved skills from Spring Boot when the app starts.
  useEffect(() => {
    let cancelled = false;

    async function loadSkills() {
      try {
        setSkillsLoading(true);
        setSkillsError('');

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Failed to load skills (${response.status})`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('The skills API returned an invalid response.');
        }

        if (!cancelled) {
          setSkills(data);
        }
      } catch (error) {
        console.error('Error loading skills:', error);

        if (!cancelled) {
          setSkillsError('Could not load skills from the server.');
          notify('Could not connect to the skills API.');
        }
      } finally {
        if (!cancelled) {
          setSkillsLoading(false);
        }
      }
    }

    loadSkills();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load learning goals saved in Spring Boot.
  useEffect(() => {
    let cancelled = false;

    async function loadGoals() {
      try {
        const response = await fetch(GOALS_URL);
        if (!response.ok) throw new Error(`Failed to load goals (${response.status})`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid learning goals response.');

        if (!cancelled) {
          setGoals(data.map((goal) => ({
            ...goal,
            time: goal.estimatedTime ?? goal.time ?? '1–2 hours',
            done: Boolean(goal.done),
          })));
        }
      } catch (error) {
        console.error('Error loading learning goals:', error);
        if (!cancelled) notify('Could not load learning goals from the server.');
      } finally {
        if (!cancelled) setGoalsLoading(false);
      }
    }

    loadGoals();
    return () => { cancelled = true; };
  }, []);

  // Load the first saved student profile.
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch(STUDENTS_URL);
        if (!response.ok) throw new Error(`Failed to load profile (${response.status})`);
        const students = await response.json();
        if (!Array.isArray(students)) throw new Error('Invalid student response.');

        if (!cancelled && students.length) {
          const student = students[0];
          setProfileId(student.id);
          setProfile({
            name: student.name ?? '',
            course: student.course ?? '',
            year: student.year ?? '4th year',
            interest: roleData[student.targetCareer] ? student.targetCareer : 'Java Developer',
          });
          setTargetRole(roleData[student.targetCareer] ? student.targetCareer : 'Java Developer');
        }
      } catch (error) {
        console.error('Error loading student profile:', error);
        if (!cancelled) notify('Could not load profile from the server.');
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, []);

  const role = roleData[targetRole];

  const match = useMemo(
    () => getMatch(skills, targetRole),
    [skills, targetRole]
  );

  const gaps = role.skills.filter(
    (name) => getSkillStatus(skills, name).className !== 'good'
  );

  const completedGoals = goals.filter((goal) => goal.done).length;

  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  function navigate(page) {
    setActivePage(page);
    window.history.replaceState(null, '', `#page-${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function changeRole(nextRole) {
    setTargetRole(nextRole);
    setProfile((current) => ({ ...current, interest: nextRole }));
  }

  // Add a skill to the database.
  async function addSkill(event) {
    event.preventDefault();

    const name = skillForm.name.trim();

    if (!name) return;

    if (getSkillLevel(skills, name)) {
      notify('That skill is already in your profile.');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...skillForm,
          name,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save skill (${response.status})`);
      }

      const savedSkill = await response.json();

      setSkills((current) => [...current, savedSkill]);
      setSkillForm({
        name: '',
        level: 'Beginner',
        category: 'Technical',
      });
      setShowSkillForm(false);
      setSkillsError('');
      notify('Skill added successfully.');
    } catch (error) {
      console.error('Error adding skill:', error);
      notify('Could not save skill to the server.');
    }
  }

  // Update the skill level in the database.
  async function updateSkill(id, level) {
    const skill = skills.find((item) => item.id === id);

    if (!skill) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...skill,
          level,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update skill (${response.status})`);
      }

      const updatedSkill = await response.json();

      setSkills((current) =>
        current.map((item) => (item.id === id ? updatedSkill : item))
      );

      notify('Skill level updated.');
    } catch (error) {
      console.error('Error updating skill:', error);
      notify('Could not update skill on the server.');
    }
  }

  // Remove a skill from the database.
  async function removeSkill(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to remove skill (${response.status})`);
      }

      setSkills((current) => current.filter((skill) => skill.id !== id));
      notify('Skill removed from your profile.');
    } catch (error) {
      console.error('Error removing skill:', error);
      notify('Could not remove skill from the server.');
    }
  }

  // Save a learning goal in the database.
  async function addGoal(event) {
    event.preventDefault();

    if (!goalForm.name.trim() || !goalForm.skill.trim()) return;

    try {
      const response = await fetch(GOALS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: goalForm.name.trim(),
          skill: goalForm.skill.trim(),
          estimatedTime: goalForm.time,
          done: false,
        }),
      });
      if (!response.ok) throw new Error(`Failed to save goal (${response.status})`);
      const savedGoal = await response.json();

      setGoals((current) => [...current, {
        ...savedGoal,
        time: savedGoal.estimatedTime ?? goalForm.time,
        done: Boolean(savedGoal.done),
      }]);
      setGoalForm({ name: '', skill: '', time: '1–2 hours' });
      setShowGoalForm(false);
      notify('Learning goal saved.');
    } catch (error) {
      console.error('Error adding learning goal:', error);
      notify('Could not save learning goal to the server.');
    }
  }

  async function toggleGoal(index) {
    const goal = goals[index];
    if (!goal?.id) {
      notify('This goal has no server ID. Refresh the page and try again.');
      return;
    }

    const updated = { ...goal, done: !goal.done };
    try {
      const response = await fetch(`${GOALS_URL}/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updated.name,
          skill: updated.skill,
          estimatedTime: updated.time,
          done: updated.done,
        }),
      });
      if (!response.ok) throw new Error(`Failed to update goal (${response.status})`);
      const savedGoal = await response.json();

      setGoals((current) => current.map((item) => item.id === goal.id
        ? { ...savedGoal, time: savedGoal.estimatedTime ?? updated.time, done: Boolean(savedGoal.done) }
        : item));
      notify(updated.done ? 'Goal marked completed.' : 'Goal moved back to in progress.');
    } catch (error) {
      console.error('Error updating learning goal:', error);
      notify('Could not update learning goal on the server.');
    }
  }

  async function removeGoal(id) {
    try {
      const response = await fetch(`${GOALS_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Failed to delete goal (${response.status})`);
      setGoals((current) => current.filter((goal) => goal.id !== id));
      notify('Learning goal deleted.');
    } catch (error) {
      console.error('Error deleting learning goal:', error);
      notify('Could not delete learning goal from the server.');
    }
  }

  async function saveProfile(event) {
    event.preventDefault();

    const payload = {
      name: profile.name.trim(),
      course: profile.course.trim(),
      year: profile.year,
      targetCareer: profile.interest,
    };

    try {
      const response = await fetch(profileId ? `${STUDENTS_URL}/${profileId}` : STUDENTS_URL, {
        method: profileId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Failed to save profile (${response.status})`);
      const saved = await response.json();
      setProfileId(saved.id);
      setTargetRole(roleData[saved.targetCareer] ? saved.targetCareer : profile.interest);
      notify('Profile saved to the server.');
    } catch (error) {
      console.error('Error saving profile:', error);
      notify('Could not save profile to the server.');
    }
  }

  function exportSummary() {
    const rows = [
      ['PathPilot — Placement Preparation & Skill Gap Summary'],
      [`Target role,${targetRole}`],
      [`Skill match,${getMatch(skills, targetRole)}%`],
      [],
      ['Required skill', 'Your level', 'Required level', 'Status'],
      ...roleData[targetRole].skills.map((name) => {
        const skill = getSkillLevel(skills, name);
        const status = getSkillStatus(skills, name);

        return [
          name,
          skill?.level || 'Not added',
          'Intermediate',
          status.status,
        ];
      }),
      [],
      ['Learning goal', 'Skill', 'Estimated time', 'Status'],
      ...goals.map((goal) => [
        goal.name,
        goal.skill,
        goal.time,
        goal.done ? 'Completed' : 'In progress',
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    );

    const link = document.createElement('a');
    link.href = url;
    link.download = 'placement-skill-gap-summary.csv';
    link.click();

    URL.revokeObjectURL(url);
    notify('Placement summary exported.');
  }

  function renderRoleCard(name) {
    const data = roleData[name];
    const percentage = getMatch(skills, name);

    return (
      <button
        type="button"
        className={`role-card ${targetRole === name ? 'selected' : ''}`}
        key={name}
        onClick={() => {
          changeRole(name);
          notify(`Target role updated: ${name}`);
        }}
      >
        <span className="role-logo">{data.icon}</span>
        <span className="role-info">
          <strong>{name}</strong>
          <small>{data.skills.length} core skills</small>
        </span>
        <span className="role-percent">{percentage}%</span>
      </button>
    );
  }

  function renderSkillRows() {
    return role.skills.map((name) => {
      const status = getSkillStatus(skills, name);
      const existing = getSkillLevel(skills, name);

      return (
        <div className="skill-row" key={name}>
          <div>
            <div className="skill-name">{name}</div>
            <div className="skill-level">
              {existing ? `Your level: ${existing.level}` : 'Not added yet'}
            </div>
          </div>

          <div className="progress">
            <span
              className={status.className}
              style={{ width: `${status.progress}%` }}
            />
          </div>

          <div className={`status ${status.className}`}>
            {status.status}
          </div>
        </div>
      );
    });
  }

  function renderActivityTable() {
    return goals.slice(0, 4).map((goal, index) => (
      <tr key={`${goal.name}-${index}`}>
        <td>{goal.name}</td>
        <td>{goal.skill}</td>
        <td>
          <span className={`tag ${goal.done ? '' : 'pending'}`}>
            {goal.done ? 'Completed' : 'In progress'}
          </span>
        </td>
      </tr>
    ));
  }

  return (
    <div className="pathpilot">
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">P</div>
            <span>PathPilot</span>
          </div>

          <div className="workspace">
            <div className="nav-label">Workspace</div>
            <nav className="side-nav">
              {navItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={activePage === item.id ? 'active' : ''}
                  onClick={() => navigate(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="sidebar-bottom">
            <strong>Small steps, big progress.</strong>
            <p>
              Build your skills one learning goal at a time and get ready for
              your next opportunity.
            </p>
            <button
              type="button"
              className="btn full-width"
              onClick={() => navigate('learning')}
            >
              View learning plan →
            </button>
          </div>
        </aside>

        <main className="main-content">
          <header className="topbar">
            <div>
              <div className="eyebrow">Student workspace / 2026</div>
              <h1>{pageInfo[activePage][0]}</h1>
              <p className="subtitle">{pageInfo[activePage][1]}</p>
            </div>

            <div className="header-actions">
              <button type="button" className="btn" onClick={exportSummary}>
                Export summary ↗
              </button>
              <div className="user-chip">
                <div className="avatar">{initials || 'ST'}</div>
                <div>
                  <strong>{profile.name}</strong>
                  <span>Student account</span>
                </div>
              </div>
            </div>
          </header>

          {activePage === 'overview' && (
            <section>
              <div className="stats-grid">
                <StatCard
                  label="Skill match"
                  value={`${match}%`}
                  icon="◉"
                  positive="↑"
                  foot="for your selected role"
                />
                <StatCard
                  label="Skills assessed"
                  value={skills.length}
                  icon="⌘"
                  foot="Across your skill profile"
                />
                <StatCard
                  label="Skills to improve"
                  value={gaps.length}
                  icon="↗"
                  foot="Based on your target role"
                />
                <StatCard
                  label="Learning goals done"
                  value={`${completedGoals}/${goals.length}`}
                  icon="✓"
                  foot="Keep your momentum going"
                />
              </div>

              <div className="content-grid">
                <div>
                  <div className="panel">
                    <PanelHeading
                      title="Your skill gap analysis"
                      description="Compare your current level with your target role."
                      action={
                        <select
                          className="role-select"
                          value={targetRole}
                          onChange={(event) => changeRole(event.target.value)}
                          aria-label="Select target role"
                        >
                          {Object.keys(roleData).map((name) => (
                            <option key={name}>{name}</option>
                          ))}
                        </select>
                      }
                    />

                    <div className="match-summary">
                      <div
                        className="match-ring"
                        style={{ '--pct': `${match}%` }}
                      >
                        <div className="ring-inner">
                          <strong>{match}%</strong>
                          <span>SKILL MATCH</span>
                        </div>
                      </div>

                      <div className="match-copy">
                        <strong>
                          {match >= 80
                            ? "You're close to your target role."
                            : match >= 50
                              ? "You're building a solid foundation."
                              : 'Start with the core skills for this role.'}
                        </strong>
                        <p>
                          You meet the target level for{' '}
                          {role.skills.length - gaps.length} of{' '}
                          {role.skills.length} required skills. Focus on the
                          highlighted gaps to strengthen your profile.
                        </p>
                      </div>
                    </div>

                    <div className="skill-list">{renderSkillRows()}</div>
                  </div>

                  <div className="panel">
                    <PanelHeading
                      title="Learning activity"
                      description="A quick look at your current preparation goals."
                      action={
                        <button
                          type="button"
                          className="btn"
                          onClick={() => navigate('learning')}
                        >
                          See all
                        </button>
                      }
                    />

                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>LEARNING GOAL</th>
                            <th>FOCUS SKILL</th>
                            <th>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>{renderActivityTable()}</tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="panel">
                    <PanelHeading
                      title="Explore career paths"
                      description="Choose a role to compare required skills."
                      action={<span className="pill">3 paths</span>}
                    />
                    {Object.keys(roleData).map(renderRoleCard)}
                  </div>

                  <div className="panel">
                    <PanelHeading
                      title="Recommended next steps"
                      description="Based on the gaps in your selected role."
                    />

                    {gaps.length ? (
                      gaps.slice(0, 3).map((name) => (
                        <div className="recommendation" key={name}>
                          <div className="rec-icon">↗</div>
                          <div className="rec-body">
                            <strong>{name} fundamentals</strong>
                            <p>
                              Build confidence through a short lesson and a
                              hands-on exercise.
                            </p>
                            <div className="rec-meta">
                              <span>Suggested next step</span>
                              <b>{name}</b>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty">
                        Great progress! No skill gaps for this role based on
                        your current profile.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activePage === 'skills' && (
            <section>
              <div className="panel">
                <PanelHeading
                  title="My skill profile"
                  description="Update your current level. Your analysis recalculates automatically."
                  action={
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() => setShowSkillForm((value) => !value)}
                    >
                      + Add skill
                    </button>
                  }
                />

                {skillsLoading && (
                  <p className="notice">Loading skills from the server...</p>
                )}

                {skillsError && (
                  <div className="notice" role="alert">
                    {skillsError} Check that Spring Boot is running on port
                    8080, then refresh the page.
                    <button
                      type="button"
                      className="btn"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!skillsLoading && !skillsError && skills.length === 0 && (
                  <div className="empty">
                    No skills have been saved yet. Select “Add skill” to get
                    started.
                  </div>
                )}

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>SKILL</th>
                        <th>CATEGORY</th>
                        <th>YOUR LEVEL</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>

                    <tbody>
                      {skills.map((skill) => (
                        <tr key={skill.id}>
                          <td>
                            <strong>{skill.name}</strong>
                          </td>
                          <td>{skill.category}</td>
                          <td>
                            <select
                              className="role-select"
                              value={skill.level}
                              disabled={skillsLoading || !skill.id}
                              onChange={(event) =>
                                updateSkill(skill.id, event.target.value)
                              }
                              aria-label={`Level for ${skill.name}`}
                            >
                              {Object.keys(levels).map((level) => (
                                <option key={level}>{level}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn"
                              disabled={skillsLoading || !skill.id}
                              onClick={() => removeSkill(skill.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="notice">
                  Tip: Choose levels honestly. This tool is a preparation
                  guide, not a guarantee of placement or a formal assessment.
                </div>
              </div>

              {showSkillForm && (
                <div className="panel">
                  <PanelHeading
                    title="Add a skill"
                    description="Add a skill to your profile."
                  />

                  <form className="form-grid" onSubmit={addSkill}>
                    <div className="field">
                      <label htmlFor="skillName">Skill name</label>
                      <input
                        id="skillName"
                        required
                        placeholder="e.g. Spring Boot"
                        value={skillForm.name}
                        onChange={(event) =>
                          setSkillForm({
                            ...skillForm,
                            name: event.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="skillLevel">Current level</label>
                      <select
                        id="skillLevel"
                        value={skillForm.level}
                        onChange={(event) =>
                          setSkillForm({
                            ...skillForm,
                            level: event.target.value,
                          })
                        }
                      >
                        {Object.keys(levels).map((level) => (
                          <option key={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="skillCategory">Category</label>
                      <select
                        id="skillCategory"
                        value={skillForm.category}
                        onChange={(event) =>
                          setSkillForm({
                            ...skillForm,
                            category: event.target.value,
                          })
                        }
                      >
                        <option>Technical</option>
                        <option>Professional</option>
                        <option>Tools</option>
                      </select>
                    </div>

                    <div className="field field-end">
                      <button
                        className="btn primary"
                        type="submit"
                        disabled={skillsLoading}
                      >
                        Save skill
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </section>
          )}

          {activePage === 'roles' && (
            <section className="panel">
              <PanelHeading
                title="Career paths"
                description="Select a target role to view its skill requirements and your match."
              />

              <div className="career-grid">
                {Object.entries(roleData).map(([name, data]) => (
                  <div className="career-detail" key={name}>
                    <div className="career-title">
                      <span className="role-logo">{data.icon}</span>
                      <div>
                        <h3>{name}</h3>
                        <p className="panel-desc">Entry-level skill profile</p>
                      </div>
                    </div>

                    <div className="career-match">
                      <span>Current skill match</span>
                      <strong>{getMatch(skills, name)}%</strong>
                    </div>

                    <div className="progress">
                      <span
                        style={{ width: `${getMatch(skills, name)}%` }}
                      />
                    </div>

                    <h4>Core skills</h4>

                    {data.skills.map((skillName) => {
                      const status = getSkillStatus(skills, skillName);

                      return (
                        <div className="career-skill" key={skillName}>
                          <span>{skillName}</span>
                          <span className={`status ${status.className}`}>
                            {status.status}
                          </span>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      className={`btn ${
                        targetRole === name ? 'primary' : ''
                      } full-width`}
                      onClick={() => {
                        changeRole(name);
                        navigate('overview');
                        notify(`Target role updated: ${name}`);
                      }}
                    >
                      {targetRole === name
                        ? 'Current target role'
                        : 'Set as target role'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activePage === 'learning' && (
            <section>
              <div className="panel">
                <PanelHeading
                  title="Your learning plan"
                  description="Track small, achievable steps toward your target role."
                  action={
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() => setShowGoalForm((value) => !value)}
                    >
                      + Add goal
                    </button>
                  }
                />

                <div className="learning-summary">
                  <div>
                    <span>Goals completed</span>
                    <strong>
                      {completedGoals} of {goals.length}
                    </strong>
                  </div>

                  <div className="progress">
                    <span
                      style={{
                        width: `${
                          goals.length
                            ? (completedGoals / goals.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {goalsLoading && <p className="notice">Loading learning goals from the server...</p>}

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>LEARNING GOAL</th>
                        <th>SKILL</th>
                        <th>EST. TIME</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>

                    <tbody>
                      {goals.map((goal, index) => (
                        <tr key={`${goal.name}-${index}`}>
                          <td>
                            <strong>{goal.name}</strong>
                          </td>
                          <td>{goal.skill}</td>
                          <td>{goal.time}</td>
                          <td>
                            <span
                              className={`tag ${goal.done ? '' : 'pending'}`}
                            >
                              {goal.done ? 'Completed' : 'In progress'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn"
                              onClick={() => toggleGoal(index)}
                            >
                              {goal.done ? 'Undo' : 'Complete'}
                            </button>
                            <button
                              type="button"
                              className="btn"
                              style={{ marginLeft: 6 }}
                              disabled={!goal.id || goalsLoading}
                              onClick={() => removeGoal(goal.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {showGoalForm && (
                <div className="panel">
                  <PanelHeading
                    title="Add a learning goal"
                    description="Keep goals specific and manageable."
                  />

                  <form className="form-grid" onSubmit={addGoal}>
                    <div className="field">
                      <label htmlFor="goalName">Goal</label>
                      <input
                        id="goalName"
                        required
                        placeholder="e.g. Build a REST API"
                        value={goalForm.name}
                        onChange={(event) =>
                          setGoalForm({
                            ...goalForm,
                            name: event.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="goalSkill">Skill</label>
                      <input
                        id="goalSkill"
                        required
                        placeholder="e.g. Spring Boot"
                        value={goalForm.skill}
                        onChange={(event) =>
                          setGoalForm({
                            ...goalForm,
                            skill: event.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="goalTime">Estimated time</label>
                      <select
                        id="goalTime"
                        value={goalForm.time}
                        onChange={(event) =>
                          setGoalForm({
                            ...goalForm,
                            time: event.target.value,
                          })
                        }
                      >
                        <option>1–2 hours</option>
                        <option>3–5 hours</option>
                        <option>1 week</option>
                        <option>2 weeks</option>
                      </select>
                    </div>

                    <div className="field field-end">
                      <button className="btn primary" type="submit">
                        Add goal
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </section>
          )}

          {activePage === 'profile' && (
            <section className="panel profile-panel">
              <PanelHeading
                title="Student profile"
                description="Keep your academic and career details up to date."
              />

              <form className="form-grid" onSubmit={saveProfile}>
                <div className="field">
                  <label htmlFor="profileName">Full name</label>
                  <input
                    id="profileName"
                    required
                    value={profile.name}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        name: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="profileCourse">Course / degree</label>
                  <input
                    id="profileCourse"
                    required
                    value={profile.course}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        course: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="profileYear">Study year</label>
                  <select
                    id="profileYear"
                    value={profile.year}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        year: event.target.value,
                      })
                    }
                  >
                    {['1st year', '2nd year', '3rd year', '4th year'].map(
                      (year) => (
                        <option key={year}>{year}</option>
                      )
                    )}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="profileInterest">Target career</label>
                  <select
                    id="profileInterest"
                    value={profile.interest}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        interest: event.target.value,
                      })
                    }
                  >
                    {Object.keys(roleData).map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                </div>

                <div className="field field-full">
                  <button className="btn primary" type="submit">
                    Save profile
                  </button>
                </div>
              </form>

              <div className="notice">
                Your skills, learning goals, and student profile are connected
                to Spring Boot and saved in the database.
              </div>
            </section>
          )}
        </main>
      </div>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}