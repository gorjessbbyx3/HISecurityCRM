import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-slate-900 to-slate-900"></div>
        <div className="relative">
          {/* Header */}
          <header className="border-b border-slate-800">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center">
                    <i className="fas fa-shield-alt text-gold-500 text-lg"></i>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">Hawaii Security CRM</h1>
                    <p className="text-xs text-slate-400">Crime Watch & Protection Services</p>
                  </div>
                </div>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-gold-500 hover:bg-gold-600 text-black font-medium"
                  data-testid="button-login"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Sign In
                </Button>
              </div>
            </div>
          </header>

          {/* Hero Content */}
          <div className="container mx-auto px-6 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-navy-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-shield-alt text-gold-500 text-3xl"></i>
                </div>
                <h1 className="text-5xl font-bold text-white mb-4" data-testid="text-hero-title">
                  Professional Security <br />
                  <span className="text-gold-500">Management System</span>
                </h1>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto" data-testid="text-hero-description">
                  Comprehensive crime intelligence, patrol management, and client tracking system 
                  designed for Hawaii's security professionals and community watch programs.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-gold-500 hover:bg-gold-600 text-black font-semibold px-8 py-4 text-lg"
                  data-testid="button-get-started"
                >
                  <i className="fas fa-rocket mr-2"></i>
                  Get Started
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black font-semibold px-8 py-4 text-lg"
                  data-testid="button-learn-more"
                >
                  <i className="fas fa-info-circle mr-2"></i>
                  Learn More
                </Button>
              </div>

              {/* Feature badges */}
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-slate-800 text-slate-300 px-4 py-2 rounded-full border border-slate-700">
                  <i className="fas fa-map-marked-alt mr-2 text-gold-500"></i>
                  Crime Intelligence
                </span>
                <span className="bg-slate-800 text-slate-300 px-4 py-2 rounded-full border border-slate-700">
                  <i className="fas fa-route mr-2 text-gold-500"></i>
                  Patrol Management
                </span>
                <span className="bg-slate-800 text-slate-300 px-4 py-2 rounded-full border border-slate-700">
                  <i className="fas fa-users mr-2 text-gold-500"></i>
                  Client Tracking
                </span>
                <span className="bg-slate-800 text-slate-300 px-4 py-2 rounded-full border border-slate-700">
                  <i className="fas fa-hands-helping mr-2 text-gold-500"></i>
                  Community Outreach
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4" data-testid="text-features-title">
              Comprehensive Security Management
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto" data-testid="text-features-description">
              Everything you need to manage security operations, track crime patterns, 
              and serve your community effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Crime Intelligence */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-gold-500/50 transition-colors">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-chart-line text-red-400 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Crime Intelligence</h3>
              <p className="text-slate-400 mb-4">
                Real-time crime mapping, incident tracking, and pattern analysis 
                to stay ahead of security threats.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Interactive crime maps</li>
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Incident reporting</li>
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Trend analysis</li>
              </ul>
            </div>

            {/* Patrol Management */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-gold-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-route text-blue-400 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Patrol Management</h3>
              <p className="text-slate-400 mb-4">
                Smart scheduling, route optimization, and comprehensive 
                patrol reporting with photo documentation.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Staff scheduling</li>
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Daily reports</li>
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Photo uploads</li>
              </ul>
            </div>

            {/* Client & Property Management */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-gold-500/50 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-building text-green-400 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Client & Property Management</h3>
              <p className="text-slate-400 mb-4">
                Comprehensive client database with property details, 
                security notes, and activity tracking.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Client profiles</li>
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Property database</li>
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Activity logs</li>
              </ul>
            </div>

            {/* Hawaii Law Reference */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-gold-500/50 transition-colors">
              <div className="w-12 h-12 bg-gold-500/20 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-gavel text-gold-400 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Hawaii Law Reference</h3>
              <p className="text-slate-400 mb-4">
                Quick access to relevant Hawaii state laws and regulations 
                for security operations and community watch.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Trespassing laws</li>
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Security regulations</li>
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Community guidelines</li>
              </ul>
            </div>

            {/* Community Outreach */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-gold-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-hands-helping text-purple-400 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Community Outreach</h3>
              <p className="text-slate-400 mb-4">
                Resources and programs for community assistance, 
                homeless outreach, and social services coordination.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Shelter locations</li>
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Crisis hotlines</li>
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Outreach programs</li>
              </ul>
            </div>

            {/* Smart Accounting */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-gold-500/50 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-calculator text-cyan-400 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Smart Accounting</h3>
              <p className="text-slate-400 mb-4">
                Easy financial tracking with tax-friendly categorization 
                and automated expense reporting.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Expense tracking</li>
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Tax categories</li>
                <li><i className="fas fa-check text-gold-500 mr-2"></i>Financial reports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-navy-800 to-slate-900">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4" data-testid="text-cta-title">
              Ready to Enhance Your Security Operations?
            </h2>
            <p className="text-xl text-slate-300 mb-8" data-testid="text-cta-description">
              Join Hawaii's leading security professionals using our comprehensive 
              management system to protect communities and serve clients better.
            </p>
            <Button 
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              className="bg-gold-500 hover:bg-gold-600 text-black font-semibold px-12 py-4 text-lg"
              data-testid="button-start-now"
            >
              <i className="fas fa-shield-alt mr-2"></i>
              Start Protecting Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-navy-700 rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-alt text-gold-500"></i>
              </div>
              <div>
                <h3 className="text-white font-semibold">Hawaii Security CRM</h3>
                <p className="text-slate-400 text-sm">Professional Security Management</p>
              </div>
            </div>
            <div className="text-slate-400 text-sm">
              <p>&copy; 2024 Hawaii Security CRM. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
