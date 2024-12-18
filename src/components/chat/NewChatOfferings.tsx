import React, { useState } from 'react';
import { 
  Instagram, 
  Facebook, 
  Linkedin, 
  Twitter, 
  Mail, 
  FileSpreadsheet,
  BarChart3,
  Users,
  Building2,
  ShoppingCart,
  DollarSign,
  PieChart,
  Target,
  TrendingUp,
  MessageSquare,
  Search
} from 'lucide-react';

const tabs = [
  {
    id: 'marketing',
    label: 'Marketing',
    icon: <Target className="w-5 h-5" />,
    offerings: [
      {
        title: 'Instagram Marketing',
        description: 'Create engaging reels and grow your Instagram presence',
        icon: <Instagram className="w-6 h-6" />,
        color: 'from-pink-500 to-purple-500'
      },
      {
        title: 'Facebook Ads',
        description: 'Create targeted ads for the best ROI',
        icon: <Facebook className="w-6 h-6" />,
        color: 'from-blue-500 to-blue-600'
      },
      {
        title: 'LinkedIn Growth',
        description: 'Build your professional network and brand presence with engaging posts',
        icon: <Linkedin className="w-6 h-6" />,
        color: 'from-blue-600 to-blue-700'
      },
      {
        title: 'SEO content generator',
        description: 'Generate the best SEO optimised content for your website',
        icon: <Search className="w-6 h-6" />,
        color: 'from-orange-500 to-red-500'
      }
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: <Building2 className="w-5 h-5" />,
    offerings: [
      {
        title: 'Process Optimization',
        description: 'Streamline your business operations for efficiency',
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'from-green-500 to-emerald-500',
        comingSoon: true
      },
      {
        title: 'Team Management',
        description: 'Improve team collaboration and productivity',
        icon: <Users className="w-6 h-6" />,
        color: 'from-blue-500 to-indigo-500',
        comingSoon: true
      }
    ]
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: <DollarSign className="w-5 h-5" />,
    offerings: [
      {
        title: 'Financial Analysis',
        description: 'Get insights into your financial performance',
        icon: <PieChart className="w-6 h-6" />,
        color: 'from-purple-500 to-violet-500',
        comingSoon: true
      },
      {
        title: 'Expense Tracking',
        description: 'Monitor and optimize your business expenses',
        icon: <FileSpreadsheet className="w-6 h-6" />,
        color: 'from-cyan-500 to-blue-500',
        comingSoon: true
      }
    ]
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: <ShoppingCart className="w-5 h-5" />,
    offerings: [
      {
        title: 'Sales Strategy',
        description: 'Develop effective sales strategies and tactics',
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'from-red-500 to-pink-500',
        comingSoon: true
      },
      {
        title: 'Lead Generation',
        description: 'Generate and nurture quality sales leads',
        icon: <MessageSquare className="w-6 h-6" />,
        color: 'from-yellow-500 to-orange-500',
        comingSoon: true
      }
    ]
  }
];

interface NewChatOfferingsProps {
  onSelect: (topic: string) => void;
  autoSend?: boolean;
}

const NewChatOfferings: React.FC<NewChatOfferingsProps> = ({ onSelect, autoSend = true }) => {
  const [activeTab, setActiveTab] = useState('marketing');

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-2">Welcome to Hanu.ai</h2>
      <p className="text-gray-400 mb-8">Choose a category to get started with AI-powered business solutions</p>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Offerings Grid */}
      <div className="grid grid-cols-2 gap-4">
        {tabs.find(tab => tab.id === activeTab)?.offerings.map((offering, index) => (
          <button
            key={index}
            onClick={() => {
              onSelect(offering.comingSoon ? 'general' : offering.title);
              if (autoSend) {
                // Add a small delay to ensure the message is set before sending
                setTimeout(() => {
                  const sendButton = document.querySelector('button[aria-label="Send message"]');
                  if (sendButton instanceof HTMLButtonElement) {
                    sendButton.click();
                  }
                }, 100);
              }
            }}
            className="relative flex items-start gap-4 p-6 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600/50 transition-all group"
          >
            {offering.comingSoon && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-gray-700 text-xs font-medium text-gray-300">
                Coming Soon
              </div>
            )}
            <div className={`shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${offering.color} flex items-center justify-center`}>
              {offering.icon}
            </div>
            <div className="text-left">
              <h3 className="font-medium text-lg text-white mb-1 group-hover:text-blue-400 transition-colors">
                {offering.title}
              </h3>
              <p className="text-sm text-gray-400">
                {offering.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NewChatOfferings; 