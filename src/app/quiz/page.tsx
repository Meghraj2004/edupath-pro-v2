'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Brain, 
  ArrowRight, 
  ArrowLeft, 
  Clock, 
  Star,
  CheckCircle,
  TrendingUp,
  BookOpen,
  Users,
  Target,
  Building2,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Quiz questions data
const quizQuestions = [
  {
    id: 'q1',
    question: 'Which subject interests you the most?',
    type: 'multiple-choice' as const,
    options: [
      { value: 'mathematics', label: 'Mathematics & Logic', score: { science: 4, engineering: 5 } },
      { value: 'biology', label: 'Biology & Life Sciences', score: { medical: 5, science: 4 } },
      { value: 'physics', label: 'Physics & Technology', score: { engineering: 5, science: 4 } },
      { value: 'literature', label: 'Literature & Languages', score: { arts: 5, humanities: 4 } },
      { value: 'history', label: 'History & Social Studies', score: { humanities: 5, arts: 3 } },
      { value: 'commerce', label: 'Business & Commerce', score: { business: 5, commerce: 4 } }
    ],
    category: 'academic',
    weight: 4
  },
  {
    id: 'q2',
    question: 'What type of activities do you enjoy most?',
    type: 'multiple-choice' as const,
    options: [
      { value: 'problem-solving', label: 'Solving complex problems', score: { engineering: 5, science: 4 } },
      { value: 'creative', label: 'Creative and artistic expression', score: { arts: 5, design: 4 } },
      { value: 'helping', label: 'Helping and caring for others', score: { medical: 5, social: 4 } },
      { value: 'leading', label: 'Leading teams and projects', score: { business: 5, management: 4 } },
      { value: 'analyzing', label: 'Analyzing data and information', score: { science: 4, research: 5 } },
      { value: 'teaching', label: 'Teaching and mentoring others', score: { education: 5, humanities: 3 } }
    ],
    category: 'interest',
    weight: 5
  },
  {
    id: 'q3',
    question: 'In group projects, you usually:',
    type: 'multiple-choice' as const,
    options: [
      { value: 'lead', label: 'Take the leadership role', score: { business: 4, management: 5 } },
      { value: 'research', label: 'Handle research and analysis', score: { science: 4, research: 5 } },
      { value: 'creative', label: 'Manage creative aspects', score: { arts: 5, design: 4 } },
      { value: 'coordinate', label: 'Coordinate between team members', score: { management: 4, social: 3 } },
      { value: 'technical', label: 'Handle technical implementation', score: { engineering: 5, technical: 4 } },
      { value: 'present', label: 'Present results to others', score: { communication: 4, business: 3 } }
    ],
    category: 'personality',
    weight: 3
  },
  {
    id: 'q4',
    question: 'Your ideal work environment would be:',
    type: 'multiple-choice' as const,
    options: [
      { value: 'lab', label: 'Laboratory or research facility', score: { science: 5, research: 5 } },
      { value: 'office', label: 'Modern office with team collaboration', score: { business: 4, corporate: 4 } },
      { value: 'studio', label: 'Creative studio or workshop', score: { arts: 5, design: 5 } },
      { value: 'outdoor', label: 'Outdoor or field work', score: { environmental: 4, practical: 5 } },
      { value: 'hospital', label: 'Hospital or healthcare facility', score: { medical: 5, healthcare: 5 } },
      { value: 'school', label: 'Educational institution', score: { education: 5, academic: 4 } }
    ],
    category: 'interest',
    weight: 4
  },
  {
    id: 'q5',
    question: 'Rate your interest in technology and innovation (1-5):',
    type: 'rating' as const,
    options: [
      { value: '1', label: 'Not interested at all', score: { arts: 2, humanities: 3 } },
      { value: '2', label: 'Slightly interested', score: { general: 2 } },
      { value: '3', label: 'Moderately interested', score: { general: 3 } },
      { value: '4', label: 'Very interested', score: { engineering: 3, technology: 4 } },
      { value: '5', label: 'Extremely interested', score: { engineering: 5, technology: 5 } }
    ],
    category: 'interest',
    weight: 3
  },
  {
    id: 'q6',
    question: 'Which skills do you want to develop most? (Select up to 3)',
    type: 'checkbox' as const,
    options: [
      { value: 'programming', label: 'Programming & Software Development', score: { engineering: 4, technology: 5 } },
      { value: 'design', label: 'Design & Creativity', score: { arts: 5, design: 5 } },
      { value: 'communication', label: 'Communication & Public Speaking', score: { business: 3, humanities: 4 } },
      { value: 'analytical', label: 'Analytical & Research Skills', score: { science: 5, research: 5 } },
      { value: 'leadership', label: 'Leadership & Management', score: { business: 5, management: 5 } },
      { value: 'medical', label: 'Medical & Healthcare Knowledge', score: { medical: 5, healthcare: 5 } }
    ],
    category: 'skills',
    weight: 4
  },
  {
    id: 'q7',
    question: 'What motivates you the most in your future career?',
    type: 'multiple-choice' as const,
    options: [
      { value: 'innovation', label: 'Creating innovative solutions', score: { engineering: 5, technology: 4 } },
      { value: 'helping', label: 'Making a positive impact on society', score: { medical: 4, social: 5 } },
      { value: 'financial', label: 'Financial stability and growth', score: { business: 5, finance: 4 } },
      { value: 'artistic', label: 'Artistic expression and creativity', score: { arts: 5, creative: 5 } },
      { value: 'knowledge', label: 'Pursuing knowledge and research', score: { science: 5, academic: 5 } },
      { value: 'flexibility', label: 'Work-life balance and flexibility', score: { general: 3 } }
    ],
    category: 'motivation',
    weight: 4
  },
  {
    id: 'q8',
    question: 'How do you prefer to learn new things?',
    type: 'multiple-choice' as const,
    options: [
      { value: 'hands-on', label: 'Hands-on practice and experimentation', score: { engineering: 4, practical: 5 } },
      { value: 'visual', label: 'Visual aids and diagrams', score: { design: 4, visual: 5 } },
      { value: 'reading', label: 'Reading and theoretical study', score: { academic: 5, research: 4 } },
      { value: 'discussion', label: 'Group discussions and collaboration', score: { social: 4, humanities: 3 } },
      { value: 'observation', label: 'Observation and case studies', score: { medical: 4, analytical: 4 } },
      { value: 'practice', label: 'Repetitive practice and drilling', score: { technical: 4, systematic: 5 } }
    ],
    category: 'learning',
    weight: 3
  },
  {
    id: 'q9',
    question: 'Which of these scenarios appeals to you most?',
    type: 'multiple-choice' as const,
    options: [
      { value: 'build-bridge', label: 'Designing and building a bridge that connects communities', score: { engineering: 5, civil: 4, architecture: 3 } },
      { value: 'save-life', label: 'Performing surgery to save someone\'s life', score: { medical: 5, healthcare: 5 } },
      { value: 'defend-court', label: 'Defending an innocent person in court', score: { law: 5, justice: 4 } },
      { value: 'serve-nation', label: 'Serving your nation in uniform', score: { defense: 5, service: 4 } },
      { value: 'policy-change', label: 'Creating policies that improve society', score: { civilservices: 5, governance: 4 } },
      { value: 'grow-crops', label: 'Developing sustainable farming techniques', score: { agriculture: 5, environmental: 4 } }
    ],
    category: 'motivation',
    weight: 5
  },
  {
    id: 'q10',
    question: 'What type of problems do you enjoy solving?',
    type: 'multiple-choice' as const,
    options: [
      { value: 'technical', label: 'Complex technical and mathematical problems', score: { engineering: 5, technical: 4 } },
      { value: 'human-health', label: 'Health and medical challenges', score: { medical: 5, healthcare: 4 } },
      { value: 'legal', label: 'Legal disputes and constitutional issues', score: { law: 5, justice: 4 } },
      { value: 'security', label: 'National security and strategic challenges', score: { defense: 5, strategic: 4 } },
      { value: 'social', label: 'Social and administrative problems', score: { civilservices: 5, governance: 4 } },
      { value: 'environmental', label: 'Agricultural and environmental issues', score: { agriculture: 5, environmental: 4 } }
    ],
    category: 'interest',
    weight: 4
  },
  {
    id: 'q11',
    question: 'Which work environment excites you the most?',
    type: 'multiple-choice' as const,
    options: [
      { value: 'construction', label: 'Construction sites and engineering projects', score: { engineering: 4, civil: 5 } },
      { value: 'hospital-clinic', label: 'Hospitals, clinics, and medical facilities', score: { medical: 5, healthcare: 5 } },
      { value: 'courtroom', label: 'Courtrooms and legal chambers', score: { law: 5, justice: 4 } },
      { value: 'military', label: 'Military bases and defense installations', score: { defense: 5, service: 4 } },
      { value: 'government', label: 'Government offices and administrative buildings', score: { civilservices: 5, governance: 4 } },
      { value: 'farmland', label: 'Farms, fields, and agricultural research centers', score: { agriculture: 5, rural: 4 } }
    ],
    category: 'interest',
    weight: 4
  },
  {
    id: 'q12',
    question: 'What subjects did you excel in or find most interesting?',
    type: 'checkbox' as const,
    options: [
      { value: 'math-physics', label: 'Mathematics and Physics', score: { engineering: 5, technical: 4 } },
      { value: 'biology-chemistry', label: 'Biology and Chemistry', score: { medical: 5, agriculture: 3 } },
      { value: 'history-civics', label: 'History and Civics', score: { law: 4, civilservices: 5 } },
      { value: 'geography', label: 'Geography and Environmental Science', score: { defense: 3, agriculture: 4, civilservices: 3 } },
      { value: 'art-design', label: 'Art and Design', score: { architecture: 5, creative: 4 } },
      { value: 'economics', label: 'Economics and Political Science', score: { civilservices: 4, law: 3 } }
    ],
    category: 'academic',
    weight: 4
  },
  {
    id: 'q13',
    question: 'Which type of responsibility appeals to you?',
    type: 'multiple-choice' as const,
    options: [
      { value: 'infrastructure', label: 'Building infrastructure that lasts generations', score: { engineering: 4, civil: 5, architecture: 4 } },
      { value: 'health-care', label: 'Taking care of people\'s health and wellbeing', score: { medical: 5, healthcare: 5 } },
      { value: 'justice', label: 'Ensuring justice and upholding the law', score: { law: 5, justice: 5 } },
      { value: 'security', label: 'Protecting national security and sovereignty', score: { defense: 5, security: 5 } },
      { value: 'governance', label: 'Managing public resources and services', score: { civilservices: 5, governance: 5 } },
      { value: 'food-security', label: 'Ensuring food security and sustainability', score: { agriculture: 5, sustainability: 4 } }
    ],
    category: 'motivation',
    weight: 5
  },
  {
    id: 'q14',
    question: 'How do you handle pressure and emergency situations?',
    type: 'multiple-choice' as const,
    options: [
      { value: 'analytical', label: 'Analyze the problem systematically and find solutions', score: { engineering: 4, technical: 4 } },
      { value: 'quick-action', label: 'Take immediate action to help those in need', score: { medical: 5, defense: 4 } },
      { value: 'research', label: 'Research thoroughly before making decisions', score: { law: 4, research: 5 } },
      { value: 'leadership', label: 'Take charge and coordinate team responses', score: { defense: 5, civilservices: 4 } },
      { value: 'calm-planning', label: 'Stay calm and develop strategic plans', score: { civilservices: 4, management: 4 } },
      { value: 'practical', label: 'Find practical, immediate solutions', score: { agriculture: 4, practical: 5 } }
    ],
    category: 'personality',
    weight: 4
  },
  {
    id: 'q15',
    question: 'What type of impact do you want to make on society?',
    type: 'multiple-choice' as const,
    options: [
      { value: 'innovation', label: 'Create innovative technologies and infrastructure', score: { engineering: 5, innovation: 4 } },
      { value: 'healing', label: 'Heal people and advance medical science', score: { medical: 5, healthcare: 5 } },
      { value: 'justice-system', label: 'Strengthen the justice system and protect rights', score: { law: 5, justice: 5 } },
      { value: 'national-service', label: 'Serve and protect the nation', score: { defense: 5, service: 5 } },
      { value: 'governance', label: 'Improve governance and public administration', score: { civilservices: 5, governance: 5 } },
      { value: 'sustainability', label: 'Promote sustainable agriculture and food security', score: { agriculture: 5, sustainability: 5 } }
    ],
    category: 'motivation',
    weight: 5
  },
  {
    id: 'q16',
    question: 'Which skills would you like to develop further?',
    type: 'checkbox' as const,
    options: [
      { value: 'technical-design', label: 'Technical design and problem-solving', score: { engineering: 4, architecture: 4 } },
      { value: 'medical-skills', label: 'Medical diagnosis and patient care', score: { medical: 5, healthcare: 4 } },
      { value: 'legal-research', label: 'Legal research and argumentation', score: { law: 5, research: 3 } },
      { value: 'strategic-planning', label: 'Strategic planning and tactical thinking', score: { defense: 5, strategic: 4 } },
      { value: 'public-policy', label: 'Public policy and administration', score: { civilservices: 5, governance: 4 } },
      { value: 'sustainable-practices', label: 'Sustainable farming and crop management', score: { agriculture: 5, sustainability: 4 } }
    ],
    category: 'skills',
    weight: 4
  }
];

type StreamScores = {
  [key: string]: number;
};

export default function QuizPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamScores, setStreamScores] = useState<StreamScores>({});

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateResults = () => {
    const scores: StreamScores = {
      science: 0,
      engineering: 0,
      medical: 0,
      business: 0,
      arts: 0,
      commerce: 0,
      humanities: 0,
      law: 0,
      defense: 0,
      civilservices: 0,
      agriculture: 0,
      architecture: 0
    };

    quizQuestions.forEach(question => {
      const answer = answers[question.id];
      if (!answer) return;

      const selectedOptions = Array.isArray(answer) ? answer : [answer];
      
      selectedOptions.forEach(selectedValue => {
        const option = question.options.find(opt => opt.value === selectedValue);
        if (option?.score) {
          Object.entries(option.score).forEach(([stream, points]) => {
            if (scores[stream] !== undefined) {
              scores[stream] += points * question.weight;
            }
          });
        }
      });
    });

    return scores;
  };

  const getRecommendations = (scores: StreamScores) => {
    const sortedStreams = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const recommendations = {
      primary: sortedStreams[0],
      secondary: sortedStreams[1],
      tertiary: sortedStreams[2]
    };

    return recommendations;
  };

  const getStreamInfo = (stream: string) => {
    const streamData: { [key: string]: { name: string; description: string; careers: string[]; color: string } } = {
      science: {
        name: 'Science & Research',
        description: 'Perfect for analytical minds who love discovery and research',
        careers: ['Research Scientist', 'Data Analyst', 'Lab Technician', 'Environmental Scientist'],
        color: 'from-blue-500 to-cyan-500'
      },
      engineering: {
        name: 'Engineering & Technology',
        description: 'Ideal for problem-solvers who enjoy building and innovating',
        careers: ['Software Engineer', 'Mechanical Engineer', 'Civil Engineer', 'Data Scientist'],
        color: 'from-purple-500 to-indigo-500'
      },
      medical: {
        name: 'Medical & Healthcare',
        description: 'Great for compassionate individuals who want to heal and help',
        careers: ['Doctor', 'Nurse', 'Pharmacist', 'Medical Researcher', 'Physiotherapist'],
        color: 'from-green-500 to-emerald-500'
      },
      business: {
        name: 'Business & Management',
        description: 'Perfect for leaders who enjoy strategy and entrepreneurship',
        careers: ['Business Analyst', 'Marketing Manager', 'Financial Advisor', 'Entrepreneur'],
        color: 'from-orange-500 to-red-500'
      },
      arts: {
        name: 'Arts & Creative Fields',
        description: 'Ideal for creative minds who love expression and innovation',
        careers: ['Graphic Designer', 'Writer', 'Artist', 'Musician', 'Film Director'],
        color: 'from-pink-500 to-rose-500'
      },
      commerce: {
        name: 'Commerce & Finance',
        description: 'Great for those interested in economics and financial systems',
        careers: ['Accountant', 'Investment Banker', 'Financial Planner', 'Economist'],
        color: 'from-yellow-500 to-orange-500'
      },
      humanities: {
        name: 'Humanities & Social Sciences',
        description: 'Perfect for those interested in human behavior and society',
        careers: ['Psychologist', 'Teacher', 'Social Worker', 'Historian', 'Journalist'],
        color: 'from-indigo-500 to-purple-500'
      },
      law: {
        name: 'Law & Legal Studies',
        description: 'For those passionate about justice and legal advocacy',
        careers: ['Lawyer', 'Judge', 'Legal Advisor', 'Public Prosecutor', 'Corporate Counsel'],
        color: 'from-slate-600 to-slate-800'
      },
      defense: {
        name: 'Defense & Military Services',
        description: 'For those committed to serving and protecting the nation',
        careers: ['Army Officer', 'Navy Officer', 'Air Force Pilot', 'Defense Analyst', 'Military Engineer'],
        color: 'from-emerald-700 to-green-800'
      },
      civilservices: {
        name: 'Civil Services & Governance',
        description: 'For those dedicated to public service and administration',
        careers: ['IAS Officer', 'IPS Officer', 'IFS Officer', 'Policy Analyst', 'District Collector'],
        color: 'from-blue-700 to-indigo-800'
      },
      agriculture: {
        name: 'Agriculture & Rural Development',
        description: 'For those passionate about farming and food security',
        careers: ['Agricultural Scientist', 'Farm Manager', 'Rural Development Officer', 'Food Technologist', 'Agricultural Engineer'],
        color: 'from-green-600 to-lime-700'
      },
      architecture: {
        name: 'Architecture & Design',
        description: 'For creative minds who design spaces and structures',
        careers: ['Architect', 'Urban Planner', 'Interior Designer', 'Landscape Architect', 'Construction Manager'],
        color: 'from-amber-500 to-orange-600'
      }
    };

    return streamData[stream] || streamData.science;
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const scores = calculateResults();
      setStreamScores(scores);

      // Save results to Firebase
      if (user) {
        const quizResult = {
          userId: user.uid,
          answers,
          scores,
          completedAt: new Date(),
          totalQuestions: quizQuestions.length
        };

        await setDoc(doc(collection(db, 'quiz-results'), `${user.uid}-${Date.now()}`), quizResult);
      }

      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const question = quizQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === quizQuestions.length - 1;
  const canProceed = answers[question.id] !== undefined;

  if (showResults) {
    const recommendations = getRecommendations(streamScores);
    const maxScore = Math.max(...Object.values(streamScores));

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Quiz Completed! 🎉</h1>
              <p className="text-gray-600">Here are your personalized career recommendations</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[recommendations.primary, recommendations.secondary, recommendations.tertiary].map((rec, index) => {
                if (!rec) return null;
                const [stream, score] = rec;
                const streamInfo = getStreamInfo(stream);
                const percentage = Math.round((score / maxScore) * 100);

                return (
                  <motion.div
                    key={stream}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                  >
                    <Card className={`h-full ${index === 0 ? 'ring-2 ring-blue-500' : ''}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge variant={index === 0 ? 'default' : 'secondary'}>
                            {index === 0 ? 'Best Match' : index === 1 ? '2nd Match' : '3rd Match'}
                          </Badge>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-semibold">{percentage}%</span>
                          </div>
                        </div>
                        <CardTitle className="text-xl">{streamInfo.name}</CardTitle>
                        <CardDescription>{streamInfo.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Career Options:</h4>
                            <div className="flex flex-wrap gap-2">
                              {streamInfo.careers.slice(0, 3).map(career => (
                                <Badge key={career} variant="outline" className="text-xs">
                                  {career}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-center space-y-4"
            >
              <h2 className="text-2xl font-bold">What's Next?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild className="h-auto p-4">
                  <div className="text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-2" />
                    <div>
                      <div className="font-semibold">Explore Courses</div>
                      <div className="text-sm opacity-90">Find degree programs</div>
                    </div>
                  </div>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <Building2 className="h-8 w-8 mx-auto mb-2" />
                    <div>
                      <div className="font-semibold">Find Colleges</div>
                      <div className="text-sm opacity-90">Search nearby institutions</div>
                    </div>
                  </div>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <Trophy className="h-8 w-8 mx-auto mb-2" />
                    <div>
                      <div className="font-semibold">View Scholarships</div>
                      <div className="text-sm opacity-90">Financial assistance</div>
                    </div>
                  </div>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Career Aptitude Quiz</h1>
            <p className="text-gray-600">Discover your ideal career path through our comprehensive assessment</p>
          </motion.div>

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{currentQuestion + 1} of {quizQuestions.length}</span>
            </div>
            <Progress value={progress} className="h-3" />
          </motion.div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      Question {currentQuestion + 1}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {question.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{question.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {question.type === 'multiple-choice' && (
                    <RadioGroup 
                      value={answers[question.id] as string || ''} 
                      onValueChange={(value) => handleAnswer(question.id, value)}
                    >
                      {question.options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === 'checkbox' && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Select up to 3 options</p>
                      {question.options.map((option) => {
                        const selectedAnswers = (answers[question.id] as string[]) || [];
                        const isChecked = selectedAnswers.includes(option.value);
                        const canSelect = selectedAnswers.length < 3 || isChecked;

                        return (
                          <div key={option.value} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <Checkbox
                              id={option.value}
                              checked={isChecked}
                              disabled={!canSelect}
                              onCheckedChange={(checked) => {
                                const currentAnswers = (answers[question.id] as string[]) || [];
                                let newAnswers;
                                
                                if (checked) {
                                  newAnswers = [...currentAnswers, option.value];
                                } else {
                                  newAnswers = currentAnswers.filter(ans => ans !== option.value);
                                }
                                
                                handleAnswer(question.id, newAnswers);
                              }}
                            />
                            <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {question.type === 'rating' && (
                    <RadioGroup 
                      value={answers[question.id] as string || ''} 
                      onValueChange={(value) => handleAnswer(question.id, value)}
                    >
                      <div className="grid grid-cols-5 gap-2">
                        {question.options.map((option) => (
                          <div key={option.value} className="text-center">
                            <RadioGroupItem value={option.value} id={option.value} className="mx-auto mb-2" />
                            <Label htmlFor={option.value} className="text-xs cursor-pointer block">
                              {option.value}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Not interested</span>
                        <span>Extremely interested</span>
                      </div>
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-between items-center mt-8"
          >
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>~2 minutes remaining</span>
            </div>

            {isLastQuestion ? (
              <Button
                onClick={submitQuiz}
                disabled={!canProceed || loading}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    Submit Quiz
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                disabled={!canProceed}
                className="flex items-center"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}