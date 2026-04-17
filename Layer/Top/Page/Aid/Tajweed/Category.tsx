import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { getTajweedCategoryDetail } from "@/Bottom/API/Aid";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";

export default function TajweedCategory() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = getTajweedCategoryDetail(categoryId || "");

  if (!category) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground mb-4">Category not found</p>
          <Link to="/Aid/Tajweed">
            <Button className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Back to Tajweed
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 max-w-4xl mx-auto px-4">
        <Container className="!p-5 mb-6">
          <h1 className="text-2xl font-bold">{category.name}</h1>
        </Container>

        {category.hasSubfolders ? (
          // Show subfolders
          <div className="space-y-3">
            {category.subfolders.map((folder) => (
              <Link key={folder.id} to={`/Aid/Tajweed/${category.id}/${folder.id}`} className="block">
                <Button className="!p-5 w-full !justify-start !text-left" fullWidth>
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold">{folder.name}</h3>
                    </div>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        ) : (
          // Show direct subcategories (JSON files)
          <div className="space-y-3">
            {category.subcategories.map((sub) => (
              <Link key={sub.id} to={`/Aid/Tajweed/${category.id}/${sub.id}`} className="block">
                <Button className="!p-5 w-full !justify-start !text-left" fullWidth>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{sub.name}</h3>
                      {sub.arabicName && (
                        <span className="font-arabic text-sm text-muted-foreground" dir="rtl">
                          {sub.arabicName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{sub.description}</p>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}