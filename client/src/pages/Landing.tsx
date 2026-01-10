import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, ShieldCheck, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 font-display">
                Plan Your Leave, <br/>
                <span className="text-primary">Not Just Your Work.</span>
              </h1>
              <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
                The free parental leave financial calculator. Know exactly how much savings you need and plan your return to work with confidence.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/calculator" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full text-lg h-14 px-8 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                    Start Calculation
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Calculator className="w-8 h-8 text-primary" />}
            title="Income Calculator"
            description="Visualize your income gap during leave based on your company's policy."
          />
          <FeatureCard 
            icon={<PiggyBank className="w-8 h-8 text-secondary" />}
            title="Expense Tracker"
            description="Account for new baby costs and see where your budget stands."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8 text-success" />}
            title="Return Scenarios"
            description="Compare full-time vs part-time childcare costs to find your break-even point."
          />
        </div>
      </div>
      
      <footer className="py-12 text-center text-muted-foreground text-sm border-t border-border/50">
        <p>© 2024 LeaveCalc. Built for parents, by parents.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-all">
      <div className="bg-background w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-border/30">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 font-display">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
