import { useNavigate } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { categories } from "@/data/datasets";

const iconBgStyles: Record<string, string> = {
  teal: "bg-primary text-primary-foreground",
  navy: "bg-secondary text-secondary-foreground",
  mint: "gradient-accent text-accent-foreground",
  "teal-dark": "bg-teal-dark text-primary-foreground",
};

const SubscriptionsSection = () => {
  const navigate = useNavigate();

  // Show datasets that have at least one purchased dashboard
  const subscribedDatasets = categories.flatMap((category) =>
    category.datasets
      .filter((dataset) => dataset.dashboards.some((d) => d.purchased))
      .map((dataset) => {
        const purchasedCount = dataset.dashboards.filter((d) => d.purchased).length;
        return {
          ...dataset,
          category: category.title,
          categoryIcon: category.icon,
          categoryColor: category.color,
          purchasedCount,
        };
      })
  );

  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Your Subscriptions
        </h2>
        <p className="text-sm text-muted-foreground">
          Quick access to your purchased datasets
        </p>
      </div>

      {subscribedDatasets.length === 0 ? (
        <Alert className="bg-muted/50 border-muted">
          <Package className="h-4 w-4" />
          <AlertDescription>
            You haven't subscribed to any dataset yet. Check out all datasets below to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {subscribedDatasets.map((dataset, index) => {
            const Icon = dataset.categoryIcon;
            return (
              <Card
                key={dataset.id}
                onClick={() => navigate(`/dataset/${dataset.id}`)}
                className="group cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:border-primary/30 animate-fade-in-up border-primary/20 bg-primary/5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${iconBgStyles[dataset.categoryColor]}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
                        {dataset.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {dataset.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {dataset.purchasedCount} of {dataset.dashboards.length} unlocked
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SubscriptionsSection;
