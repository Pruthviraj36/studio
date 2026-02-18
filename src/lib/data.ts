import type { User, Team } from './types';

export const users: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    avatar: 'user-1',
    bio: 'Full-stack developer with a passion for building beautiful and functional web applications. Loves React and GraphQL.',
    location: 'San Francisco, CA',
    experience: 'Intermediate',
    skills: ['React', 'Node.js', 'GraphQL', 'TypeScript', 'Python'],
    interests: ['AI/ML', 'Web3', 'Fintech', 'Developer Tools'],
    githubUrl: 'https://github.com/example',
    githubStats: {
      topRepos: [
        {
          name: 'cool-project',
          url: '#',
          stars: 120,
          language: 'TypeScript',
        },
        { name: 'data-viz', url: '#', stars: 80, language: 'Python' },
      ],
      languages: [
        { name: 'TypeScript', value: 45 },
        { name: 'Python', value: 30 },
        { name: 'JavaScript', value: 25 },
      ],
      stars: 450,
      forks: 75,
      recentActivity:
        'Contributed to 5 projects in the last month, focusing on frontend performance optimizations.',
    },
  },
  {
    id: '2',
    name: 'Bob Williams',
    avatar: 'user-2',
    bio: 'Backend engineer specializing in distributed systems and cloud infrastructure. AWS certified.',
    location: 'New York, NY',
    experience: 'Advanced',
    skills: ['Go', 'Kubernetes', 'Docker', 'AWS', 'PostgreSQL'],
    interests: ['DevOps', 'Cloud Native', 'Cybersecurity'],
    githubUrl: 'https://github.com/example',
    githubStats: {
      topRepos: [
        { name: 'go-microservice', url: '#', stars: 250, language: 'Go' },
        { name: 'k8s-operator', url: '#', stars: 150, language: 'Go' },
      ],
      languages: [
        { name: 'Go', value: 70 },
        { name: 'Shell', value: 20 },
        { name: 'Python', value: 10 },
      ],
      stars: 800,
      forks: 120,
      recentActivity:
        'Authored a new Kubernetes operator and presented it at a local meetup.',
    },
  },
  {
    id: '3',
    name: 'Charlie Brown',
    avatar: 'user-3',
    bio: 'Data scientist who enjoys finding stories in data. Proficient in Python, R, and various ML frameworks.',
    location: 'Chicago, IL',
    experience: 'Intermediate',
    skills: ['Python', 'R', 'TensorFlow', 'PyTorch', 'SQL'],
    interests: ['AI/ML', 'Data Visualization', 'Natural Language Processing'],
    githubUrl: 'https://github.com/example',
    githubStats: {
      topRepos: [
        { name: 'nlp-research', url: '#', stars: 95, language: 'Python' },
        { name: 'stock-predictor', url: '#', stars: 70, language: 'Python' },
      ],
      languages: [
        { name: 'Python', value: 80 },
        { name: 'R', value: 15 },
        { name: 'Jupyter Notebook', value: 5 },
      ],
      stars: 300,
      forks: 50,
      recentActivity:
        'Published a new paper on sentiment analysis and released the accompanying code.',
    },
  },
  {
    id: '4',
    name: 'Diana Prince',
    avatar: 'user-4',
    bio: 'UX/UI designer and frontend developer. Believes in user-centric design and loves creating intuitive interfaces.',
    location: 'Austin, TX',
    experience: 'Beginner',
    skills: ['Figma', 'React', 'CSS', 'JavaScript', 'Next.js'],
    interests: ['Design Systems', 'Accessibility', 'Mobile First'],
    githubUrl: 'https://github.com/example',
    githubStats: {
      topRepos: [
        {
          name: 'portfolio-website',
          url: '#',
          stars: 50,
          language: 'JavaScript',
        },
        { name: 'design-system-ui', url: '#', stars: 30, language: 'CSS' },
      ],
      languages: [
        { name: 'JavaScript', value: 50 },
        { name: 'CSS', value: 40 },
        { name: 'HTML', value: 10 },
      ],
      stars: 150,
      forks: 20,
      recentActivity:
        'Redesigned her personal portfolio and started learning Framer Motion for animations.',
    },
  },
  // Add more users
  {
    id: '5',
    name: 'Eva Green',
    avatar: 'user-5',
    bio: 'Mobile developer with expertise in iOS and Android. Loves building native experiences with Swift and Kotlin.',
    location: 'Los Angeles, CA',
    experience: 'Expert',
    skills: ['Swift', 'Kotlin', 'iOS', 'Android', 'Firebase'],
    interests: ['Mobile UI/UX', 'AR/VR', 'Gaming'],
    githubUrl: 'https://github.com/example',
    githubStats: {
      topRepos: [
        { name: 'swiftui-chat-app', url: '#', stars: 400, language: 'Swift' },
        { name: 'ar-game-prototype', url: '#', stars: 250, language: 'Kotlin' },
      ],
      languages: [
        { name: 'Swift', value: 60 },
        { name: 'Kotlin', value: 35 },
        { name: 'C#', value: 5 },
      ],
      stars: 1200,
      forks: 300,
      recentActivity: 'Released a new app on the App Store that hit 10,000 downloads in the first week.',
    },
  },
  {
    id: '6',
    name: 'Frank Miller',
    avatar: 'user-6',
    bio: 'Cybersecurity expert and ethical hacker. Enjoys finding vulnerabilities and securing systems.',
    location: 'Boston, MA',
    experience: 'Advanced',
    skills: ['Python', 'Metasploit', 'Wireshark', 'Cryptography', 'Linux'],
    interests: ['Cybersecurity', 'Penetration Testing', 'Blockchain Security'],
    githubUrl: 'https://github.com/example',
    githubStats: {
      topRepos: [
        { name: 'pentesting-scripts', url: '#', stars: 300, language: 'Python' },
        { name: 'blockchain-analyzer', url: '#', stars: 180, language: 'Python' },
      ],
      languages: [
        { name: 'Python', value: 75 },
        { name: 'Shell', value: 15 },
        { name: 'C++', value: 10 },
      ],
      stars: 950,
      forks: 200,
      recentActivity: 'Discovered a critical vulnerability in a popular open-source library and coordinated the patch.',
    },
  },
];

export const currentUser: User = {
  id: 'current-user',
  name: 'Alex Doe',
  avatar: 'current-user',
  bio: 'Creative technologist exploring the intersection of AI, art, and web development. Eager to collaborate on innovative hackathon projects.',
  location: 'Remote',
  experience: 'Intermediate',
  skills: ['JavaScript', 'Three.js', 'React', 'Python', 'Generative AI'],
  interests: ['Creative Coding', 'AI/ML', 'Data Visualization', 'Web3'],
  githubUrl: 'https://github.com/alexdoe',
  githubStats: {
    topRepos: [
      { name: 'generative-art-gallery', url: '#', stars: 150, language: 'JavaScript' },
      { name: 'ai-powered-story-writer', url: '#', stars: 90, language: 'Python' },
      { name: 'webgl-experiments', url: '#', stars: 75, language: 'JavaScript' },
    ],
    languages: [
      { name: 'JavaScript', value: 50 },
      { name: 'Python', value: 35 },
      { name: 'GLSL', value: 15 },
    ],
    stars: 315,
    forks: 45,
    recentActivity: 'Recently exploring diffusion models for image generation and integrated a Genkit flow into a new project.'
  },
};

export const teams: Team[] = [
  {
    id: 'team-1',
    name: 'AI Avengers',
    description: 'Building an AI-powered platform to help students learn complex subjects through interactive simulations.',
    projectDescription: 'Our project, "LearnSphere AI", aims to revolutionize online education. We are creating an adaptive learning environment that personalizes content delivery based on student performance. We plan to use a combination of machine learning models for content recommendation and natural language processing for an interactive Q&A bot.',
    requiredSkills: ['Python', 'TensorFlow', 'React', 'Natural Language Processing'],
    members: [
      { id: '1', name: 'Alice Johnson', avatar: 'user-1' },
      { id: '3', name: 'Charlie Brown', avatar: 'user-3' },
    ],
  },
  {
    id: 'team-2',
    name: 'Web3 Wizards',
    description: 'Developing a decentralized identity management system using blockchain technology.',
    projectDescription: 'Project "Veritas" is a self-sovereign identity platform. Users will have full control over their personal data, sharing it selectively and securely. We are building on Ethereum and utilizing zk-SNARKs for privacy. We are looking for passionate developers to help build the core protocol and the user-facing dApp.',
    requiredSkills: ['Solidity', 'Next.js', 'Ethers.js', 'Cryptography'],
    members: [
      { id: '2', name: 'Bob Williams', avatar: 'user-2' },
    ],
  },
  {
    id: 'team-3',
    name: 'Cloud Crusaders',
    description: 'Creating a serverless platform for real-time data processing and analytics.',
    projectDescription: 'Our platform, "StreamFlow", will enable developers to easily deploy and manage real-time data pipelines on cloud infrastructure. We are leveraging AWS Lambda, Kinesis, and DynamoDB to build a scalable, cost-effective solution. We need engineers with cloud and backend experience.',
    requiredSkills: ['Go', 'AWS', 'Serverless', 'Terraform'],
    members: [
       { id: '6', name: 'Frank Miller', avatar: 'user-6' },
    ],
  },
    {
    id: 'team-4',
    name: 'Design Dynamos',
    description: 'Crafting a beautiful and accessible component library for modern web applications.',
    projectDescription: 'Project "Aether UI" is a design system and React component library focused on aesthetics, accessibility (A11Y), and developer experience. We aim to provide a comprehensive set of tools for building high-quality interfaces quickly. We are looking for designers and frontend developers who are passionate about UI/UX.',
    requiredSkills: ['Figma', 'React', 'TypeScript', 'Storybook', 'CSS'],
    members: [
      { id: '4', name: 'Diana Prince', avatar: 'user-4' },
    ],
  },
];
