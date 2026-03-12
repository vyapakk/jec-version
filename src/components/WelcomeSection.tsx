import { TrendingUp, Database, BarChart3 } from "lucide-react";

const WelcomeSection = () => {
  const stats = [
    { icon: Database, label: "Datasets", value: "24+" },
    { icon: BarChart3, label: "Dashboards", value: "150+" },
    { icon: TrendingUp, label: "Data Points", value: "1M+" },
  ];

  return (
    <section className="relative overflow-hidden gradient-hero py-8 md:py-12 px-4 md:px-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-primary blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground font-display">
              Welcome back, John
            </h1>
            <p className="text-primary-foreground/70 max-w-lg mx-auto md:mx-0">
              Access comprehensive market research data across industries.
              Explore datasets and interactive dashboards below.
            </p>
          </div>

          <div className="md:shrink-0 grid grid-cols-3 gap-3 md:flex md:gap-6 w-full md:w-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center p-3 md:p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10"
              >
                <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-accent mb-1.5 md:mb-2" />
                <span className="text-lg md:text-2xl font-bold text-primary-foreground font-display">
                  {stat.value}
                </span>
                <span className="text-[10px] md:text-xs text-primary-foreground/60">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
