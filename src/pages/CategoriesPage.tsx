
import { Link } from "react-router-dom";
import { categories } from "@/data/products";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function CategoriesPage() {
  // Additional categories for more variety
  const allCategories = [
    ...categories,
    "Beverages",
    "Canned Goods",
    "Frozen Foods",
    "Condiments",
    "Breakfast",
    "Household",
    "Personal Care"
  ];

  // Images mapping
  const categoryImages: Record<string, string> = {
    Fruits: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2",
    Vegetables: "https://images.unsplash.com/photo-1518843875459-f738682238a6",
    Dairy: "https://images.unsplash.com/photo-1563636619-e9143da7973b",
    Bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
    Meat: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f",
    Seafood: "https://images.unsplash.com/photo-1579173826185-696b45e3b536",
    Grains: "https://images.unsplash.com/photo-1621236378699-8962f1e45a8e",
    Snacks: "https://images.unsplash.com/photo-1599599810694-b5b37304c041",
    Beverages: "https://images.unsplash.com/photo-1550431839-a1e734298e0a",
    "Canned Goods": "https://images.unsplash.com/photo-1531992480828-5180593a8ada",
    "Frozen Foods": "https://images.unsplash.com/photo-1555072956-7758afb20e8f",
    Condiments: "https://images.unsplash.com/photo-1583942457083-0a7a38cb9716",
    Breakfast: "https://images.unsplash.com/photo-1525351484163-7529414344d8",
    Household: "https://images.unsplash.com/photo-1563453392212-326f5e854473",
    "Personal Care": "https://images.unsplash.com/photo-1594202478399-b7f0f0972b90"
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Shop by Category</h1>
      <p className="text-muted-foreground mb-8">
        Browse our wide selection of fresh, organic products by category
      </p>
      
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {allCategories.map((category) => (
          <motion.div key={category} variants={item}>
            <Link 
              to={`/products?category=${category}`}
              className="block group"
            >
              <Card className="overflow-hidden border-border hover:border-freshcart-500 transition-colors">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={categoryImages[category] || "https://images.unsplash.com/photo-1542838132-92c53300491e"}
                    alt={category}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <CardContent className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-xl font-semibold text-white">{category}</h2>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
