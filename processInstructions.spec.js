import { processInstructions } from './processInstructions.js'
import fs from 'fs/promises'

describe('processInstructions', () => {
  it('should extract the correct actions from the file contents', async () => {
    const fileContents = await fs.readFile(
      'test-files/instructions.md',
      'utf-8'
    )

    const expectedActions = [
      {
        type: 'information',
        information:
          "GitHub Copilot: Sure, here's an example implementation of the web app using Next.js and AWS Amplify:",
      },
      {
        type: 'instruction',
        instruction: '1. Set up an AWS account and create a new Amplify app.',
      },
      {
        type: 'runCommand',
        instruction:
          '2. Install the Amplify CLI and initialize the app with `amplify init`.',
        command: 'amplify init',
      },
      {
        type: 'runCommand',
        instruction:
          '3. Add authentication to the app with `amplify add auth`.',
        command: 'amplify add auth',
      },
      {
        type: 'runCommand',
        instruction: '4. Add a job posting API with `amplify add api`.',
        command: 'amplify add api',
      },
      {
        type: 'instructionToWriteCodeInAFile',
        instruction: `5. Define the job posting schema in \`amplify/backend/api/jobposting/schema.graphql\`.`,
        filePath: 'amplify/backend/api/jobposting/schema.graphql',
      },
      {
        type: 'runCommand',
        instruction: '6. Generate the API with `amplify push`.',
        command: 'amplify push',
      },
      {
        type: 'instruction',
        instruction:
          '7. Create a registration page with the Amplify Auth components.',
      },
      {
        type: 'instruction',
        instruction: '8. Create a login page with the Amplify Auth components.',
      },
      {
        type: 'instruction',
        instruction:
          '9. Create a job posting form with the Amplify API components.',
      },
      {
        type: 'instruction',
        instruction:
          '10. Create a job posting list with the Amplify API components.',
      },
      {
        type: 'instruction',
        instruction:
          '11. Implement security measures such as password hashing and input validation to prevent unauthorized access and data breaches.',
      },
      {
        type: 'runCommand',
        instruction: '12. Create a Next.js app with `npx create-next-app`.',
        command: 'npx create-next-app',
      },
      {
        type: 'runCommand',
        instruction:
          '13. Install the Amplify libraries with `npm install aws-amplify @aws-amplify/ui-react`.',
        command: 'npm install aws-amplify @aws-amplify/ui-react',
      },
      {
        type: 'runCommand',
        instruction:
          '14. Configure Amplify in the Next.js app with `amplify configure`.',
        command: 'amplify configure',
      },
      {
        type: 'instruction',
        instruction:
          '15. Create pages for the registration, login, and job posting list with the Amplify Auth and API components.',
      },
      {
        type: 'instruction',
        instruction:
          '16. Create a protected route for the job posting form with the Amplify Auth components.',
      },
      {
        type: 'runCommand',
        instruction: '17. Deploy the app with `amplify publish`.',
        command: 'amplify publish',
      },
      {
        type: 'information',
        information:
          "Here's an example implementation of the above plan using Next.js and AWS Amplify:",
      },
      {
        type: 'writeCode',
        filePath: 'pages/_app.js',
        code: `import '../styles/globals.css';
import Amplify from 'aws-amplify';
import config from '../aws-exports';

Amplify.configure(config);

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
`,
      },
      {
        type: 'writeCode',
        filePath: 'pages/index.js',
        code: `import { useState, useEffect } from 'react';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { API, graphqlOperation } from 'aws-amplify';
import { createJob, updateJob, deleteJob } from '../src/graphql/mutations';
import { listJobs } from '../src/graphql/queries';

function JobForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    await onSubmit({ title, description, location, salary });
    setTitle('');
    setDescription('');
    setLocation('');
    setSalary('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
      <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required />
      <input type="number" placeholder="Salary" value={salary} onChange={e => setSalary(e.target.value)} required />
      <button type="submit">Submit</button>
    </form>
  );
}

function JobList({ jobs, onDelete }) {
  return (
    <ul>
      {jobs.map(job => (
        <li key={job.id}>
          <h2>{job.title}</h2>
          <p>{job.description}</p>
          <p>{job.location}</p>
          <p>{job.salary}</p>
          <button onClick={() => onDelete(job)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

function Home() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data } = await API.graphql(graphqlOperation(listJobs));
    setJobs(data.listJobs.items);
  };

  const createJobPosting = async job => {
    await API.graphql(graphqlOperation(createJob, { input: job }));
    fetchJobs();
  };

  const updateJobPosting = async job => {
    await API.graphql(graphqlOperation(updateJob, { input: { id: job.id, ...job } }));
    fetchJobs();
  };

  const deleteJobPosting = async job => {
    await API.graphql(graphqlOperation(deleteJob, { input: { id: job.id } }));
    fetchJobs();
  };

  return (
    <div>
      <AmplifySignOut />
      <h1>Job Board</h1>
      <JobForm onSubmit={createJobPosting} />
      <JobList jobs={jobs} onDelete={deleteJobPosting} />
    </div>
  );
}

export default withAuthenticator(Home);
`,
      },
      {
        type: 'writeCode',
        filePath: 'pages/login.js',
        code: `import { withAuthenticator } from '@aws-amplify/ui-react';

function Login() {
  return <div></div>;
}

export default withAuthenticator(Login);
`,
      },
      {
        type: 'writeCode',
        filePath: 'pages/register.js',
        code: `import { withAuthenticator } from '@aws-amplify/ui-react';

function Register() {
  return <div></div>;
}

export default withAuthenticator(Register);
`,
      },
      {
        type: 'writeCode',
        filePath: 'pages/new-job.js',
        code: `import { withAuthenticator } from '@aws-amplify/ui-react';
import { useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { createJob } from '../src/graphql/mutations';

function NewJob() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    await API.graphql(graphqlOperation(createJob, { input: { title, description, location, salary } }));
    setTitle('');
    setDescription('');
    setLocation('');
    setSalary('');
  };

  return (
    <div>
      <h1>New Job Posting</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
        <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required />
        <input type="number" placeholder="Salary" value={salary} onChange={e => setSalary(e.target.value)} required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default withAuthenticator(NewJob);
`,
      },
      {
        type: 'writeCode',
        filePath: 'pages/api/jobs.js',
        code: `import { API, graphqlOperation } from 'aws-amplify';
import { listJobs } from '../../src/graphql/queries';

export default async function handler(req, res) {
  const { data } = await API.graphql(graphqlOperation(listJobs));
  res.status(200).json(data.listJobs.items);
}
`,
      },
      {
        type: 'writeCode',
        filePath: 'pages/api/jobs/[id].js',
        code: `import { API, graphqlOperation } from 'aws-amplify';
import { getJob } from '../../../src/graphql/queries';
import { updateJob, deleteJob } from '../../../src/graphql/mutations';

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method === 'GET') {
    const { data } = await API.graphql(graphqlOperation(getJob, { id }));
    res.status(200).json(data.getJob);
  } else if (req.method === 'PUT') {
    const { title, description, location, salary } = req.body;
    const { data } = await API.graphql(graphqlOperation(updateJob, { input: { id, title, description, location, salary } }));
    res.status(200).json(data.updateJob);
  } else if (req.method === 'DELETE') {
    const { data } = await API.graphql(graphqlOperation(deleteJob, { input: { id } }));
    res.status(200).json(data.deleteJob);
  } else {
    res.status(405).send('Method not allowed');
  }
}
`,
      },
      {
        type: 'writeCode',
        filePath: 'styles/globals.css',
        code: `html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}
`,
      },
      {
        type: 'information',
        information:
          'Note that this is just an example implementation and there are many ways to build a web app with Next.js and AWS Amplify.',
      },
    ]

    expect(processInstructions(fileContents)).toEqual(expectedActions)
  })

  it('should extract the correct actions from the file contents 2', async () => {
    const fileContents = await fs.readFile(
      'test-files/instructions2.md',
      'utf-8'
    )

    const expectedActions = [
      {
        type: 'runCommand',
        instruction: '1. Use the Amplify CLI to create a new Amplify project.',
        command: 'amplify init',
      },
      {
        type: 'runCommands',
        instruction: '2. Add the API and database resources you need.',
        commands: ['amplify add api', 'amplify add storage'],
      },
    ]

    expect(processInstructions(fileContents)).toEqual(expectedActions)
  })
})
