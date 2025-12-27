import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    description: ''
  });

  const categories = [
    { id: 'all', label: 'All Topics', icon: 'menu_book', count: 24 },
    { id: 'getting-started', label: 'Getting Started', icon: 'rocket_launch', count: 6 },
    { id: 'inventory', label: 'Inventory Management', icon: 'inventory_2', count: 8 },
    { id: 'orders', label: 'Orders & Suppliers', icon: 'shopping_cart', count: 5 },
    { id: 'reports', label: 'Reports & Analytics', icon: 'bar_chart', count: 5 }
  ];

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I add a new product to inventory?',
      answer: 'Navigate to the "Add New Product" section from the sidebar. Fill in the required details including product name, SKU, category, and initial stock quantity. Click "Save Product" to add it to your inventory.'
    },
    {
      category: 'getting-started',
      question: 'How to set up user permissions?',
      answer: 'Go to User Management in the Administration section. Select a user and click "Edit Permissions". You can assign roles like Admin, Manager, or Staff with different access levels.'
    },
    {
      category: 'inventory',
      question: 'What is the difference between low stock and critical stock levels?',
      answer: 'Low stock is a warning threshold that suggests reordering soon. Critical stock is an urgent alert indicating immediate action is needed to prevent stockouts.'
    },
    {
      category: 'inventory',
      question: 'How do I track batch/lot numbers?',
      answer: 'Enable batch tracking in product settings. When receiving stock, you can assign batch numbers which will be tracked throughout the product lifecycle.'
    },
    {
      category: 'orders',
      question: 'How to create a purchase order?',
      answer: 'Go to the Orders section and click "New Order". Select the supplier, add products and quantities, set the expected delivery date, and submit. You can track the order status in real-time.'
    },
    {
      category: 'orders',
      question: 'How do I manage supplier information?',
      answer: 'Navigate to the Suppliers section. You can add new suppliers with contact details, view their product catalog, and create purchase orders directly from their profile.'
    },
    {
      category: 'reports',
      question: 'What reports are available?',
      answer: 'IMRAS provides inventory valuation reports, stock movement reports, reorder reports, supplier performance reports, and custom date-range analytics.'
    },
    {
      category: 'reports',
      question: 'Can I export reports?',
      answer: 'Yes, all reports can be exported in PDF, Excel, or CSV formats. Click the export button in the top-right corner of any report page.'
    }
  ];

  const quickLinks = [
    { icon: 'video_library', title: 'Video Tutorials', description: 'Watch step-by-step guides', link: '#' },
    { icon: 'article', title: 'Documentation', description: 'Comprehensive user manual', link: '#' },
    { icon: 'forum', title: 'Community Forum', description: 'Connect with other users', link: '#' },
    { icon: 'contact_support', title: 'Contact Support', description: 'Get help from our team', link: '#' }
  ];

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    alert('Support ticket submitted successfully! We\'ll get back to you within 24 hours.');
    setSupportForm({ subject: '', category: 'technical', priority: 'medium', description: '' });
  };

  return (
    <DashboardLayout title="Help & Support">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-[#0d121b] dark:text-white mb-2">
            How can we help you?
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Search our knowledge base or contact support
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto w-full">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search for help articles, FAQs, tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.link}
              className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary text-[32px]">
                    {link.icon}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0d121b] dark:text-white mb-1">
                    {link.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {link.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 px-2">
                Categories
              </h3>
              <nav className="flex flex-col gap-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      selectedCategory === category.id
                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {category.icon}
                    </span>
                    <span className="text-sm font-medium flex-1">{category.label}</span>
                    <span className="text-xs font-bold bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* FAQs Content */}
          <div className="lg:col-span-2">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">
                  Frequently Asked Questions
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Find answers to common questions
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <details
                      key={index}
                      className="group bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <summary className="flex items-center justify-between cursor-pointer p-4 font-medium text-[#0d121b] dark:text-white hover:text-primary transition-colors list-none">
                        <span className="text-sm font-semibold">{faq.question}</span>
                        <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">
                          expand_more
                        </span>
                      </summary>
                      <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support Form */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-primary">support_agent</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">
                  Submit a Support Ticket
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Can't find what you're looking for? Our team is here to help
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSupportSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={supportForm.subject}
                  onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={supportForm.category}
                  onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <div className="flex gap-3">
                {['low', 'medium', 'high', 'urgent'].map((priority) => (
                  <label
                    key={priority}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-all ${
                      supportForm.priority === priority
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      checked={supportForm.priority === priority}
                      onChange={(e) => setSupportForm({ ...supportForm, priority: e.target.value })}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium capitalize">{priority}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                required
                value={supportForm.description}
                onChange={(e) => setSupportForm({ ...supportForm, description: e.target.value })}
                placeholder="Please provide detailed information about your issue..."
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Average response time: <span className="font-semibold">24 hours</span>
              </p>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                Submit Ticket
              </button>
            </div>
          </form>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg inline-flex mb-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[32px]">
                mail
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#0d121b] dark:text-white mb-1">Email Support</h3>
            <p className="text-sm text-primary hover:underline cursor-pointer">support@imras.com</p>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg inline-flex mb-3">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[32px]">
                call
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#0d121b] dark:text-white mb-1">Phone Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg inline-flex mb-3">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-[32px]">
                schedule
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#0d121b] dark:text-white mb-1">Business Hours</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Mon-Fri, 9AM-6PM EST</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpSupport;
