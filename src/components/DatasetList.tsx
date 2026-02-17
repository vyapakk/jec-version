import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Lock, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Dashboard {
  id: string;
  name: string;
}

interface Dataset {
  id: string;
  name: string;
  dashboards: (Dashboard & { purchased: boolean })[];
}

interface Category {
  id: string;
  title: string;
  icon: LucideIcon;
  color: "teal" | "navy" | "mint" | "teal-dark";
  description: string;
  datasets: Dataset[];
}

interface DatasetListProps {
  categories: Category[];
  activeTab: string;
}

const iconBgStyles: Record<string, string> = {
  teal: "bg-primary text-primary-foreground",
  navy: "bg-secondary text-secondary-foreground",
  mint: "gradient-accent text-accent-foreground",
  "teal-dark": "bg-teal-dark text-primary-foreground",
};

const DatasetList = ({ categories, activeTab }: DatasetListProps) => {
  const navigate = useNavigate();

  const filteredCategories =
    activeTab === "all"
      ? categories
      : categories.filter((cat) => cat.id === activeTab);

  const datasetsWithCategory = filteredCategories.flatMap((category) =>
    category.datasets.map((dataset) => ({
      ...dataset,
      category: category.title,
      categoryIcon: category.icon,
      categoryColor: category.color,
    }))
  );

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {datasetsWithCategory.map((dataset, index) => {
        const Icon = dataset.categoryIcon;
        const isLocked = !dataset.dashboards.some((d) => d.purchased);
        return (
          <Card
            key={dataset.id}
            onClick={() => navigate(`/dataset/${dataset.id}`)}
            className="group cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:border-primary/30 animate-fade-in-up"
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
                      {dataset.dashboards.length} dashboards
                    </span>
                  </div>
                </div>
                {isLocked ? (
                  <Lock className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DatasetList;
