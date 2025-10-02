'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageCircle,
  HelpCircle,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Save to Firestore
      const contactData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        subject: formData.subject,
        message: formData.message,
        timestamp: new Date(),
        status: 'new'
      };

      await addDoc(collection(db, 'contacts'), contactData);

      // Send email notification (non-blocking)
      try {
        const response = await fetch('/api/send-contact-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contactData),
        });

        const result = await response.json();
        
        // Check if email was sent successfully
        if (result.success && result.emailSent) {
          // Email sent successfully - no warning needed
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Email notification sent');
          }
        } else if (result.success && !result.emailSent) {
          // Form saved but email failed - show warning
          if (result.warning) {
            setEmailWarning(`Your message was saved successfully! ${result.warning}`);
          }
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Email notification not sent:', result.warning);
          }
        }
      } catch (emailError) {
        // Email API call failed completely - still okay since data is saved
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Email API call failed:', emailError);
        }
        setEmailWarning('Your message was saved successfully! Email notification may have failed.');
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        message: ''
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error submitting form:', error);
      }
      // Show error to user
      alert('There was an error submitting your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      title: 'Email Support',
      primary: 'support@edupathpro.com',
      secondary: 'Response within 24 hours'
    },
    {
      icon: <Phone className="h-6 w-6 text-green-600" />,
      title: 'Phone Support',
      primary: '+91 94216-12345',
      secondary: 'Mon-Fri, 9 AM - 6 PM'
    },
    {
      icon: <MapPin className="h-6 w-6 text-red-600" />,
      title: 'Office Location',
      primary: 'Pune, India',
      secondary: 'Available for consultations'
    }
  ];

  const faqCategories = [
    {
      id: 'general',
      icon: <HelpCircle className="h-5 w-5" />,
      title: 'General Questions',
      questions: [
        {
          question: 'What is EduPath Pro?',
          answer: 'EduPath Pro is a comprehensive educational platform that helps students make informed decisions about their career and education. We provide career guidance, college recommendations, scholarship information, and educational resources.'
        },
        {
          question: 'How do I get started with EduPath Pro?',
          answer: 'Simply create an account by clicking the Register button. Once registered, you can take our aptitude quiz, explore career options, browse colleges, and access our extensive resource library.'
        },
        {
          question: 'Is EduPath Pro free to use?',
          answer: 'Yes! EduPath Pro offers many free features including career exploration, college browsing, and basic resources. Some premium features may require a subscription in the future.'
        },
        {
          question: 'How accurate are the career recommendations?',
          answer: 'Our recommendations are based on scientifically validated aptitude tests, your interests, and academic performance. While highly accurate, they should be used as guidance alongside your own research and counselor advice.'
        }
      ]
    },
    {
      id: 'career',
      icon: <Users className="h-5 w-5" />,
      title: 'Career Guidance',
      questions: [
        {
          question: 'How does the aptitude quiz work?',
          answer: 'Our aptitude quiz evaluates your strengths, interests, and personality traits across multiple dimensions. It takes about 15-20 minutes to complete and provides personalized career recommendations based on your results.'
        },
        {
          question: 'Can I retake the aptitude quiz?',
          answer: 'Yes, you can retake the quiz anytime from your dashboard. However, we recommend waiting at least a month between attempts to ensure meaningful results.'
        },
        {
          question: 'What career information do you provide?',
          answer: 'For each career, we provide detailed information including job descriptions, required qualifications, salary ranges, growth prospects, top companies, and recommended educational paths.'
        },
        {
          question: 'How do I explore different career paths?',
          answer: 'Visit the Careers section to browse careers by category, or take our aptitude quiz for personalized recommendations. You can also use the search function to find specific careers.'
        }
      ]
    },
    {
      id: 'applications',
      icon: <FileText className="h-5 w-5" />,
      title: 'Applications',
      questions: [
        {
          question: 'How do I track my college applications?',
          answer: 'Use the Applications page to add colleges you\'re applying to, set deadlines, track application status, and receive reminders. You can also upload required documents and notes.'
        },
        {
          question: 'Can I remove applications I no longer need?',
          answer: 'Yes, you can remove any application from your Applications page by clicking the remove button. This action cannot be undone, so please confirm before removing.'
        },
        {
          question: 'How do I find scholarship opportunities?',
          answer: 'Browse our Scholarships section which lists various scholarships with eligibility criteria, application deadlines, and requirements. You can filter by category, amount, and deadline.'
        },
        {
          question: 'What information should I include in my applications?',
          answer: 'Include all required documents, maintain accurate deadlines, and regularly update your application status. Use our timeline feature to stay organized throughout the application process.'
        }
      ]
    },
    {
      id: 'technical',
      icon: <MessageCircle className="h-5 w-5" />,
      title: 'Technical Support',
      questions: [
        {
          question: 'I forgot my password. How can I reset it?',
          answer: 'On the login page, click "Forgot Password" and enter your email address. You\'ll receive a password reset link in your email within a few minutes.'
        },
        {
          question: 'Why can\'t I access certain features?',
          answer: 'Some features require you to be logged in. Make sure you\'re signed in to your account. If you\'re still having issues, try clearing your browser cache or using a different browser.'
        },
        {
          question: 'The website is loading slowly. What should I do?',
          answer: 'Try refreshing the page, clearing your browser cache, or checking your internet connection. If the problem persists, please contact our support team.'
        },
        {
          question: 'How do I update my profile information?',
          answer: 'Go to your Profile page from the dashboard or navigation menu. You can update your personal information, academic details, and preferences there.'
        },
        {
          question: 'Are my data and privacy protected?',
          answer: 'Yes, we take data privacy seriously. All your personal information is encrypted and stored securely. We never share your data with third parties without your consent.'
        }
      ]
    }
  ];

  const subjects = [
    'General Inquiry',
    'Technical Support',
    'Career Guidance',
    'Account Issues',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Mail className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about your career journey? Need help with our platform? 
            We're here to support you every step of the way.
          </p>
        </motion.div>

        {/* Contact Information Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto mb-3">{info.icon}</div>
                  <CardTitle className="text-lg">{info.title}</CardTitle>
                  <CardDescription className="font-semibold text-gray-900">
                    {info.primary}
                  </CardDescription>
                  <CardDescription className="text-sm text-blue-600">
                    {info.secondary}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Send className="h-6 w-6 mr-3 text-blue-600" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="space-y-3">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Thank you for your message! We've received your inquiry and will respond within 24 hours.
                      </AlertDescription>
                    </Alert>
                    {emailWarning && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          {emailWarning}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        {isClient ? (
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter your full name"
                            required
                          />
                        ) : (
                          <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        {isClient ? (
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter your email"
                            required
                          />
                        ) : (
                          <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        {isClient ? (
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        {isClient ? (
                          <Select 
                            value={formData.subject} 
                            onValueChange={(value) => handleInputChange('subject', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map(subject => (
                                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
                        )}
                      </div>
                    </div>



                    <div>
                      <Label htmlFor="message">Message *</Label>
                      {isClient ? (
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          placeholder="Please describe your question or issue in detail..."
                          rows={5}
                          required
                        />
                      ) : (
                        <div className="h-32 bg-gray-100 rounded-md animate-pulse"></div>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading || !formData.name || !formData.email || !formData.message}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="space-y-6"
          >
            {/* FAQ Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-purple-600" />
                  Quick Help
                </CardTitle>
                <CardDescription>
                  Browse common questions by category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {faqCategories.map((category, index) => (
                  <div key={category.id} className="border rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-gray-500">{category.icon}</div>
                        <h4 className="font-medium text-gray-900">{category.title}</h4>
                      </div>
                      {expandedCategory === category.id ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    
                    {expandedCategory === category.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t"
                      >
                        <div className="p-4 space-y-4 bg-gray-50">
                          {category.questions.map((faq, faqIndex) => (
                            <div key={faqIndex} className="space-y-2">
                              <h5 className="font-medium text-sm text-gray-900 flex items-start">
                                <span className="text-blue-600 mr-2 mt-1">Q:</span>
                                {faq.question}
                              </h5>
                              <p className="text-sm text-gray-600 ml-4 leading-relaxed">
                                <span className="text-green-600 mr-2">A:</span>
                                {faq.answer}
                              </p>
                              {faqIndex < category.questions.length - 1 && (
                                <hr className="my-3 border-gray-200" />
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Support Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email Support</span>
                  <span className="font-medium text-green-600">24/7</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>


      </div>
    </div>
  );
}